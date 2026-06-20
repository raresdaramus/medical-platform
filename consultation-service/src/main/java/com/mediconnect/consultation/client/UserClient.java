package com.mediconnect.consultation.client;

import com.mediconnect.consultation.dto.DoctorDetailsDto;
import com.mediconnect.consultation.dto.DoctorScheduleDto;
import com.mediconnect.consultation.dto.PatientDetailsDto;
import com.mediconnect.consultation.dto.PatientInfoDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalTime;

@Component
public class UserClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public UserClient(@Value("${user.service.url}") String userServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(userServiceUrl).build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules();
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public PatientInfoDto getPatientInfo(UUID patientId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/patients/" + patientId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new PatientInfoDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("firstName"),
                (String) data.get("lastName")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch patient info: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public PatientInfoDto getPatientByAccountId(UUID accountId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/patients/by-account/" + accountId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new PatientInfoDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("firstName"),
                (String) data.get("lastName")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch patient by account: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public PatientInfoDto getDoctorInfo(UUID doctorId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/doctors/" + doctorId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new PatientInfoDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("firstName"),
                (String) data.get("lastName")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch doctor info: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public PatientInfoDto getDoctorByAccountId(UUID accountId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/doctors/by-account/" + accountId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new PatientInfoDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("firstName"),
                (String) data.get("lastName")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch doctor by account: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public PatientDetailsDto getPatientDetailsByAccountId(UUID accountId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/patients/by-account/" + accountId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new PatientDetailsDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("cnp"),
                (String) data.get("firstName"),
                (String) data.get("lastName"),
                data.get("dateOfBirth") != null ? java.time.LocalDate.parse((String) data.get("dateOfBirth")) : null,
                (String) data.get("gender"),
                (String) data.get("phone"),
                (String) data.get("address"),
                (String) data.get("bloodType")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch patient details: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public DoctorDetailsDto getDoctorDetails(UUID doctorId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/doctors/" + doctorId)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new DoctorDetailsDto(
                UUID.fromString((String) data.get("id")),
                UUID.fromString((String) data.get("accountId")),
                (String) data.get("licenseNumber"),
                (String) data.get("firstName"),
                (String) data.get("lastName"),
                (String) data.get("specialization"),
                (String) data.get("clinicName"),
                (String) data.get("phone"),
                (String) data.get("cui"),
                (String) data.get("clinicAddress"),
                (String) data.get("cas"),
                (String) data.get("cnasContractNumber"),
                (String) data.get("providerType")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch doctor details: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public List<DoctorScheduleDto> getDoctorSchedule(UUID doctorId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/users/internal/doctors/" + doctorId + "/schedule")
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            List<DoctorScheduleDto> schedules = new ArrayList<>();
            if (data != null) {
                for (Map<String, Object> entry : data) {
                    schedules.add(new DoctorScheduleDto(
                        (Integer) entry.get("dayOfWeek"),
                        LocalTime.parse((String) entry.get("startTime")),
                        LocalTime.parse((String) entry.get("endTime")),
                        (Integer) entry.get("slotDurationMinutes")
                    ));
                }
            }
            return schedules;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch doctor schedule: " + e.getMessage(), e);
        }
    }
}
