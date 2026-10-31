package com.hospital.appointment.service;

import com.hospital.appointment.dto.AppointmentRequest;
import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.CancelRequest;
import com.hospital.appointment.dto.RescheduleRequest;
import com.hospital.appointment.dto.StatusUpdateRequest;
import com.hospital.appointment.dto.TimeSlotDto;
import com.hospital.appointment.exception.BadRequestException;
import com.hospital.appointment.exception.ConflictException;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.exception.UnauthorizedException;
import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import com.hospital.appointment.model.Department;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.Hospital;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DepartmentRepository;
import com.hospital.appointment.repository.HospitalRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserDetailsImpl;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorProfileRepository doctorProfileRepository,
                              DepartmentRepository departmentRepository,
                              HospitalRepository hospitalRepository,
                              UserRepository userRepository,
                              AvailabilityService availabilityService,
                              NotificationService notificationService,
                              AuditService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.departmentRepository = departmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.userRepository = userRepository;
        this.availabilityService = availabilityService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    /**
     * The hospital is the patient's preference: East Care Point makes the reservation there on their behalf.
     * Without a choice we fall back to the doctor's own hospital when there is exactly one.
     */
    private String resolveHospital(String requestedHospitalId, DoctorProfile doctor) {
        if (requestedHospitalId == null || requestedHospitalId.isBlank()) {
            if (doctor.getHospitalIds().size() == 1) {
                return doctor.getHospitalIds().get(0);
            }
            throw new BadRequestException("Please choose the hospital you would like to book through.");
        }
        Hospital hospital = hospitalRepository.findById(requestedHospitalId)
                .orElseThrow(() -> new BadRequestException("The selected hospital was not found."));
        if (!hospital.isActive()) {
            throw new BadRequestException("The selected hospital is not taking bookings right now.");
        }
        return hospital.getId();
    }

    public AppointmentResponse bookAppointment(AppointmentRequest request, UserDetailsImpl currentUser) {
        // 1. Determine patient ID
        String patientId;
        if (currentUser.getRole() == Role.PATIENT) {
            patientId = currentUser.getId();
        } else if (currentUser.getRole() == Role.RECEPTIONIST || currentUser.getRole() == Role.ADMIN) {
            if (request.getPatientId() == null || request.getPatientId().isBlank()) {
                throw new BadRequestException("Patient ID is required when booking as staff");
            }
            patientId = request.getPatientId();
        } else {
            throw new UnauthorizedException("Doctors cannot book appointments for patients");
        }

        // Verify patient exists
        User patientUser = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient account not found"));

        // 2. Validate Doctor
        DoctorProfile doctorProfile = doctorProfileRepository.findById(request.getDoctorId())
                .or(() -> doctorProfileRepository.findByUserId(request.getDoctorId()))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctorProfile.isActive()) {
            throw new BadRequestException("Doctor is currently inactive for appointments");
        }

        User doctorUser = userRepository.findById(doctorProfile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user account not found"));

        // 3. Validate Date & Time
        LocalDateTime start = request.getStartDateTime();
        if (start.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        int duration = doctorProfile.getConsultationDurationMinutes();
        LocalDateTime end = start.plusMinutes(duration);

        // 4. Verify slot availability via AvailabilityService
        LocalDate date = start.toLocalDate();
        List<TimeSlotDto> availableSlots = availabilityService.getAvailableSlots(doctorProfile.getId(), date);
        boolean slotValid = availableSlots.stream()
                .anyMatch(s -> s.isAvailable() && s.getStartDateTime().equals(start));

        if (!slotValid) {
            throw new ConflictException("The selected time slot is not available for this doctor");
        }

        // 5. Build and save Appointment with concurrency-safe activeSlotKey
        String deptId = request.getDepartmentId() != null && !request.getDepartmentId().isBlank()
                ? request.getDepartmentId() : doctorProfile.getDepartmentId();

        Appointment appointment = new Appointment(
                patientId,
                doctorProfile.getId(),
                deptId,
                start,
                end,
                request.getReasonForVisit()
        );
        appointment.setPatientNotes(request.getPatientNotes());
        appointment.setHospitalId(resolveHospital(request.getHospitalId(), doctorProfile));
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        try {
            Appointment saved = appointmentRepository.save(appointment);

            // Send In-App Notifications
            notificationService.createNotification(
                    patientId,
                    "BOOKING_CONFIRMED",
                    "Appointment Confirmed",
                    "Your appointment with Dr. " + doctorUser.getFullName() + " on " + start.toLocalDate() + " at " + start.toLocalTime() + " is confirmed.",
                    saved.getId()
            );

            notificationService.createNotification(
                    doctorProfile.getUserId(),
                    "NEW_APPOINTMENT",
                    "New Appointment Booked",
                    "Patient " + patientUser.getFullName() + " booked an appointment on " + start.toLocalDate() + " at " + start.toLocalTime() + ".",
                    saved.getId()
            );

            // Audit log
            auditService.log(
                    currentUser.getId(),
                    currentUser.getUsername(),
                    "BOOK_APPOINTMENT",
                    "Appointment",
                    saved.getId(),
                    "SUCCESS",
                    "Booked slot for patient " + patientUser.getFullName() + " with Dr. " + doctorUser.getFullName()
            );

            return toResponseDto(saved, patientUser, doctorUser, doctorProfile);
        } catch (DuplicateKeyException e) {
            throw new ConflictException("The selected slot was just reserved by another patient. Please choose another time.");
        }
    }

    public List<AppointmentResponse> getMyAppointments(UserDetailsImpl currentUser) {
        List<Appointment> list;
        if (currentUser.getRole() == Role.PATIENT) {
            list = appointmentRepository.findByPatientIdOrderByStartDateTimeDesc(currentUser.getId());
        } else if (currentUser.getRole() == Role.DOCTOR) {
            DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (dp == null) return new ArrayList<>();
            list = appointmentRepository.findByDoctorIdOrderByStartDateTimeDesc(dp.getId());
        } else {
            list = appointmentRepository.findAllByOrderByStartDateTimeDesc(null).getContent();
        }

        return enrichAppointments(list);
    }

    public AppointmentResponse getAppointmentById(String id, UserDetailsImpl currentUser) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Ownership authorization check
        if (currentUser.getRole() == Role.PATIENT && !apt.getPatientId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You cannot view another patient's appointment");
        } else if (currentUser.getRole() == Role.DOCTOR) {
            DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (dp == null || !apt.getDoctorId().equals(dp.getId())) {
                throw new UnauthorizedException("You cannot view another doctor's appointment");
            }
        }

        return enrichSingle(apt);
    }

    public AppointmentResponse cancelAppointment(String id, CancelRequest request, UserDetailsImpl currentUser) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (apt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        if (apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }

        // Ownership check
        if (currentUser.getRole() == Role.PATIENT && !apt.getPatientId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to cancel this appointment");
        } else if (currentUser.getRole() == Role.DOCTOR) {
            DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (dp == null || !apt.getDoctorId().equals(dp.getId())) {
                throw new UnauthorizedException("You are not authorized to cancel this appointment");
            }
        }

        apt.setStatus(AppointmentStatus.CANCELLED); // Automatically clears activeSlotKey
        apt.setCancelledBy(currentUser.getId());
        apt.setCancellationReason(request.getReason() != null ? request.getReason() : "Cancelled by user");

        Appointment saved = appointmentRepository.save(apt);

        // Notify patient & doctor
        notificationService.createNotification(
                apt.getPatientId(),
                "APPOINTMENT_CANCELLED",
                "Appointment Cancelled",
                "Your appointment on " + apt.getStartDateTime().toLocalDate() + " has been cancelled.",
                saved.getId()
        );

        DoctorProfile docProfile = doctorProfileRepository.findById(apt.getDoctorId()).orElse(null);
        if (docProfile != null) {
            notificationService.createNotification(
                    docProfile.getUserId(),
                    "APPOINTMENT_CANCELLED",
                    "Appointment Cancelled",
                    "The appointment on " + apt.getStartDateTime().toLocalDate() + " at " + apt.getStartDateTime().toLocalTime() + " was cancelled.",
                    saved.getId()
            );
        }

        auditService.log(
                currentUser.getId(),
                currentUser.getUsername(),
                "CANCEL_APPOINTMENT",
                "Appointment",
                saved.getId(),
                "SUCCESS",
                "Cancelled appointment. Reason: " + apt.getCancellationReason()
        );

        return enrichSingle(saved);
    }

    public AppointmentResponse rescheduleAppointment(String id, RescheduleRequest request, UserDetailsImpl currentUser) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (apt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cancelled appointments cannot be rescheduled. Please book a new appointment.");
        }

        if (currentUser.getRole() == Role.PATIENT && !apt.getPatientId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to reschedule this appointment");
        }

        LocalDateTime newStart = request.getNewStartDateTime();
        if (newStart.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("New appointment date must be in the future");
        }

        DoctorProfile dp = doctorProfileRepository.findById(apt.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        // Check new slot validity
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(dp.getId(), newStart.toLocalDate());
        boolean valid = slots.stream().anyMatch(s -> s.isAvailable() && s.getStartDateTime().equals(newStart));
        if (!valid) {
            throw new ConflictException("The newly selected slot is unavailable");
        }

        // Apply new time
        int duration = dp.getConsultationDurationMinutes();
        apt.setStartDateTime(newStart);
        apt.setEndDateTime(newStart.plusMinutes(duration));
        apt.setStatus(AppointmentStatus.CONFIRMED);
        apt.setActiveSlotKey(dp.getId() + "_" + newStart);

        try {
            Appointment saved = appointmentRepository.save(apt);

            notificationService.createNotification(
                    apt.getPatientId(),
                    "APPOINTMENT_RESCHEDULED",
                    "Appointment Rescheduled",
                    "Your appointment has been rescheduled to " + newStart.toLocalDate() + " at " + newStart.toLocalTime() + ".",
                    saved.getId()
            );

            auditService.log(
                    currentUser.getId(),
                    currentUser.getUsername(),
                    "RESCHEDULE_APPOINTMENT",
                    "Appointment",
                    saved.getId(),
                    "SUCCESS",
                    "Rescheduled to " + newStart
            );

            return enrichSingle(saved);
        } catch (DuplicateKeyException e) {
            throw new ConflictException("The selected reschedule slot has just been taken. Please choose another time.");
        }
    }

    public AppointmentResponse updateStatus(String id, StatusUpdateRequest request, UserDetailsImpl currentUser) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        apt.setStatus(request.getStatus());
        if (request.getDoctorNotes() != null) {
            apt.setDoctorNotes(request.getDoctorNotes());
        }

        Appointment saved = appointmentRepository.save(apt);

        notificationService.createNotification(
                apt.getPatientId(),
                "STATUS_UPDATED",
                "Appointment Status Updated",
                "Your appointment status is now: " + request.getStatus(),
                saved.getId()
        );

        auditService.log(
                currentUser.getId(),
                currentUser.getUsername(),
                "UPDATE_STATUS",
                "Appointment",
                saved.getId(),
                "SUCCESS",
                "Status set to " + request.getStatus()
        );

        return enrichSingle(saved);
    }

    public List<AppointmentResponse> getDoctorAppointments(String doctorId) {
        DoctorProfile dp = doctorProfileRepository.findById(doctorId)
                .or(() -> doctorProfileRepository.findByUserId(doctorId))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        List<Appointment> list = appointmentRepository.findByDoctorIdOrderByStartDateTimeDesc(dp.getId());
        return enrichAppointments(list);
    }

    public List<AppointmentResponse> getAllAppointments() {
        List<Appointment> list = appointmentRepository.findAll();
        return enrichAppointments(list);
    }

    private List<AppointmentResponse> enrichAppointments(List<Appointment> list) {
        if (list.isEmpty()) return new ArrayList<>();

        List<String> patientIds = list.stream().map(Appointment::getPatientId).distinct().collect(Collectors.toList());
        List<String> docProfileIds = list.stream().map(Appointment::getDoctorId).distinct().collect(Collectors.toList());
        List<String> deptIds = list.stream().map(Appointment::getDepartmentId).distinct().collect(Collectors.toList());

        Map<String, User> patientMap = userRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Map<String, DoctorProfile> docProfileMap = doctorProfileRepository.findAllById(docProfileIds).stream()
                .collect(Collectors.toMap(DoctorProfile::getId, dp -> dp));

        List<String> docUserIds = docProfileMap.values().stream().map(DoctorProfile::getUserId).distinct().collect(Collectors.toList());
        Map<String, User> docUserMap = userRepository.findAllById(docUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Map<String, Department> deptMap = departmentRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(Department::getId, d -> d));

        List<AppointmentResponse> responses = new ArrayList<>();
        for (Appointment apt : list) {
            User patient = patientMap.get(apt.getPatientId());
            DoctorProfile docProfile = docProfileMap.get(apt.getDoctorId());
            User docUser = docProfile != null ? docUserMap.get(docProfile.getUserId()) : null;
            Department dept = deptMap.get(apt.getDepartmentId());

            responses.add(buildResponse(apt, patient, docUser, docProfile, dept));
        }

        return responses;
    }

    private AppointmentResponse enrichSingle(Appointment apt) {
        User patient = userRepository.findById(apt.getPatientId()).orElse(null);
        DoctorProfile docProfile = doctorProfileRepository.findById(apt.getDoctorId()).orElse(null);
        User docUser = docProfile != null ? userRepository.findById(docProfile.getUserId()).orElse(null) : null;
        Department dept = apt.getDepartmentId() != null ? departmentRepository.findById(apt.getDepartmentId()).orElse(null) : null;

        return buildResponse(apt, patient, docUser, docProfile, dept);
    }

    private AppointmentResponse toResponseDto(Appointment apt, User patient, User doctor, DoctorProfile profile) {
        Department dept = apt.getDepartmentId() != null ? departmentRepository.findById(apt.getDepartmentId()).orElse(null) : null;
        return buildResponse(apt, patient, doctor, profile, dept);
    }

    private AppointmentResponse buildResponse(Appointment apt, User patient, User docUser, DoctorProfile docProfile, Department dept) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(apt.getId());
        res.setPatientId(apt.getPatientId());
        res.setPatientName(patient != null ? patient.getFullName() : "Unknown Patient");
        res.setPatientEmail(patient != null ? patient.getEmail() : "");
        res.setPatientPhone(patient != null ? patient.getPhoneNumber() : "");

        res.setDoctorId(apt.getDoctorId());
        res.setDoctorName(docUser != null ? docUser.getFullName() : "Dr. Unknown");
        res.setDoctorSpecialty(docProfile != null ? docProfile.getSpecialty() : "");
        res.setRoomNumber(docProfile != null ? docProfile.getRoomNumber() : "");

        res.setDepartmentId(apt.getDepartmentId());
        res.setDepartmentName(dept != null ? dept.getName() : "");

        String hospitalId = apt.getHospitalId() != null ? apt.getHospitalId()
                : (docProfile != null && !docProfile.getHospitalIds().isEmpty() ? docProfile.getHospitalIds().get(0) : null);
        Hospital hospital = hospitalId != null ? hospitalRepository.findById(hospitalId).orElse(null) : null;
        res.setHospitalId(hospitalId);
        res.setHospitalName(hospital != null ? hospital.getName() : (docProfile != null ? docProfile.getHospitalName() : null));
        res.setHospitalAddress(hospital != null ? hospital.getAddress() : null);
        res.setHospitalPhone(hospital != null ? hospital.getPhone() : null);

        res.setStartDateTime(apt.getStartDateTime());
        res.setEndDateTime(apt.getEndDateTime());
        res.setStatus(apt.getStatus());
        res.setReasonForVisit(apt.getReasonForVisit());
        res.setPatientNotes(apt.getPatientNotes());
        res.setDoctorNotes(apt.getDoctorNotes());
        res.setCancelledBy(apt.getCancelledBy());
        res.setCancellationReason(apt.getCancellationReason());
        res.setCreatedAt(apt.getCreatedAt());
        res.setUpdatedAt(apt.getUpdatedAt());
        return res;
    }
}
