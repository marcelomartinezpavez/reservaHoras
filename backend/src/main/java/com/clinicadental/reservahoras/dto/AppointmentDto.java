package com.clinicadental.reservahoras.dto;

import com.clinicadental.reservahoras.entity.AppointmentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private Long patientId;
    private String patientNombre;
    private String patientApellido;
    private String patientRut;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private String notes;
}
