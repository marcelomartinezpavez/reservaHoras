package com.clinicadental.reservahoras.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttentionRecordDto {
    private Long id;
    private Long patientId;
    private String patientNombre;
    private String patientApellido;
    private Long appointmentId;
    private LocalDate fecha;
    private String diagnostico;
    private String tratamiento;
    private String observaciones;
    private LocalDateTime createdAt;
}
