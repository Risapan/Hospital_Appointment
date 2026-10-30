package com.hospital.appointment.repository;

import com.hospital.appointment.model.BlockedPeriod;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BlockedPeriodRepository extends MongoRepository<BlockedPeriod, String> {
    List<BlockedPeriod> findByDoctorId(String doctorId);
    List<BlockedPeriod> findByDoctorIdAndEndDateTimeAfterAndStartDateTimeBefore(String doctorId, LocalDateTime start, LocalDateTime end);
    void deleteByDoctorId(String doctorId);
}
