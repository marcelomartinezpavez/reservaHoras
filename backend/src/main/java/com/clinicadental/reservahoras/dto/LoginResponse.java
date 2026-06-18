package com.clinicadental.reservahoras.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private String role;
    private Long patientId;
}
