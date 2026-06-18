package com.clinicadental.reservahoras.service;

import com.clinicadental.reservahoras.dto.PatientDto;
import com.clinicadental.reservahoras.entity.Patient;
import com.clinicadental.reservahoras.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public List<PatientDto> findAll() {
        return patientRepository.findAll().stream().map(this::toDto).toList();
    }

    public PatientDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    public PatientDto findByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return toDto(patient);
    }

    @Transactional
    public PatientDto create(PatientDto dto) {
        if (patientRepository.existsByRut(dto.getRut())) {
            throw new RuntimeException("El RUT ya está registrado");
        }
        Patient patient = Patient.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .rut(dto.getRut())
                .numeroContacto(dto.getNumeroContacto())
                .build();
        return toDto(patientRepository.save(patient));
    }

    @Transactional
    public PatientDto update(Long id, PatientDto dto) {
        Patient patient = getOrThrow(id);
        patient.setNombre(dto.getNombre());
        patient.setApellido(dto.getApellido());
        patient.setRut(dto.getRut());
        patient.setNumeroContacto(dto.getNumeroContacto());
        return toDto(patientRepository.save(patient));
    }

    @Transactional
    public void delete(Long id) {
        patientRepository.deleteById(id);
    }

    private Patient getOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));
    }

    public PatientDto toDto(Patient p) {
        String email = p.getUser() != null ? p.getUser().getEmail() : null;
        return PatientDto.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .rut(p.getRut())
                .numeroContacto(p.getNumeroContacto())
                .email(email)
                .build();
    }
}
