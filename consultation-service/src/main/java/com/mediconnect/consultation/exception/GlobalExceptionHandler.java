package com.mediconnect.consultation.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private ResponseEntity<Map<String, Object>> error(String code, String message, int status) {
        return ResponseEntity.status(status).body(Map.of("error", Map.of("code", code, "message", message), "status", status));
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException ex) { return error("NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND.value()); }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> unauthorized(UnauthorizedException ex) { return error("FORBIDDEN", ex.getMessage(), HttpStatus.FORBIDDEN.value()); }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) { return error("BAD_REQUEST", ex.getMessage(), HttpStatus.BAD_REQUEST.value()); }
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> conflict(IllegalStateException ex) { return error("CONFLICT", ex.getMessage(), HttpStatus.CONFLICT.value()); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return error("INTERNAL_ERROR", "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR.value());
    }
}
