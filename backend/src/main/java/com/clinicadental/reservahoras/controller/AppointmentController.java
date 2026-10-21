package com.clinicadental.reservahoras.controller;

import com.clinicadental.reservahoras.dto.AppointmentDto;
import com.clinicadental.reservahoras.entity.*;
import com.clinicadental.reservahoras.repository.*;
import com.clinicadental.reservahoras.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentDto>> findAll() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @GetMapping("/available")
    public ResponseEntity<List<AppointmentDto>> findAvailable() {
        return ResponseEntity.ok(appointmentService.findAvailable());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<AppointmentDto>> findMy(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(appointmentService.findByPatientId(patient.getId()));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentDto>> findByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.findByPatientId(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @PostMapping("/slot")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentDto> createSlot(@RequestBody Map<String, Object> body) {
        LocalDateTime start = LocalDateTime.parse(body.get("startTime").toString());
        LocalDateTime end = LocalDateTime.parse(body.get("endTime").toString());
        int maxParticipants = body.containsKey("maxParticipants")
                ? Integer.parseInt(body.get("maxParticipants").toString()) : 1;
        String title = body.containsKey("title") ? body.get("title").toString() : null;
        return ResponseEntity.ok(appointmentService.createSlot(start, end, maxParticipants, title));
    }

    @PostMapping("/{id}/book")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentDto> book(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Object notesObj = body.get("notes");
        String notes = notesObj != null ? notesObj.toString() : null;

        // Invitado sin cuenta: verificar antes de intentar resolver paciente
        if (body.containsKey("guestName")) {
            String guestName = body.get("guestName").toString();
            return ResponseEntity.ok(appointmentService.bookGuest(id, guestName, notes));
        }

        // Cliente registrado: por patientId explícito o por el usuario autenticado
        Long patientId;
        if (body.containsKey("patientId")) {
            patientId = Long.valueOf(body.get("patientId").toString());
        } else {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();
            patientId = patient.getId();
        }
        return ResponseEntity.ok(appointmentService.book(id, patientId, notes));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentDto> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(appointmentService.cancelSlot(id));
        } else {
            Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();
            return ResponseEntity.ok(appointmentService.cancelParticipation(id, patient.getId()));
        }
    }

    @DeleteMapping("/{id}/participants/entry/{participantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentDto> removeParticipantEntry(
            @PathVariable Long id,
            @PathVariable Long participantId) {
        return ResponseEntity.ok(appointmentService.removeParticipantEntry(id, participantId));
    }

    @DeleteMapping("/{id}/participants/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentDto> removeParticipant(
            @PathVariable Long id,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.cancelParticipation(id, patientId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
