package com.clinicadental.reservahoras.repository;

import com.clinicadental.reservahoras.entity.AppointmentParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AppointmentParticipantRepository extends JpaRepository<AppointmentParticipant, Long> {
    List<AppointmentParticipant> findByPatientId(Long patientId);
    List<AppointmentParticipant> findByAppointmentId(Long appointmentId);
    Optional<AppointmentParticipant> findByAppointmentIdAndPatientId(Long appointmentId, Long patientId);
    boolean existsByAppointmentIdAndPatientId(Long appointmentId, Long patientId);

    @Transactional
    void deleteByAppointmentId(Long appointmentId);
}
