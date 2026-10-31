package com.hospital.appointment.controller;

import com.hospital.appointment.dto.*;
import com.hospital.appointment.exception.BadRequestException;
import com.hospital.appointment.model.AuditLog;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.AuditLogRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.appointment.service.DashboardService;
import com.hospital.appointment.service.DepartmentService;
import com.hospital.appointment.service.DoctorService;
import com.hospital.appointment.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DashboardService dashboardService;
    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final HospitalService hospitalService;
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public AdminController(DashboardService dashboardService,
                           AppointmentService appointmentService,
                           DoctorService doctorService,
                           DepartmentService departmentService,
                           HospitalService hospitalService,
                           UserRepository userRepository,
                           DoctorProfileRepository doctorProfileRepository,
                           PasswordEncoder passwordEncoder,
                           AuditLogRepository auditLogRepository) {
        this.dashboardService = dashboardService;
        this.appointmentService = appointmentService;
        this.doctorService = doctorService;
        this.departmentService = departmentService;
        this.hospitalService = hospitalService;
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(userRepository.findByRole(role));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/doctors")
    public ResponseEntity<DoctorDto> createDoctor(@Valid @RequestBody RegisterRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (request.getHospitalIds() == null || request.getHospitalIds().isEmpty()) {
            throw new BadRequestException("Please select at least one hospital this doctor works at");
        }
        List<String> hospitalIds = doctorService.validHospitalIds(request.getHospitalIds());
        User user = new User(
                request.getFullName(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                Role.DOCTOR
        );
        User savedUser = userRepository.save(user);

        DoctorProfile profile = new DoctorProfile(
                savedUser.getId(),
                request.getDepartmentId(),
                request.getSpecialty(),
                request.getQualifications(),
                30,
                java.math.BigDecimal.valueOf(2500.0) // default fee in LKR
        );
        profile.setHospitalIds(hospitalIds);
        doctorProfileRepository.save(profile);

        return new ResponseEntity<>(doctorService.getDoctorById(profile.getId()), HttpStatus.CREATED);
    }

    @PostMapping("/hospitals")
    public ResponseEntity<HospitalDto> createHospital(@Valid @RequestBody HospitalDto dto) {
        return new ResponseEntity<>(hospitalService.createHospital(dto), HttpStatus.CREATED);
    }

    @PutMapping("/hospitals/{id}")
    public ResponseEntity<HospitalDto> updateHospital(@PathVariable String id, @Valid @RequestBody HospitalDto dto) {
        return ResponseEntity.ok(hospitalService.updateHospital(id, dto));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<DoctorDto> updateDoctor(@PathVariable String id, @RequestBody DoctorDto dto) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(id, dto));
    }

    @PatchMapping("/doctors/{id}/status")
    public ResponseEntity<Void> setDoctorStatus(@PathVariable String id, @RequestParam boolean active) {
        doctorService.setDoctorActiveStatus(id, active);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        return new ResponseEntity<>(departmentService.createDepartment(dto), HttpStatus.CREATED);
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable String id, @Valid @RequestBody DepartmentDto dto) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, dto));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc(null).getContent());
    }
}
