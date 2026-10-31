package com.hospital.appointment.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

public class HospitalDto {
    private String id;

    @NotBlank(message = "Hospital name is required")
    private String name;

    private String type;
    private String sector;
    private String address;
    private String city;
    private String phone;
    private String whatsapp;
    private String email;
    private String website;
    private String mapUrl;
    private String description;
    private List<String> services = new ArrayList<>();
    private boolean active = true;
    private long doctorCount;

    public HospitalDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String mapUrl) { this.mapUrl = mapUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public long getDoctorCount() { return doctorCount; }
    public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }
}
