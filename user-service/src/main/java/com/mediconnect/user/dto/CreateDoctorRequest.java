package com.mediconnect.user.dto;
public record CreateDoctorRequest(String licenseNumber, String firstName, String lastName, String specialization, String clinicName, String phone) {}
