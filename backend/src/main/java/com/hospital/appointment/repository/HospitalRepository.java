package com.hospital.appointment.repository;

import com.hospital.appointment.model.Hospital;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends MongoRepository<Hospital, String> {
    Optional<Hospital> findByName(String name);
    List<Hospital> findByActive(boolean active);
}
