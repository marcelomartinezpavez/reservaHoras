package com.clinicadental.reservahoras.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PatientDto {
    private Long id;
    @NotBlank private String nombre;
    @NotBlank private String apellido;
    @NotBlank private String rut;
    @NotBlank private String numeroContacto;
    private String email;
}
