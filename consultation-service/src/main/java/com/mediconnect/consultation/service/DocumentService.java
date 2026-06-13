package com.mediconnect.consultation.service;

import com.mediconnect.consultation.dto.DocumentResponse;
import com.mediconnect.consultation.entity.ConsultationDocument;
import com.mediconnect.consultation.exception.ResourceNotFoundException;
import com.mediconnect.consultation.repository.ConsultationDocumentRepository;
import com.mediconnect.consultation.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final int MAX_DOCUMENTS = 10;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final ConsultationDocumentRepository documentRepository;
    private final ConsultationRepository consultationRepository;

    @Value("${upload.dir:/uploads}")
    private String uploadDir;

    public DocumentService(ConsultationDocumentRepository documentRepository,
                           ConsultationRepository consultationRepository) {
        this.documentRepository = documentRepository;
        this.consultationRepository = consultationRepository;
    }

    public DocumentResponse upload(UUID consultationId, UUID uploaderId, String role, MultipartFile file) {
        consultationRepository.findById(consultationId)
            .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        if (documentRepository.countByConsultationId(consultationId) >= MAX_DOCUMENTS) {
            throw new IllegalArgumentException("Maximum of " + MAX_DOCUMENTS + " documents per consultation");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 10 MB limit");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        if (!originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        String storedName = UUID.randomUUID() + ".pdf";
        Path dest = Paths.get(uploadDir, consultationId.toString(), storedName);
        try {
            Files.createDirectories(dest.getParent());
            Files.copy(file.getInputStream(), dest);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }

        ConsultationDocument doc = new ConsultationDocument();
        doc.setConsultationId(consultationId);
        doc.setUploadedBy(uploaderId);
        doc.setUploaderRole(role);
        doc.setFileName(originalName);
        doc.setFilePath(dest.toString());
        doc.setFileSize(file.getSize());
        doc = documentRepository.save(doc);

        return toResponse(doc);
    }

    public List<DocumentResponse> list(UUID consultationId) {
        return documentRepository.findByConsultationIdOrderByUploadedAtAsc(consultationId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public record StreamResult(InputStreamResource resource, String fileName, Long fileSize) {}

    public StreamResult stream(UUID documentId) {
        ConsultationDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        try {
            FileInputStream fis = new FileInputStream(doc.getFilePath());
            return new StreamResult(new InputStreamResource(fis), doc.getFileName(), doc.getFileSize());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file");
        }
    }

    public void delete(UUID documentId, UUID requesterId, String role) {
        ConsultationDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if ("PATIENT".equals(role) && !doc.getUploadedBy().equals(requesterId)) {
            throw new com.mediconnect.consultation.exception.UnauthorizedException("You can only delete your own documents");
        }
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException e) {
            // file already gone — still remove DB record
        }
        documentRepository.delete(doc);
    }

    private DocumentResponse toResponse(ConsultationDocument doc) {
        return new DocumentResponse(
            doc.getId(), doc.getConsultationId(), doc.getUploadedBy(),
            doc.getUploaderRole(), doc.getFileName(), doc.getFileSize(), doc.getUploadedAt()
        );
    }
}
