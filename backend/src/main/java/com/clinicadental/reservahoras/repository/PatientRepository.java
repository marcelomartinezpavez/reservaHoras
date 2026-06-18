package com.clinicadental.reservahoras.repository;

import com.clinicadental.reservahoras.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByRut(String rut);
    boolean existsByRut(String rut);
    Optional<Patient> findByUserId(Long userId);
}
