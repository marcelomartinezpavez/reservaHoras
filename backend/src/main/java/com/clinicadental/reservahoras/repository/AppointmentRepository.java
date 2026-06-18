package com.clinicadental.reservahoras.repository;

import com.clinicadental.reservahoras.entity.Appointment;
import com.clinicadental.reservahoras.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);
}
