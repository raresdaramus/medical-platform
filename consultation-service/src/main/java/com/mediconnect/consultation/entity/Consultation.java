package com.mediconnect.consultation.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "consultations")
public class Consultation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "doctor_id", nullable = false) private UUID doctorId;
    @Column(name = "patient_id", nullable = false) private UUID patientId;
    @Column(name = "consultation_type", nullable = false, length = 20) private String consultationType;
    @Column(nullable = false, length = 20) private String status = "PENDING";
    @Column(name = "scheduled_at") private LocalDateTime scheduledAt;
    @Column(name = "started_at") private LocalDateTime startedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @Column(name = "slot_duration_minutes") private Integer slotDurationMinutes = 30;
    @Column(name = "notes_doctor", columnDefinition = "TEXT") private String notesDoctor;
    @Column(name = "created_at") private LocalDateTime createdAt = LocalDateTime.now();
    public Consultation() {}
    public UUID getId() { return id; } public void setId(UUID id) { this.id = id; }
    public UUID getDoctorId() { return doctorId; } public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }
    public UUID getPatientId() { return patientId; } public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getConsultationType() { return consultationType; } public void setConsultationType(String consultationType) { this.consultationType = consultationType; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; } public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getStartedAt() { return startedAt; } public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; } public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes; } public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
    public String getNotesDoctor() { return notesDoctor; } public void setNotesDoctor(String notesDoctor) { this.notesDoctor = notesDoctor; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
