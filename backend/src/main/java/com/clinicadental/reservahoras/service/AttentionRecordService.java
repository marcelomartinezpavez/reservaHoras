package com.clinicadental.reservahoras.service;

import com.clinicadental.reservahoras.dto.AttentionRecordDto;
import com.clinicadental.reservahoras.entity.*;
import com.clinicadental.reservahoras.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttentionRecordService {

    private final AttentionRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public List<AttentionRecordDto> findByPatientId(Long patientId) {
        return recordRepository.findByPatientIdOrderByFechaDesc(patientId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public AttentionRecordDto create(AttentionRecordDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        AttentionRecord record = AttentionRecord.builder()
                .patient(patient)
                .fecha(dto.getFecha())
                .diagnostico(dto.getDiagnostico())
                .tratamiento(dto.getTratamiento())
                .observaciones(dto.getObservaciones())
                .build();
        if (dto.getAppointmentId() != null) {
            appointmentRepository.findById(dto.getAppointmentId())
                    .ifPresent(record::setAppointment);
        }
        return toDto(recordRepository.save(record));
    }

    @Transactional
    public AttentionRecordDto update(Long id, AttentionRecordDto dto) {
        AttentionRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada"));
        record.setFecha(dto.getFecha());
        record.setDiagnostico(dto.getDiagnostico());
        record.setTratamiento(dto.getTratamiento());
        record.setObservaciones(dto.getObservaciones());
        return toDto(recordRepository.save(record));
    }

    @Transactional
    public void delete(Long id) {
        recordRepository.deleteById(id);
    }

    private AttentionRecordDto toDto(AttentionRecord r) {
        return AttentionRecordDto.builder()
                .id(r.getId())
                .patientId(r.getPatient().getId())
                .patientNombre(r.getPatient().getNombre())
                .patientApellido(r.getPatient().getApellido())
                .appointmentId(r.getAppointment() != null ? r.getAppointment().getId() : null)
                .fecha(r.getFecha())
                .diagnostico(r.getDiagnostico())
                .tratamiento(r.getTratamiento())
                .observaciones(r.getObservaciones())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
