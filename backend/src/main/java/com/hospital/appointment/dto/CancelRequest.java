package com.hospital.appointment.dto;

public class CancelRequest {
    private String reason;

    public CancelRequest() {}

    public CancelRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
