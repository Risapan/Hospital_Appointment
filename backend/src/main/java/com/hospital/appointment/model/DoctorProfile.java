package com.hospital.appointment.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "doctor_profiles")
public class DoctorProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Indexed
    private String departmentId;

    private String specialty;
    private String biography;
    private String qualifications;
    // Hospitals where this doctor holds clinics; patients choose one of them when booking
    @Indexed
    private List<String> hospitalIds = new ArrayList<>();

    // Legacy single-hospital fields, kept only so older records can be migrated into hospitalIds
    private String hospitalId;
    private String hospitalName;
    private String hospitalType; // e.g., "Government", "Private"
    private int consultationDurationMinutes = 30; // default 30 mins
    private BigDecimal consultationFee = BigDecimal.valueOf(2500.0); // LKR
    private String profileImageUrl;
    private int experienceYears = 5;
    private String roomNumber;
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public DoctorProfile() {}

    public DoctorProfile(String userId, String departmentId, String specialty, String qualifications, int consultationDurationMinutes, BigDecimal consultationFee) {
        this.userId = userId;
        this.departmentId = departmentId;
        this.specialty = specialty;
        this.qualifications = qualifications;
        this.consultationDurationMinutes = consultationDurationMinutes;
        this.consultationFee = consultationFee;
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    public List<String> getHospitalIds() { return hospitalIds; }
    public void setHospitalIds(List<String> hospitalIds) { this.hospitalIds = hospitalIds != null ? hospitalIds : new ArrayList<>(); }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getHospitalType() { return hospitalType; }
    public void setHospitalType(String hospitalType) { this.hospitalType = hospitalType; }

    public int getConsultationDurationMinutes() { return consultationDurationMinutes; }
    public void setConsultationDurationMinutes(int consultationDurationMinutes) { this.consultationDurationMinutes = consultationDurationMinutes; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
