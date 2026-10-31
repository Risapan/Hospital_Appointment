package com.hospital.appointment.service;

import com.hospital.appointment.dto.DoctorDto;
import com.hospital.appointment.exception.ResourceNotFoundException;
import com.hospital.appointment.model.Department;
import com.hospital.appointment.model.DoctorProfile;
import com.hospital.appointment.model.Hospital;
import com.hospital.appointment.model.Role;
import com.hospital.appointment.model.User;
import com.hospital.appointment.repository.DepartmentRepository;
import com.hospital.appointment.repository.DoctorProfileRepository;
import com.hospital.appointment.repository.HospitalRepository;
import com.hospital.appointment.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;

    public DoctorService(DoctorProfileRepository doctorProfileRepository,
                         UserRepository userRepository,
                         DepartmentRepository departmentRepository,
                         HospitalRepository hospitalRepository) {
        this.doctorProfileRepository = doctorProfileRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.hospitalRepository = hospitalRepository;
    }

    public List<DoctorDto> getAllDoctors(String departmentId, String specialty, String search, Boolean activeOnly, String hospitalId) {
        List<DoctorProfile> profiles = hospitalId != null && !hospitalId.isBlank()
                ? doctorProfileRepository.findByHospitalIds(hospitalId)
                : doctorProfileRepository.findAll();

        if (activeOnly == null || activeOnly) {
            profiles = profiles.stream().filter(DoctorProfile::isActive).collect(Collectors.toList());
        }

        if (departmentId != null && !departmentId.isBlank()) {
            profiles = profiles.stream()
                    .filter(p -> departmentId.equals(p.getDepartmentId()))
                    .collect(Collectors.toList());
        }

        Map<String, String> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getId, Department::getName));

        if (specialty != null && !specialty.isBlank()) {
            // Match the doctor's specialty or department name, e.g. "Paediatrics" finds a "Neonatal Care" doctor
            String wanted = normalizeSpelling(specialty);
            profiles = profiles.stream()
                    .filter(p -> (p.getSpecialty() != null && normalizeSpelling(p.getSpecialty()).contains(wanted))
                            || normalizeSpelling(deptMap.getOrDefault(p.getDepartmentId(), "")).contains(wanted))
                    .collect(Collectors.toList());
        }

        // Fetch users map
        List<String> userIds = profiles.stream().map(DoctorProfile::getUserId).collect(Collectors.toList());
        Map<String, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<DoctorDto> dtos = new ArrayList<>();
        for (DoctorProfile p : profiles) {
            User user = userMap.get(p.getUserId());
            if (user == null) continue;

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean matchesName = user.getFullName() != null && user.getFullName().toLowerCase().contains(q);
                boolean matchesSpec = p.getSpecialty() != null && p.getSpecialty().toLowerCase().contains(q);
                if (!matchesName && !matchesSpec) {
                    continue;
                }
            }

            dtos.add(toDto(p, user, deptMap.get(p.getDepartmentId())));
        }

        return dtos;
    }

    public DoctorDto getDoctorById(String id) {
        // Can be doctor profile id or user id
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .or(() -> doctorProfileRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user account not found"));

        String deptName = "";
        if (profile.getDepartmentId() != null) {
            deptName = departmentRepository.findById(profile.getDepartmentId())
                    .map(Department::getName)
                    .orElse("");
        }

        return toDto(profile, user, deptName);
    }

    public DoctorDto getDoctorByUserId(String userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + userId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user account not found"));

        String deptName = "";
        if (profile.getDepartmentId() != null) {
            deptName = departmentRepository.findById(profile.getDepartmentId())
                    .map(Department::getName)
                    .orElse("");
        }

        return toDto(profile, user, deptName);
    }

    public DoctorDto updateDoctorProfile(String id, DoctorDto dto) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .or(() -> doctorProfileRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found with id: " + id));

        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor user not found"));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        userRepository.save(user);

        if (dto.getDepartmentId() != null) profile.setDepartmentId(dto.getDepartmentId());
        if (dto.getSpecialty() != null) profile.setSpecialty(dto.getSpecialty());
        if (dto.getBiography() != null) profile.setBiography(dto.getBiography());
        if (dto.getQualifications() != null) profile.setQualifications(dto.getQualifications());
        if (dto.getHospitalIds() != null) {
            profile.setHospitalIds(validHospitalIds(dto.getHospitalIds()));
        }
        if (dto.getConsultationDurationMinutes() > 0) profile.setConsultationDurationMinutes(dto.getConsultationDurationMinutes());
        if (dto.getConsultationFee() != null) profile.setConsultationFee(dto.getConsultationFee());
        if (dto.getProfileImageUrl() != null) profile.setProfileImageUrl(dto.getProfileImageUrl());
        if (dto.getExperienceYears() > 0) profile.setExperienceYears(dto.getExperienceYears());
        if (dto.getRoomNumber() != null) profile.setRoomNumber(dto.getRoomNumber());
        profile.setActive(dto.isActive());

        DoctorProfile updated = doctorProfileRepository.save(profile);
        String deptName = departmentRepository.findById(updated.getDepartmentId()).map(Department::getName).orElse("");
        return toDto(updated, user, deptName);
    }

    public void setDoctorActiveStatus(String id, boolean active) {
        DoctorProfile profile = doctorProfileRepository.findById(id)
                .or(() -> doctorProfileRepository.findByUserId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        profile.setActive(active);
        doctorProfileRepository.save(profile);

        userRepository.findById(profile.getUserId()).ifPresent(u -> {
            u.setActive(active);
            userRepository.save(u);
        });
    }

    /** Checks every id refers to an existing hospital; returns them without duplicates. */
    public List<String> validHospitalIds(List<String> ids) {
        List<String> result = new ArrayList<>();
        for (String id : ids) {
            if (id == null || id.isBlank() || result.contains(id)) continue;
            Hospital hospital = hospitalRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + id));
            result.add(hospital.getId());
        }
        return result;
    }

    // Sri Lanka uses British spellings (Paediatrics, Orthopaedics, Gynaecology); treat them like US ones
    private static String normalizeSpelling(String s) {
        return s.toLowerCase().replace("ae", "e");
    }

    private DoctorDto toDto(DoctorProfile p, User u, String deptName) {
        DoctorDto dto = new DoctorDto();
        dto.setId(p.getId());
        dto.setUserId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setPhoneNumber(u.getPhoneNumber());
        dto.setDepartmentId(p.getDepartmentId());
        dto.setDepartmentName(deptName != null ? deptName : "");
        dto.setSpecialty(p.getSpecialty());
        dto.setBiography(p.getBiography());
        dto.setQualifications(p.getQualifications());
        List<DoctorDto.HospitalSummary> hospitals = new ArrayList<>();
        hospitalRepository.findAllById(p.getHospitalIds()).forEach(h -> {
            if (h.isActive()) {
                hospitals.add(new DoctorDto.HospitalSummary(h.getId(), h.getName(), h.getSector(), h.getAddress()));
            }
        });
        dto.setHospitalIds(hospitals.stream().map(DoctorDto.HospitalSummary::getId).collect(Collectors.toList()));
        dto.setHospitals(hospitals);
        dto.setHospitalName(hospitals.isEmpty() ? null
                : hospitals.stream().map(DoctorDto.HospitalSummary::getName).collect(Collectors.joining(", ")));
        dto.setHospitalType(hospitals.isEmpty() ? null : hospitals.get(0).getSector());
        dto.setConsultationDurationMinutes(p.getConsultationDurationMinutes());
        dto.setConsultationFee(p.getConsultationFee());
        dto.setProfileImageUrl(p.getProfileImageUrl());
        dto.setExperienceYears(p.getExperienceYears());
        dto.setRoomNumber(p.getRoomNumber());
        dto.setActive(p.isActive());
        return dto;
    }
}
