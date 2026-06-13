package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.client.AuthClient;
import com.mediconnect.consultation.dto.ApiResponse;
import com.mediconnect.consultation.dto.StatisticsResponse;
import com.mediconnect.consultation.exception.UnauthorizedException;
import com.mediconnect.consultation.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final AuthClient authClient;

    public StatisticsController(StatisticsService statisticsService, AuthClient authClient) {
        this.statisticsService = statisticsService;
        this.authClient = authClient;
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics(
            @RequestHeader("Authorization") String auth) {
        var token = authClient.validateToken(auth);
        if (!"DOCTOR".equals(token.role())) throw new UnauthorizedException("Doctors only");
        return ResponseEntity.ok(ApiResponse.ok(statisticsService.getStatistics()));
    }
}
