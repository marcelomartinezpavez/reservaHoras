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
    public ResponseEntity<AppointmentDto> createSlot(@RequestBody Map<String, String> body) {
        LocalDateTime start = LocalDateTime.parse(body.get("startTime"));
        LocalDateTime end = LocalDateTime.parse(body.get("endTime"));
        return ResponseEntity.ok(appointmentService.createSlot(start, end));
    }

    @PostMapping("/{id}/book")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentDto> book(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long patientId;
        if (body.containsKey("patientId")) {
            patientId = Long.valueOf(body.get("patientId").toString());
        } else {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();
            patientId = patient.getId();
        }
        String notes = body.containsKey("notes") ? body.get("notes").toString() : null;
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
    public ResponseEntity<AppointmentDto> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancel(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
