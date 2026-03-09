package com.mediconnect.consultation.dto;
import java.time.LocalTime;
public record DoctorScheduleDto(Integer dayOfWeek, LocalTime startTime, LocalTime endTime, Integer slotDurationMinutes) {}
