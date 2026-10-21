package com.clinicadental.reservahoras.dto;

import com.clinicadental.reservahoras.entity.AppointmentStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String title;
    private boolean group;

    // Primer participante (compatibilidad individual / vista rápida)
    private Long patientId;
    private String patientNombre;
    private String patientApellido;
    private String patientRut;
    private String notes;

    // Lista completa de participantes (vista admin detalle)
    private List<ParticipantInfo> participants;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ParticipantInfo {
        private Long participantId;
        private Long patientId;
        private String patientNombre;
        private String patientApellido;
        private String patientRut;
        private String guestName;
        private boolean guest;
        private String notes;
        private LocalDateTime bookedAt;
    }
}
