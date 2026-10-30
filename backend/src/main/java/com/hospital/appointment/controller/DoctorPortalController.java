package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.AvailabilityDto;
import com.hospital.appointment.dto.BlockedPeriodDto;
import com.hospital.appointment.dto.DoctorDto;
import com.hospital.appointment.dto.StatusUpdateRequest;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.appointment.service.AvailabilityService;
import com.hospital.appointment.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPortalController {

    private final DoctorService doctorService;
    private final AvailabilityService availabilityService;
    private final AppointmentService appointmentService;
    private final DoctorProfileRepository doctorProfileRepository;

    public DoctorPortalController(DoctorService doctorService,
                                  AvailabilityService availabilityService,
                                  AppointmentService appointmentService,
                                  DoctorProfileRepository doctorProfileRepository) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
        this.appointmentService = appointmentService;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<DoctorDto> getProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(currentUser.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorDto> updateProfile(
            @RequestBody DoctorDto dto,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(doctorService.updateDoctorProfile(dp.getId(), dto));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(dp.getId()));
    }

    @PutMapping("/availability")
    public ResponseEntity<List<AvailabilityDto>> setAvailability(
            @RequestBody List<AvailabilityDto> availabilities,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(availabilityService.saveDoctorAvailabilities(dp.getId(), availabilities));
    }

    @GetMapping("/blocked-periods")
    public ResponseEntity<List<BlockedPeriodDto>> getBlockedPeriods(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(availabilityService.getDoctorBlockedPeriods(dp.getId()));
    }

    @PostMapping("/blocked-periods")
    public ResponseEntity<BlockedPeriodDto> addBlockedPeriod(
            @Valid @RequestBody BlockedPeriodDto dto,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        DoctorProfile dp = doctorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(availabilityService.addBlockedPeriod(dp.getId(), dto));
    }

    @DeleteMapping("/blocked-periods/{id}")
    public ResponseEntity<Void> deleteBlockedPeriod(@PathVariable String id) {
        availabilityService.deleteBlockedPeriod(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, request, currentUser));
    }
}
