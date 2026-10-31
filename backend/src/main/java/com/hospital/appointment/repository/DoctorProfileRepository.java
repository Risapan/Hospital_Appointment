package com.hospital.appointment.repository;

import com.hospital.appointment.model.DoctorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends MongoRepository<DoctorProfile, String> {
    Optional<DoctorProfile> findByUserId(String userId);
    List<DoctorProfile> findByDepartmentId(String departmentId);
    Page<DoctorProfile> findByDepartmentId(String departmentId, Pageable pageable);
    List<DoctorProfile> findBySpecialtyContainingIgnoreCase(String specialty);
    List<DoctorProfile> findByActive(boolean active);
    long countByActive(boolean active);
    // Matches doctors whose hospitalIds list contains the given id
    long countByHospitalIdsAndActive(String hospitalId, boolean active);
    List<DoctorProfile> findByHospitalIds(String hospitalId);
}
