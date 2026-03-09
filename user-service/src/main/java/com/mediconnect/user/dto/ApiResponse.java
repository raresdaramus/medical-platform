package com.mediconnect.user.dto;

public record ApiResponse<T>(T data, int status) {
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(data, 200); }
    public static <T> ApiResponse<T> created(T data) { return new ApiResponse<>(data, 201); }
}
