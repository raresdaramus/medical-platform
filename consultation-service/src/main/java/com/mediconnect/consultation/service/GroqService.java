package com.mediconnect.consultation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediconnect.consultation.dto.AiSuggestionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);
    private final RestClient restClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GroqService(
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.api.model}") String model) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.restClient = RestClient.create();
    }

    public List<AiSuggestionResponse> suggestDiagnoses(String patientContext, String lang) {
        String languageInstruction = "ro".equalsIgnoreCase(lang)
                ? "Respond entirely in Romanian language."
                : "Respond entirely in English language.";

        String userPrompt = """
                Based on the following patient information, suggest exactly 5 possible diagnoses.

                Patient information:
                %s

                %s
                Respond ONLY with a valid JSON array (no markdown, no extra text):
                [{"name": "Disease Name", "description": "Brief reason this diagnosis fits", "confidence": "high|medium|low"}]
                """.formatted(patientContext, languageInstruction);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are a medical diagnostic assistant. Always respond with a raw JSON array only, no markdown fences, no extra text before or after the array."),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.3,
                "max_tokens", 1024
        );

        String raw = restClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        log.info("Groq prompt: {}", userPrompt);
        log.info("Groq raw response: {}", raw);
        return parseResponse(raw);
    }

    private List<AiSuggestionResponse> parseResponse(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            content = content.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();
            JsonNode arr = objectMapper.readTree(content);
            List<AiSuggestionResponse> result = new ArrayList<>();
            for (JsonNode node : arr) {
                result.add(new AiSuggestionResponse(
                        node.path("name").asText("Unknown"),
                        node.path("description").asText(""),
                        node.path("confidence").asText("medium")
                ));
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }
}
