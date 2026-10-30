package com.hospital.appointment.dto;

import jakarta.validation.constraints.NotBlank;

public class DepartmentDto {
    private String id;

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
    private String icon;
    private boolean active = true;

    public DepartmentDto() {}

    public DepartmentDto(String id, String name, String description, String icon, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
