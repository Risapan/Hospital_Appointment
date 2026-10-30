package com.hospital.appointment.repository;

import com.hospital.appointment.model.Availability;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends MongoRepository<Availability, String> {
    List<Availability> findByDoctorId(String doctorId);
    List<Availability> findByDoctorIdAndActive(String doctorId, boolean active);
    Optional<Availability> findByDoctorIdAndDayOfWeekAndActive(String doctorId, DayOfWeek dayOfWeek, boolean active);
    void deleteByDoctorId(String doctorId);
}
