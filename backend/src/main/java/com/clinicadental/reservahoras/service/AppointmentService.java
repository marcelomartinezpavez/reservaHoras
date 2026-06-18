package com.clinicadental.reservahoras.service;

import com.clinicadental.reservahoras.dto.AppointmentDto;
import com.clinicadental.reservahoras.entity.*;
import com.clinicadental.reservahoras.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public List<AppointmentDto> findAll() {
        return appointmentRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<AppointmentDto> findAvailable() {
        return appointmentRepository.findByStatus(AppointmentStatus.AVAILABLE)
                .stream().map(this::toDto).toList();
    }

    public List<AppointmentDto> findByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream().map(this::toDto).toList();
    }

    public AppointmentDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public AppointmentDto createSlot(LocalDateTime startTime, LocalDateTime endTime) {
        Appointment appointment = Appointment.builder()
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.AVAILABLE)
                .build();
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto book(Long appointmentId, Long patientId, String notes) {
        Appointment appointment = getOrThrow(appointmentId);
        if (appointment.getStatus() != AppointmentStatus.AVAILABLE) {
            throw new RuntimeException("La hora no está disponible");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.RESERVED);
        appointment.setNotes(notes);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getOrThrow(id);
        if (status == AppointmentStatus.CANCELLED) {
            appointment.setPatient(null);
            appointment.setNotes(null);
        }
        appointment.setStatus(status);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto cancel(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setPatient(null);
        appointment.setNotes(null);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public void delete(Long id) {
        appointmentRepository.deleteById(id);
    }

    private Appointment getOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hora no encontrada con id: " + id));
    }

    public AppointmentDto toDto(Appointment a) {
        AppointmentDto dto = AppointmentDto.builder()
                .id(a.getId())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .notes(a.getNotes())
                .build();
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientNombre(a.getPatient().getNombre());
            dto.setPatientApellido(a.getPatient().getApellido());
            dto.setPatientRut(a.getPatient().getRut());
        }
        return dto;
    }
}
