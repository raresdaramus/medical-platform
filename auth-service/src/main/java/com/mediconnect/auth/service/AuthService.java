package com.mediconnect.auth.service;

import com.mediconnect.auth.dto.*;
import com.mediconnect.auth.entity.Account;
import com.mediconnect.auth.entity.GdprConsent;
import com.mediconnect.auth.entity.RefreshToken;
import com.mediconnect.auth.repository.AccountRepository;
import com.mediconnect.auth.repository.GdprConsentRepository;
import com.mediconnect.auth.repository.RefreshTokenRepository;
import com.mediconnect.auth.security.JwtProperties;
import com.mediconnect.auth.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final GdprConsentRepository gdprConsentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    public AuthService(AccountRepository accountRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       GdprConsentRepository gdprConsentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       JwtProperties jwtProperties) {
        this.accountRepository = accountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.gdprConsentRepository = gdprConsentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.jwtProperties = jwtProperties;
    }

    public RegisterResponse register(RegisterRequest req, String ipAddress) {
        // Validate required GDPR consents
        List<GdprConsentRequest> consents = req.gdprConsents();
        boolean dataProcessing = consents.stream()
            .anyMatch(c -> "DATA_PROCESSING".equals(c.consentType()) && c.granted());
        boolean doctorAccess = consents.stream()
            .anyMatch(c -> "DOCTOR_ACCESS".equals(c.consentType()) && c.granted());

        if (!dataProcessing || !doctorAccess) {
            throw new IllegalArgumentException("DATA_PROCESSING and DOCTOR_ACCESS consents are required");
        }

        if (accountRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Account account = new Account();
        account.setEmail(req.email());
        account.setPasswordHash(passwordEncoder.encode(req.password()));
        account.setRole(req.role());
        account.setIsActive(true);
        account.setCreatedAt(LocalDateTime.now());
        account = accountRepository.save(account);

        final UUID accountId = account.getId();
        for (GdprConsentRequest consentReq : consents) {
            GdprConsent consent = new GdprConsent();
            consent.setAccountId(accountId);
            consent.setConsentType(consentReq.consentType());
            consent.setGranted(consentReq.granted());
            consent.setGrantedAt(consentReq.granted() ? LocalDateTime.now() : null);
            consent.setIpAddress(ipAddress);
            gdprConsentRepository.save(consent);
        }

        return new RegisterResponse(account.getId(), account.getEmail(), account.getRole());
    }

    public LoginResponse login(LoginRequest req) {
        Account account = accountRepository.findByEmail(req.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), account.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (Boolean.FALSE.equals(account.getIsActive())) {
            throw new IllegalArgumentException("Account is disabled");
        }

        String accessToken = jwtUtil.generateAccessToken(account.getId(), account.getRole());
        String refreshTokenValue = jwtUtil.generateRefreshToken(account.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setAccountId(account.getId());
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshExpiryMs() / 1000));
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(accessToken, refreshTokenValue, account.getRole(), account.getId());
    }

    public RefreshResponse refresh(RefreshRequest req) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(req.refreshToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new IllegalArgumentException("Refresh token expired");
        }

        Account account = accountRepository.findById(storedToken.getAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        String newAccessToken = jwtUtil.generateAccessToken(account.getId(), account.getRole());
        return new RefreshResponse(newAccessToken);
    }

    public void logout(LogoutRequest req) {
        refreshTokenRepository.deleteByToken(req.refreshToken());
    }

    @Transactional(readOnly = true)
    public ValidateResponse validate(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = bearerToken.substring(7);
        Claims claims = jwtUtil.validateToken(token);
        UUID accountId = jwtUtil.extractAccountId(claims);
        String role = jwtUtil.extractRole(claims);
        return new ValidateResponse(accountId, role, true);
    }
}
