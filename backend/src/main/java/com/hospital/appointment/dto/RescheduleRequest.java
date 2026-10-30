package com.hospital.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class RescheduleRequest {

    @NotNull(message = "New start time is required")
    @Future(message = "New appointment time must be in the future")
    private LocalDateTime newStartDateTime;

    private String reason;

    public RescheduleRequest() {}

    public LocalDateTime getNewStartDateTime() { return newStartDateTime; }
    public void setNewStartDateTime(LocalDateTime newStartDateTime) { this.newStartDateTime = newStartDateTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
