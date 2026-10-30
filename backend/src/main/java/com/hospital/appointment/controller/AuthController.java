package com.hospital.appointment.controller;

import com.hospital.appointment.dto.AuthRequest;
import com.hospital.appointment.dto.AuthResponse;
import com.hospital.appointment.dto.RegisterRequest;
import com.hospital.appointment.exception.BadRequestException;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.PatientProfile;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.PatientProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.JwtUtils;
import com.hospital.appointment.security.UserDetailsImpl;
import com.hospital.appointment.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PatientProfileRepository patientProfileRepository,
                          DoctorProfileRepository doctorProfileRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateAccessToken(userDetails.getUsername(), userDetails.getRole().name(), userDetails.getId());
        String refresh = jwtUtils.generateRefreshToken(userDetails.getUsername());

        AuthResponse.UserSummaryDto userSummary = new AuthResponse.UserSummaryDto(
                userDetails.getId(),
                userDetails.getFullName(),
                userDetails.getUsername(),
                null,
                userDetails.getRole()
        );

        if (userDetails.getRole() == Role.DOCTOR) {
            doctorProfileRepository.findByUserId(userDetails.getId())
                    .ifPresent(dp -> userSummary.setDoctorProfileId(dp.getId()));
        }

        auditService.log(userDetails.getId(), userDetails.getUsername(), "LOGIN", "User", userDetails.getId(), "SUCCESS", "User logged in");

        return ResponseEntity.ok(new AuthResponse(jwt, refresh, userSummary));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        if (request.getNic() == null || request.getNic().isBlank()) {
            throw new BadRequestException("NIC number is required");
        }
        String nic = request.getNic().trim().toUpperCase();
        if (patientProfileRepository.existsByNic(nic)) {
            throw new BadRequestException("An account with this NIC number already exists.");
        }

        // Public registration is always PATIENT; staff accounts are created by admins
        Role role = Role.PATIENT;

        User user = new User(
                request.getFullName(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                role
        );

        User savedUser = userRepository.save(user);

        if (role == Role.PATIENT) {
            PatientProfile profile = new PatientProfile(savedUser.getId());
            profile.setNic(nic);
            patientProfileRepository.save(profile);
        }

        String jwt = jwtUtils.generateAccessToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
        String refresh = jwtUtils.generateRefreshToken(savedUser.getEmail());

        AuthResponse.UserSummaryDto userSummary = new AuthResponse.UserSummaryDto(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber(),
                savedUser.getRole()
        );

        auditService.log(savedUser.getId(), savedUser.getEmail(), "REGISTER", "User", savedUser.getId(), "SUCCESS", "New user registered");

        return ResponseEntity.ok(new AuthResponse(jwt, refresh, userSummary));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        AuthResponse.UserSummaryDto userSummary = new AuthResponse.UserSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole()
        );

        if (user.getRole() == Role.DOCTOR) {
            doctorProfileRepository.findByUserId(user.getId())
                    .ifPresent(dp -> userSummary.setDoctorProfileId(dp.getId()));
        }

        return ResponseEntity.ok(userSummary);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getUserNameFromJwtToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("User not found"));

            String newAccess = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
            return ResponseEntity.ok(Map.of("token", newAccess, "tokenType", "Bearer"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid refresh token"));
    }
}
