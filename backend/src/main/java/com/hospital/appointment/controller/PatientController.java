package com.hospital.appointment.controller;

import com.hospital.appointment.dto.PatientProfileDto;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.PatientProfile;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.PatientProfileRepository;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;

    public PatientController(UserRepository userRepository, PatientProfileRepository patientProfileRepository) {
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<PatientProfileDto> getMyProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PatientProfile profile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> patientProfileRepository.save(new PatientProfile(currentUser.getId())));

        return ResponseEntity.ok(toDto(user, profile));
    }

    @PutMapping("/me")
    public ResponseEntity<PatientProfileDto> updateMyProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phoneNumber")) user.setPhoneNumber(body.get("phoneNumber"));
        userRepository.save(user);

        PatientProfile profile = patientProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> new PatientProfile(currentUser.getId()));

        if (body.containsKey("gender")) profile.setGender(body.get("gender"));
        if (body.containsKey("bloodGroup")) profile.setBloodGroup(body.get("bloodGroup"));
        if (body.containsKey("emergencyContactName")) profile.setEmergencyContactName(body.get("emergencyContactName"));
        if (body.containsKey("emergencyContactPhone")) profile.setEmergencyContactPhone(body.get("emergencyContactPhone"));
        if (body.containsKey("address")) profile.setAddress(body.get("address"));
        if (body.containsKey("allergies")) profile.setAllergies(body.get("allergies"));
        if (body.containsKey("medicalHistory")) profile.setMedicalHistory(body.get("medicalHistory"));
        if (body.containsKey("dateOfBirth") && !body.get("dateOfBirth").isBlank()) {
            try {
                profile.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth")));
            } catch (Exception ignored) {}
        }

        PatientProfile saved = patientProfileRepository.save(profile);

        return ResponseEntity.ok(toDto(user, saved));
    }

    private PatientProfileDto toDto(User user, PatientProfile profile) {
        PatientProfileDto dto = new PatientProfileDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        dto.setRole(user.getRole());
        dto.setNic(profile.getNic() != null ? profile.getNic() : "");
        dto.setGender(profile.getGender() != null ? profile.getGender() : "");
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setBloodGroup(profile.getBloodGroup() != null ? profile.getBloodGroup() : "");
        dto.setEmergencyContactName(profile.getEmergencyContactName() != null ? profile.getEmergencyContactName() : "");
        dto.setEmergencyContactPhone(profile.getEmergencyContactPhone() != null ? profile.getEmergencyContactPhone() : "");
        dto.setAddress(profile.getAddress() != null ? profile.getAddress() : "");
        dto.setAllergies(profile.getAllergies() != null ? profile.getAllergies() : "");
        dto.setMedicalHistory(profile.getMedicalHistory() != null ? profile.getMedicalHistory() : "");
        return dto;
    }
}
