package com.clinicadental.reservahoras.service;

import com.clinicadental.reservahoras.dto.AppointmentDto;
import com.clinicadental.reservahoras.entity.*;
import com.clinicadental.reservahoras.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository participantRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<AppointmentDto> findAll() {
        return appointmentRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> findAvailable() {
        return appointmentRepository.findByStatus(AppointmentStatus.AVAILABLE)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> findByPatientId(Long patientId) {
        return participantRepository.findByPatientId(patientId).stream()
                .map(p -> toDto(p.getAppointment()))
                .sorted(Comparator.comparing(AppointmentDto::getStartTime))
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public AppointmentDto createSlot(LocalDateTime startTime, LocalDateTime endTime,
                                     int maxParticipants, String title) {
        Appointment appointment = Appointment.builder()
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.AVAILABLE)
                .maxParticipants(maxParticipants)
                .title(title)
                .build();
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto book(Long appointmentId, Long patientId, String notes) {
        Appointment appointment = getOrThrow(appointmentId);
        if (appointment.getStatus() != AppointmentStatus.AVAILABLE) {
            throw new RuntimeException("La hora no está disponible");
        }
        if (participantRepository.existsByAppointmentIdAndPatientId(appointmentId, patientId)) {
            throw new RuntimeException("Ya estás inscrito en esta hora");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        participantRepository.save(AppointmentParticipant.builder()
                .appointment(appointment)
                .patient(patient)
                .notes(notes)
                .build());

        int count = participantRepository.findByAppointmentId(appointmentId).size();
        if (count >= appointment.getMaxParticipants()) {
            appointment.setStatus(AppointmentStatus.FULL);
            appointmentRepository.save(appointment);
        }
        return toDto(getOrThrow(appointmentId));
    }

    @Transactional
    public AppointmentDto bookGuest(Long appointmentId, String guestName, String notes) {
        Appointment appointment = getOrThrow(appointmentId);
        if (appointment.getStatus() != AppointmentStatus.AVAILABLE) {
            throw new RuntimeException("La hora no está disponible");
        }
        participantRepository.save(AppointmentParticipant.builder()
                .appointment(appointment)
                .guestName(guestName)
                .notes(notes)
                .build());

        int count = participantRepository.findByAppointmentId(appointmentId).size();
        if (count >= appointment.getMaxParticipants()) {
            appointment.setStatus(AppointmentStatus.FULL);
            appointmentRepository.save(appointment);
        }
        return toDto(getOrThrow(appointmentId));
    }

    @Transactional
    public AppointmentDto removeParticipantEntry(Long appointmentId, Long participantId) {
        AppointmentParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participante no encontrado"));
        Appointment appointment = getOrThrow(appointmentId);
        participantRepository.delete(participant);
        if (appointment.getStatus() == AppointmentStatus.FULL) {
            appointment.setStatus(AppointmentStatus.AVAILABLE);
            appointmentRepository.save(appointment);
        }
        return toDto(getOrThrow(appointmentId));
    }

    @Transactional
    public AppointmentDto cancelParticipation(Long appointmentId, Long patientId) {
        AppointmentParticipant participant = participantRepository
                .findByAppointmentIdAndPatientId(appointmentId, patientId)
                .orElseThrow(() -> new RuntimeException("No estás inscrito en esta hora"));

        Appointment appointment = getOrThrow(appointmentId);
        participantRepository.delete(participant);

        if (appointment.getStatus() == AppointmentStatus.FULL) {
            appointment.setStatus(AppointmentStatus.AVAILABLE);
            appointmentRepository.save(appointment);
        }
        return toDto(getOrThrow(appointmentId));
    }

    @Transactional
    public AppointmentDto cancelSlot(Long id) {
        Appointment appointment = getOrThrow(id);
        participantRepository.deleteByAppointmentId(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getOrThrow(id);
        if (status == AppointmentStatus.CANCELLED) {
            participantRepository.deleteByAppointmentId(id);
        }
        appointment.setStatus(status);
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
        List<AppointmentParticipant> parts = a.getParticipants();
        boolean isGroup = a.getMaxParticipants() != null && a.getMaxParticipants() > 1;

        List<AppointmentDto.ParticipantInfo> participantInfos = parts.stream()
                .map(p -> {
                    boolean isGuest = p.getPatient() == null;
                    return AppointmentDto.ParticipantInfo.builder()
                            .participantId(p.getId())
                            .patientId(isGuest ? null : p.getPatient().getId())
                            .patientNombre(isGuest ? p.getGuestName() : p.getPatient().getNombre())
                            .patientApellido(isGuest ? null : p.getPatient().getApellido())
                            .patientRut(isGuest ? null : p.getPatient().getRut())
                            .guestName(p.getGuestName())
                            .guest(isGuest)
                            .notes(p.getNotes())
                            .bookedAt(p.getBookedAt())
                            .build();
                })
                .toList();

        AppointmentParticipant first = parts.isEmpty() ? null : parts.get(0);
        boolean firstIsGuest = first != null && first.getPatient() == null;

        return AppointmentDto.builder()
                .id(a.getId())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .maxParticipants(a.getMaxParticipants())
                .currentParticipants(parts.size())
                .title(a.getTitle())
                .group(isGroup)
                .patientId(first == null || firstIsGuest ? null : first.getPatient().getId())
                .patientNombre(first == null ? null : (firstIsGuest ? first.getGuestName() : first.getPatient().getNombre()))
                .patientApellido(first == null || firstIsGuest ? null : first.getPatient().getApellido())
                .patientRut(first == null || firstIsGuest ? null : first.getPatient().getRut())
                .notes(first != null ? first.getNotes() : null)
                .participants(participantInfos)
                .build();
    }
}
