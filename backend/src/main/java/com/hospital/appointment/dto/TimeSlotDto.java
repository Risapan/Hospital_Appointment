package com.hospital.appointment.dto;

import java.time.LocalDateTime;

public class TimeSlotDto {
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private boolean available;
    private String reasonIfNotAvailable; // e.g. "Booked", "Blocked", "Past"

    public TimeSlotDto() {}

    public TimeSlotDto(LocalDateTime startDateTime, LocalDateTime endDateTime, boolean available) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.available = available;
    }

    public TimeSlotDto(LocalDateTime startDateTime, LocalDateTime endDateTime, boolean available, String reasonIfNotAvailable) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.available = available;
        this.reasonIfNotAvailable = reasonIfNotAvailable;
    }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getReasonIfNotAvailable() { return reasonIfNotAvailable; }
    public void setReasonIfNotAvailable(String reasonIfNotAvailable) { this.reasonIfNotAvailable = reasonIfNotAvailable; }
}
