package com.clinicadental.reservahoras.service;

import com.clinicadental.reservahoras.dto.*;
import com.clinicadental.reservahoras.entity.*;
import com.clinicadental.reservahoras.repository.*;
import com.clinicadental.reservahoras.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = jwtTokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        Long patientId = null;
        if (user.getRole() == Role.CLIENT) {
            patientId = patientRepository.findByUserId(user.getId())
                    .map(Patient::getId).orElse(null);
        }
        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .patientId(patientId)
                .build();
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        if (patientRepository.existsByRut(request.getRut())) {
            throw new RuntimeException("El RUT ya está registrado");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .rut(request.getRut())
                .numeroContacto(request.getNumeroContacto())
                .user(user)
                .build();
        patientRepository.save(patient);
    }
}
