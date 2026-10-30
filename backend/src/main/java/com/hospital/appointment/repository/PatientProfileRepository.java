package com.hospital.appointment.repository;

import com.hospital.appointment.model.PatientProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends MongoRepository<PatientProfile, String> {
    Optional<PatientProfile> findByUserId(String userId);
    boolean existsByUserId(String userId);
    boolean existsByNic(String nic);
}
