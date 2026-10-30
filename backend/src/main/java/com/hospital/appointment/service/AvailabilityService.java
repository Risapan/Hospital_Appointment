package com.hospital.appointment.service;

import com.hospital.appointment.dto.AvailabilityDto;
import com.hospital.appointment.dto.BlockedPeriodDto;
import com.hospital.appointment.dto.TimeSlotDto;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import com.hospital.appointment.model.Availability;
import com.hospital.appointment.model.BlockedPeriod;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.AvailabilityRepository;
import com.hospital.appointment.repository.BlockedPeriodRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final BlockedPeriodRepository blockedPeriodRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository,
                               BlockedPeriodRepository blockedPeriodRepository,
                               AppointmentRepository appointmentRepository,
                               DoctorProfileRepository doctorProfileRepository) {
        this.availabilityRepository = availabilityRepository;
        this.blockedPeriodRepository = blockedPeriodRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public List<AvailabilityDto> getDoctorAvailabilities(String doctorId) {
        String resolvedId = resolveDoctorId(doctorId);
        return availabilityRepository.findByDoctorIdAndActive(resolvedId, true).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AvailabilityDto> saveDoctorAvailabilities(String doctorId, List<AvailabilityDto> dtos) {
        String resolvedId = resolveDoctorId(doctorId);
        availabilityRepository.deleteByDoctorId(resolvedId);

        List<Availability> toSave = dtos.stream().map(dto -> {
            Availability a = new Availability(
                    resolvedId,
                    dto.getDayOfWeek(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    dto.getSlotDurationMinutes() > 0 ? dto.getSlotDurationMinutes() : 30
            );
            a.setActive(dto.isActive());
            return a;
        }).collect(Collectors.toList());

        return availabilityRepository.saveAll(toSave).stream().map(this::toDto).collect(Collectors.toList());
    }

    public BlockedPeriodDto addBlockedPeriod(String doctorId, BlockedPeriodDto dto) {
        String resolvedId = resolveDoctorId(doctorId);
        BlockedPeriod bp = new BlockedPeriod(
                resolvedId,
                dto.getStartDateTime(),
                dto.getEndDateTime(),
                dto.getReasonCategory(),
                dto.getReasonNote()
        );
        BlockedPeriod saved = blockedPeriodRepository.save(bp);
        return toBlockedDto(saved);
    }

    public List<BlockedPeriodDto> getDoctorBlockedPeriods(String doctorId) {
        String resolvedId = resolveDoctorId(doctorId);
        return blockedPeriodRepository.findByDoctorId(resolvedId).stream()
                .map(this::toBlockedDto)
                .collect(Collectors.toList());
    }

    public void deleteBlockedPeriod(String id) {
        blockedPeriodRepository.deleteById(id);
    }

    public List<TimeSlotDto> getAvailableSlots(String doctorId, LocalDate date) {
        String resolvedId = resolveDoctorId(doctorId);
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        Availability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndActive(resolvedId, dayOfWeek, true)
                .orElse(null);

        if (availability == null) {
            return Collections.emptyList();
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

        // Fetch existing active appointments for the day
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndStartDateTimeBetweenAndStatusNot(
                        resolvedId, dayStart, dayEnd, AppointmentStatus.CANCELLED);

        Set<LocalDateTime> bookedStartTimes = bookedAppointments.stream()
                .map(Appointment::getStartDateTime)
                .collect(Collectors.toSet());

        // Fetch blocked periods covering this day
        List<BlockedPeriod> blockedPeriods = blockedPeriodRepository
                .findByDoctorIdAndEndDateTimeAfterAndStartDateTimeBefore(resolvedId, dayStart, dayEnd);

        int duration = availability.getSlotDurationMinutes();
        LocalTime current = availability.getStartTime();
        LocalTime closing = availability.getEndTime();

        List<TimeSlotDto> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        while (current.plusMinutes(duration).isBefore(closing) || current.plusMinutes(duration).equals(closing)) {
            LocalDateTime slotStart = date.atTime(current);
            LocalDateTime slotEnd = slotStart.plusMinutes(duration);

            boolean inPast = slotStart.isBefore(now);
            boolean isBooked = bookedStartTimes.contains(slotStart);
            boolean isBlocked = isPeriodBlocked(slotStart, slotEnd, blockedPeriods);

            if (inPast) {
                slots.add(new TimeSlotDto(slotStart, slotEnd, false, "Past"));
            } else if (isBlocked) {
                slots.add(new TimeSlotDto(slotStart, slotEnd, false, "Doctor Unavailable"));
            } else if (isBooked) {
                slots.add(new TimeSlotDto(slotStart, slotEnd, false, "Booked"));
            } else {
                slots.add(new TimeSlotDto(slotStart, slotEnd, true));
            }

            current = current.plusMinutes(duration);
        }

        return slots;
    }

    private boolean isPeriodBlocked(LocalDateTime start, LocalDateTime end, List<BlockedPeriod> blockedPeriods) {
        for (BlockedPeriod bp : blockedPeriods) {
            if (start.isBefore(bp.getEndDateTime()) && end.isAfter(bp.getStartDateTime())) {
                return true;
            }
        }
        return false;
    }

    private String resolveDoctorId(String doctorIdOrUserId) {
        return doctorProfileRepository.findById(doctorIdOrUserId)
                .map(DoctorProfile::getId)
                .or(() -> doctorProfileRepository.findByUserId(doctorIdOrUserId).map(DoctorProfile::getId))
                .orElse(doctorIdOrUserId);
    }

    private AvailabilityDto toDto(Availability a) {
        AvailabilityDto dto = new AvailabilityDto();
        dto.setId(a.getId());
        dto.setDoctorId(a.getDoctorId());
        dto.setDayOfWeek(a.getDayOfWeek());
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        dto.setSlotDurationMinutes(a.getSlotDurationMinutes());
        dto.setActive(a.isActive());
        return dto;
    }

    private BlockedPeriodDto toBlockedDto(BlockedPeriod bp) {
        BlockedPeriodDto dto = new BlockedPeriodDto();
        dto.setId(bp.getId());
        dto.setDoctorId(bp.getDoctorId());
        dto.setStartDateTime(bp.getStartDateTime());
        dto.setEndDateTime(bp.getEndDateTime());
        dto.setReasonCategory(bp.getReasonCategory());
        dto.setReasonNote(bp.getReasonNote());
        return dto;
    }
}
