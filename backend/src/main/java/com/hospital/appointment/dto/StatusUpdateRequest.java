package com.hospital.appointment.dto;

import com.hospital.appointment.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String doctorNotes;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(AppointmentStatus status, String doctorNotes) {
        this.status = status;
        this.doctorNotes = doctorNotes;
    }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }
}
