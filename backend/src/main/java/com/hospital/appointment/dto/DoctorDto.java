package com.hospital.appointment.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DoctorDto {
    private String id; // DoctorProfile ID
    private String userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String departmentId;
    private String departmentName;
    private String specialty;
    private String biography;
    private String qualifications;
    private List<String> hospitalIds = new ArrayList<>();
    private List<HospitalSummary> hospitals = new ArrayList<>();
    private String hospitalName; // all hospital names joined, for display
    private String hospitalType;
    private int consultationDurationMinutes;
    private BigDecimal consultationFee;
    private String profileImageUrl;
    private int experienceYears;
    private String roomNumber;
    private boolean active;

    public DoctorDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    public List<String> getHospitalIds() { return hospitalIds; }
    public void setHospitalIds(List<String> hospitalIds) { this.hospitalIds = hospitalIds; }

    public List<HospitalSummary> getHospitals() { return hospitals; }
    public void setHospitals(List<HospitalSummary> hospitals) { this.hospitals = hospitals; }

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

    /** Short hospital info shown on doctor cards and in the booking window. */
    public static class HospitalSummary {
        private String id;
        private String name;
        private String sector;
        private String address;

        public HospitalSummary() {}

        public HospitalSummary(String id, String name, String sector, String address) {
            this.id = id;
            this.name = name;
            this.sector = sector;
            this.address = address;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
    }
}
