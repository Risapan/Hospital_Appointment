package com.hospital.appointment.repository;

import com.hospital.appointment.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByActorIdOrderByTimestampDesc(String actorId);
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
