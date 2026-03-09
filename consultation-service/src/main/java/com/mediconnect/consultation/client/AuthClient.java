package com.mediconnect.consultation.client;

import com.mediconnect.consultation.dto.ValidateTokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Component
public class AuthClient {

    private final RestClient restClient;

    public AuthClient(@Value("${auth.service.url}") String authServiceUrl) {
        this.restClient = RestClient.builder().baseUrl(authServiceUrl).build();
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public ValidateTokenResponse validateToken(String bearerToken) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.get()
                    .uri("/api/auth/validate")
                    .header("Authorization", bearerToken)
                    .retrieve()
                    .body(Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return new ValidateTokenResponse(UUID.fromString((String) data.get("accountId")), (String) data.get("role"), (Boolean) data.get("valid"));
        } catch (Exception e) {
            throw new RuntimeException("Failed to validate token: " + e.getMessage(), e);
        }
    }
}
