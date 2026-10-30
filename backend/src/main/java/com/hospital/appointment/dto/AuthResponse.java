package com.hospital.appointment.dto;

import com.hospital.appointment.model.Role;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UserSummaryDto user;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, UserSummaryDto user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }

    public static class UserSummaryDto {
        private String id;
        private String fullName;
        private String email;
        private String phoneNumber;
        private Role role;
        private String doctorProfileId; // populated if doctor

        public UserSummaryDto() {}

        public UserSummaryDto(String id, String fullName, String email, String phoneNumber, Role role) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.role = role;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public String getDoctorProfileId() { return doctorProfileId; }
        public void setDoctorProfileId(String doctorProfileId) { this.doctorProfileId = doctorProfileId; }
    }
}
