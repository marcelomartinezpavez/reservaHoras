package com.clinicadental.reservahoras.controller;

import com.clinicadental.reservahoras.dto.AttentionRecordDto;
import com.clinicadental.reservahoras.service.AttentionRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attention-records")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AttentionRecordController {

    private final AttentionRecordService recordService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AttentionRecordDto>> findByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(recordService.findByPatientId(patientId));
    }

    @PostMapping
    public ResponseEntity<AttentionRecordDto> create(@RequestBody AttentionRecordDto dto) {
        return ResponseEntity.ok(recordService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttentionRecordDto> update(@PathVariable Long id, @RequestBody AttentionRecordDto dto) {
        return ResponseEntity.ok(recordService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
