package com.hospital.appointment.controller;

import com.hospital.appointment.dto.HospitalDto;
import com.hospital.appointment.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<List<HospitalDto>> getHospitals(@RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(hospitalService.getHospitals(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalDto> getHospitalById(@PathVariable String id) {
        return ResponseEntity.ok(hospitalService.getHospitalById(id));
    }
}
