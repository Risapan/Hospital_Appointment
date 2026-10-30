package com.hospital.appointment.controller;

import com.hospital.appointment.dto.*;
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
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public AdminController(DashboardService dashboardService,
                           AppointmentService appointmentService,
                           DoctorService doctorService,
                           DepartmentService departmentService,
                           UserRepository userRepository,
                           DoctorProfileRepository doctorProfileRepository,
                           PasswordEncoder passwordEncoder,
                           AuditLogRepository auditLogRepository) {
        this.dashboardService = dashboardService;
        this.appointmentService = appointmentService;
        this.doctorService = doctorService;
        this.departmentService = departmentService;
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
                java.math.BigDecimal.valueOf(100.0)
        );
        doctorProfileRepository.save(profile);

        return new ResponseEntity<>(doctorService.getDoctorById(profile.getId()), HttpStatus.CREATED);
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
