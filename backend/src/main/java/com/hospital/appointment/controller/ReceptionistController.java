package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AppointmentRequest;
import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.RegisterRequest;
import com.hospital.appointment.exception.BadRequestException;
import com.hospital.appointment.model.PatientProfile;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.PatientProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receptionist")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
public class ReceptionistController {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public ReceptionistController(UserRepository userRepository,
                                  PatientProfileRepository patientProfileRepository,
                                  AppointmentService appointmentService,
                                  AppointmentRepository appointmentRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.appointmentService = appointmentService;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/patients")
    public ResponseEntity<List<User>> searchPatients(@RequestParam(required = false) String query) {
        List<User> patients = userRepository.findByRole(Role.PATIENT);
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            patients = patients.stream()
                    .filter(p -> (p.getFullName() != null && p.getFullName().toLowerCase().contains(q))
                            || (p.getEmail() != null && p.getEmail().toLowerCase().contains(q))
                            || (p.getPhoneNumber() != null && p.getPhoneNumber().contains(q)))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(patients);
    }

    @PostMapping("/patients")
    public ResponseEntity<User> registerWalkInPatient(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("A patient with this email already exists");
        }

        String nic = request.getNic() != null && !request.getNic().isBlank()
                ? request.getNic().trim().toUpperCase() : null;
        if (nic != null && patientProfileRepository.existsByNic(nic)) {
            throw new BadRequestException("A patient with this NIC number already exists");
        }

        String password = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : "carepoint2026";

        User patient = new User(
                request.getFullName(),
                email,
                passwordEncoder.encode(password),
                request.getPhoneNumber(),
                Role.PATIENT
        );
        User saved = userRepository.save(patient);

        PatientProfile profile = new PatientProfile(saved.getId());
        profile.setNic(nic);
        patientProfileRepository.save(profile);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponse> bookForPatient(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return new ResponseEntity<>(appointmentService.bookAppointment(request, currentUser), HttpStatus.CREATED);
    }

    @GetMapping("/daily-schedule")
    public ResponseEntity<List<AppointmentResponse>> getDailySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        LocalDateTime start = target.atStartOfDay();
        LocalDateTime end = target.atTime(LocalTime.MAX);

        // Fetch appointments for this day
        List<com.hospital.appointment.model.Appointment> list = appointmentRepository.findByStartDateTimeBetweenOrderByStartDateTimeAsc(start, end);
        // Enrich
        return ResponseEntity.ok(appointmentService.getAllAppointments().stream()
                .filter(a -> a.getStartDateTime().toLocalDate().equals(target))
                .collect(Collectors.toList()));
    }
}
