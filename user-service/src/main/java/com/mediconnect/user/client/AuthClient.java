package com.mediconnect.user.client;

import com.mediconnect.user.dto.ValidateTokenResponse;
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
        this.restClient = RestClient.builder()
                .baseUrl(authServiceUrl)
                .build();
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

            if (response == null) {
                throw new RuntimeException("Auth service returned null response");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data == null) {
                throw new RuntimeException("Auth service response missing data field");
            }

            UUID accountId = UUID.fromString((String) data.get("accountId"));
            String role = (String) data.get("role");
            boolean valid = (Boolean) data.get("valid");

            return new ValidateTokenResponse(accountId, role, valid);
        } catch (Exception e) {
            throw new RuntimeException("Failed to validate token with auth service: " + e.getMessage(), e);
        }
    }
}
