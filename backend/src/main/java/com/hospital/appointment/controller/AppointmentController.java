package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AppointmentRequest;
import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.CancelRequest;
import com.hospital.appointment.dto.RescheduleRequest;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        AppointmentResponse response = appointmentService.bookAppointment(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, currentUser));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable String id,
            @RequestBody(required = false) CancelRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (request == null) {
            request = new CancelRequest("Cancelled by user");
        }
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, request, currentUser));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable String id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request, currentUser));
    }
}
