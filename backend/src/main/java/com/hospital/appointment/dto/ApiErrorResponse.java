package com.hospital.appointment.dto;

import java.time.Instant;
import java.util.Map;

public class ApiErrorResponse {
    private String errorCode;
    private String message;
    private int status;
    private Instant timestamp = Instant.now();
    private Map<String, String> validationErrors;

    public ApiErrorResponse() {}

    public ApiErrorResponse(String errorCode, String message, int status) {
        this.errorCode = errorCode;
        this.message = message;
        this.status = status;
        this.timestamp = Instant.now();
    }

    public ApiErrorResponse(String errorCode, String message, int status, Map<String, String> validationErrors) {
        this.errorCode = errorCode;
        this.message = message;
        this.status = status;
        this.timestamp = Instant.now();
        this.validationErrors = validationErrors;
    }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Map<String, String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }
}
