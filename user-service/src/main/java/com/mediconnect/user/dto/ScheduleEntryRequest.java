package com.mediconnect.user.dto;
import java.time.LocalTime;
public record ScheduleEntryRequest(Integer dayOfWeek, LocalTime startTime, LocalTime endTime, Integer slotDurationMinutes) {}
