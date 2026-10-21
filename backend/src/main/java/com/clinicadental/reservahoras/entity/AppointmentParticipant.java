package com.clinicadental.reservahoras.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"appointment_id", "patient_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = true)
    private Patient patient;

    @Column(name = "guest_name", length = 200)
    private String guestName;

    @Column(length = 500)
    private String notes;

    @Column(name = "booked_at")
    private LocalDateTime bookedAt;

    @PrePersist
    public void prePersist() {
        this.bookedAt = LocalDateTime.now();
    }
}
