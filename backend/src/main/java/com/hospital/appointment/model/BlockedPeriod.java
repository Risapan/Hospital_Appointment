package com.hospital.appointment.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "blocked_periods")
@CompoundIndex(name = "doc_block_idx", def = "{'doctorId': 1, 'startDateTime': 1, 'endDateTime': 1}")
public class BlockedPeriod {

    @Id
    private String id;

    private String doctorId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String reasonCategory;
    private String reasonNote;

    @CreatedDate
    private Instant createdAt;

    public BlockedPeriod() {}

    public BlockedPeriod(String doctorId, LocalDateTime startDateTime, LocalDateTime endDateTime, String reasonCategory, String reasonNote) {
        this.doctorId = doctorId;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.reasonCategory = reasonCategory;
        this.reasonNote = reasonNote;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public String getReasonCategory() { return reasonCategory; }
    public void setReasonCategory(String reasonCategory) { this.reasonCategory = reasonCategory; }

    public String getReasonNote() { return reasonNote; }
    public void setReasonNote(String reasonNote) { this.reasonNote = reasonNote; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
