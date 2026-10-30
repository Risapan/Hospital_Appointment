package com.hospital.appointment.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "appointments")
@CompoundIndexes({
    @CompoundIndex(name = "patient_start_idx", def = "{'patientId': 1, 'startDateTime': 1}"),
    @CompoundIndex(name = "doctor_start_idx", def = "{'doctorId': 1, 'startDateTime': 1}")
})
public class Appointment {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String doctorId;

    @Indexed
    private String departmentId;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private AppointmentStatus status = AppointmentStatus.CONFIRMED;

    // Concurrency guarantee: sparse unique index on activeSlotKey
    // Format: doctorId + "_" + startDateTime. Set to null when cancelled.
    @Indexed(unique = true, sparse = true)
    private String activeSlotKey;

    private String reasonForVisit;
    private String patientNotes;
    private String doctorNotes;

    private String cancelledBy;
    private String cancellationReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Appointment() {}

    public Appointment(String patientId, String doctorId, String departmentId, LocalDateTime startDateTime, LocalDateTime endDateTime, String reasonForVisit) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.departmentId = departmentId;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.reasonForVisit = reasonForVisit;
        this.status = AppointmentStatus.CONFIRMED;
        this.activeSlotKey = doctorId + "_" + startDateTime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) {
        this.status = status;
        if (status == AppointmentStatus.CANCELLED) {
            this.activeSlotKey = null;
        } else if (this.activeSlotKey == null && this.doctorId != null && this.startDateTime != null) {
            this.activeSlotKey = this.doctorId + "_" + this.startDateTime;
        }
    }

    public String getActiveSlotKey() { return activeSlotKey; }
    public void setActiveSlotKey(String activeSlotKey) { this.activeSlotKey = activeSlotKey; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getPatientNotes() { return patientNotes; }
    public void setPatientNotes(String patientNotes) { this.patientNotes = patientNotes; }

    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
