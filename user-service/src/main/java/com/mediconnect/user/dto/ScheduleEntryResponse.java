package com.mediconnect.user.dto;
import java.time.LocalTime;
import java.util.UUID;
public record ScheduleEntryResponse(UUID id, UUID doctorId, Integer dayOfWeek, LocalTime startTime, LocalTime endTime, Integer slotDurationMinutes, Boolean isActive) {}
