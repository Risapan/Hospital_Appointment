package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AvailabilityDto;
import com.hospital.appointment.dto.DoctorDto;
import com.hospital.appointment.dto.TimeSlotDto;
import com.hospital.appointment.service.AvailabilityService;
import com.hospital.appointment.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final AvailabilityService availabilityService;

    public DoctorController(DoctorService doctorService, AvailabilityService availabilityService) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly) {
        return ResponseEntity.ok(doctorService.getAllDoctors(departmentId, specialty, search, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable String id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<TimeSlotDto>> getDoctorSlots(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(availabilityService.getAvailableSlots(id, date));
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<AvailabilityDto>> getDoctorSchedules(@PathVariable String id) {
        return ResponseEntity.ok(availabilityService.getDoctorAvailabilities(id));
    }
}
