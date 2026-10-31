package com.hospital.appointment.dto;

import com.hospital.appointment.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Required for public and admin-created accounts; receptionist walk-ins fall back to a default
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    // Sri Lankan NIC: old format (9 digits + V/X) or new format (12 digits).
    // Required for public registration only; admin/receptionist flows may omit it.
    @Pattern(regexp = "^([0-9]{9}[VvXx]|[0-9]{12})$", message = "Invalid NIC number format")
    private String nic;

    private String phoneNumber;

    // Optional role: default PATIENT if not specified or regular registration
    private Role role = Role.PATIENT;

    // Optional fields for doctor registration by admin
    private String departmentId;
    private String specialty;
    private String qualifications;
    private List<String> hospitalIds;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public List<String> getHospitalIds() { return hospitalIds; }
    public void setHospitalIds(List<String> hospitalIds) { this.hospitalIds = hospitalIds; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
}
