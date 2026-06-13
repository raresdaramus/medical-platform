package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.client.AuthClient;
import com.mediconnect.consultation.dto.ApiResponse;
import com.mediconnect.consultation.dto.DocumentResponse;
import com.mediconnect.consultation.dto.ValidateTokenResponse;
import com.mediconnect.consultation.exception.UnauthorizedException;
import com.mediconnect.consultation.service.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
public class DocumentController {

    private final DocumentService documentService;
    private final AuthClient authClient;

    public DocumentController(DocumentService documentService, AuthClient authClient) {
        this.documentService = documentService;
        this.authClient = authClient;
    }

    @PostMapping("/{consultationId}/documents")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId,
            @RequestParam("file") MultipartFile file) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role()) && !"DOCTOR".equals(token.role())) {
            throw new UnauthorizedException("Not authorized");
        }
        DocumentResponse response = documentService.upload(consultationId, token.accountId(), token.role(), file);
        return ResponseEntity.status(201).body(ApiResponse.created(response));
    }

    @GetMapping("/{consultationId}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID consultationId) {
        authClient.validateToken(auth);
        return ResponseEntity.ok(ApiResponse.ok(documentService.list(consultationId)));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID documentId) {
        ValidateTokenResponse token = authClient.validateToken(auth);
        if (!"PATIENT".equals(token.role()) && !"DOCTOR".equals(token.role())) {
            throw new UnauthorizedException("Not authorized");
        }
        documentService.delete(documentId, token.accountId(), token.role());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID documentId) {
        authClient.validateToken(auth);
        DocumentService.StreamResult result = documentService.stream(documentId);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(result.fileSize())
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" + result.fileName() + "\"")
            .body(result.resource());
    }
}
