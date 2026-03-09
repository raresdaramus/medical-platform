package com.mediconnect.user.service;

import com.mediconnect.user.dto.*;
import com.mediconnect.user.entity.*;
import com.mediconnect.user.exception.ResourceNotFoundException;
import com.mediconnect.user.exception.UnauthorizedException;
import com.mediconnect.user.mapper.UserMapper;
import com.mediconnect.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final DataAccessPermissionRepository permissionRepository;
    private final UserMapper userMapper;

    public PatientService(PatientRepository patientRepository,
                          DoctorRepository doctorRepository,
                          PatientDoctorAssignmentRepository assignmentRepository,
                          DataAccessPermissionRepository permissionRepository,
                          UserMapper userMapper) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.assignmentRepository = assignmentRepository;
        this.permissionRepository = permissionRepository;
        this.userMapper = userMapper;
    }

    public PatientResponse createPatient(CreatePatientRequest req, UUID accountId) {
        if (patientRepository.existsByAccountId(accountId)) {
            throw new IllegalArgumentException("Patient profile already exists for this account");
        }
        Patient patient = new Patient();
        patient.setAccountId(accountId);
        patient.setCnp(req.cnp());
        patient.setFirstName(req.firstName());
        patient.setLastName(req.lastName());
        patient.setDateOfBirth(req.dateOfBirth());
        patient.setGender(req.gender());
        patient.setPhone(req.phone());
        patient.setAddress(req.address());
        patient.setBloodType(req.bloodType());
        patient.setCreatedAt(LocalDateTime.now());
        return userMapper.toPatientResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        return userMapper.toPatientResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByAccountId(UUID accountId) {
        Patient patient = patientRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found for account: " + accountId));
        return userMapper.toPatientResponse(patient);
    }

    public AssignmentResponse assignDoctor(UUID accountId, AssignDoctorRequest req) {
        Patient patient = patientRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found for account: " + accountId));
        Doctor doctor = doctorRepository.findById(req.doctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + req.doctorId()));

        return assignmentRepository.findByPatientIdAndDoctorId(patient.getId(), doctor.getId())
            .map(existing -> {
                if (Boolean.TRUE.equals(existing.getIsActive())) {
                    throw new IllegalArgumentException("Already assigned to this doctor");
                }
                existing.setIsActive(true);
                existing.setAssignedAt(LocalDateTime.now());
                existing.setConsentGivenAt(LocalDateTime.now());
                existing.setRevokedAt(null);
                return userMapper.toAssignmentResponse(assignmentRepository.save(existing));
            })
            .orElseGet(() -> {
                PatientDoctorAssignment assignment = new PatientDoctorAssignment();
                assignment.setPatientId(patient.getId());
                assignment.setDoctorId(doctor.getId());
                assignment.setAssignedAt(LocalDateTime.now());
                assignment.setIsActive(true);
                assignment.setConsentGivenAt(LocalDateTime.now());
                return userMapper.toAssignmentResponse(assignmentRepository.save(assignment));
            });
    }

    @Transactional(readOnly = true)
    public DoctorResponse getAssignedDoctor(UUID patientId) {
        PatientDoctorAssignment assignment = assignmentRepository.findByPatientIdAndIsActiveTrue(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("No active doctor assignment for patient: " + patientId));
        Doctor doctor = doctorRepository.findById(assignment.getDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + assignment.getDoctorId()));
        return userMapper.toDoctorResponse(doctor);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissions(UUID patientId) {
        return permissionRepository.findByPatientIdAndIsActiveTrue(patientId)
            .stream().map(userMapper::toPermissionResponse).collect(Collectors.toList());
    }

    public PermissionResponse grantPermission(UUID patientId, UUID accountId, PermissionRequest req) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        if (!patient.getAccountId().equals(accountId)) {
            throw new UnauthorizedException("Not authorized to manage permissions for this patient");
        }
        DataAccessPermission permission = new DataAccessPermission();
        permission.setPatientId(patientId);
        permission.setGranteeId(req.granteeId());
        permission.setGranteeType(req.granteeType());
        permission.setPermissionType(req.permissionType());
        permission.setGrantedAt(LocalDateTime.now());
        permission.setExpiresAt(req.expiresAt());
        permission.setIsActive(true);
        return userMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    public void revokePermission(UUID patientId, UUID permissionId, UUID accountId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
        if (!patient.getAccountId().equals(accountId)) {
            throw new UnauthorizedException("Not authorized to manage permissions for this patient");
        }
        DataAccessPermission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + permissionId));
        permission.setIsActive(false);
        permission.setRevokedAt(LocalDateTime.now());
        permissionRepository.save(permission);
    }
}
