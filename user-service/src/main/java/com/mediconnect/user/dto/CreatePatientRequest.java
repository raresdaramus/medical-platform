package com.mediconnect.user.dto;
import java.time.LocalDate;
public record CreatePatientRequest(String cnp, String firstName, String lastName, LocalDate dateOfBirth, String gender, String phone, String address, String bloodType) {}
