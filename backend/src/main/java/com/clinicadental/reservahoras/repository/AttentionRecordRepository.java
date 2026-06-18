package com.clinicadental.reservahoras.repository;

import com.clinicadental.reservahoras.entity.AttentionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttentionRecordRepository extends JpaRepository<AttentionRecord, Long> {
    List<AttentionRecord> findByPatientIdOrderByFechaDesc(Long patientId);
}
