package com.hospital.appointment.repository;

import com.hospital.appointment.model.Appointment;
import com.hospital.appointment.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByStartDateTimeDesc(String patientId);
    Page<Appointment> findByPatientIdOrderByStartDateTimeDesc(String patientId, Pageable pageable);
    
    List<Appointment> findByDoctorIdOrderByStartDateTimeDesc(String doctorId);
    Page<Appointment> findByDoctorIdOrderByStartDateTimeDesc(String doctorId, Pageable pageable);

    List<Appointment> findByDoctorIdAndStartDateTimeBetweenAndStatusNot(
            String doctorId, LocalDateTime start, LocalDateTime end, AppointmentStatus status);

    List<Appointment> findByStartDateTimeBetweenOrderByStartDateTimeAsc(LocalDateTime start, LocalDateTime end);

    Page<Appointment> findAllByOrderByStartDateTimeDesc(Pageable pageable);

    long countByStatus(AppointmentStatus status);
    long countByStartDateTimeBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByActiveSlotKey(String activeSlotKey);
    Optional<Appointment> findByActiveSlotKey(String activeSlotKey);
}
