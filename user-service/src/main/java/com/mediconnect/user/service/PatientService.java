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
    private final FamilyDoctorRequestRepository familyDoctorRequestRepository;
    private final UserMapper userMapper;

    public PatientService(PatientRepository patientRepository,
                          DoctorRepository doctorRepository,
                          PatientDoctorAssignmentRepository assignmentRepository,
                          DataAccessPermissionRepository permissionRepository,
                          FamilyDoctorRequestRepository familyDoctorRequestRepository,
                          UserMapper userMapper) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.assignmentRepository = assignmentRepository;
        this.permissionRepository = permissionRepository;
        this.familyDoctorRequestRepository = familyDoctorRequestRepository;
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

    // ─── Family Doctor Request ────────────────────────────────────────────────

    public FamilyDoctorRequestResponse sendFamilyDoctorRequest(UUID accountId, SendFamilyDoctorRequestRequest req) {
        Patient patient = patientRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found for account: " + accountId));
        Doctor doctor = doctorRepository.findById(req.doctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + req.doctorId()));

        assignmentRepository.findByPatientIdAndIsActiveTrue(patient.getId()).ifPresent(a -> {
            if (a.getDoctorId().equals(doctor.getId()))
                throw new IllegalArgumentException("Already assigned to this doctor");
        });

        familyDoctorRequestRepository
            .findByPatientIdAndDoctorIdAndStatus(patient.getId(), doctor.getId(), "PENDING")
            .ifPresent(r -> { throw new IllegalArgumentException("A pending request already exists for this doctor"); });

        FamilyDoctorRequest request = new FamilyDoctorRequest();
        request.setPatientId(patient.getId());
        request.setDoctorId(doctor.getId());
        request.setStatus("PENDING");
        request.setMessage(req.message());
        request.setRequestedAt(LocalDateTime.now());
        return toRequestResponse(familyDoctorRequestRepository.save(request), patient, doctor);
    }

    @Transactional(readOnly = true)
    public List<FamilyDoctorRequestResponse> getIncomingRequests(UUID accountId) {
        Doctor doctor = doctorRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for account: " + accountId));
        return familyDoctorRequestRepository.findByDoctorIdAndStatus(doctor.getId(), "PENDING")
            .stream()
            .map(r -> {
                Patient patient = patientRepository.findById(r.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + r.getPatientId()));
                return toRequestResponse(r, patient, doctor);
            })
            .collect(Collectors.toList());
    }

    public FamilyDoctorRequestResponse respondToRequest(UUID requestId, boolean accept, UUID accountId) {
        Doctor doctor = doctorRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for account: " + accountId));
        FamilyDoctorRequest request = familyDoctorRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));
        if (!request.getDoctorId().equals(doctor.getId()))
            throw new UnauthorizedException("Not authorized to respond to this request");
        if (!"PENDING".equals(request.getStatus()))
            throw new IllegalArgumentException("Request is no longer pending");

        request.setStatus(accept ? "ACCEPTED" : "REJECTED");
        request.setRespondedAt(LocalDateTime.now());
        familyDoctorRequestRepository.save(request);

        if (accept) {
            assignmentRepository.findByPatientIdAndIsActiveTrue(request.getPatientId()).ifPresent(existing -> {
                existing.setIsActive(false);
                existing.setRevokedAt(LocalDateTime.now());
                assignmentRepository.save(existing);
            });
            assignmentRepository.findByPatientIdAndDoctorId(request.getPatientId(), doctor.getId())
                .map(existing -> {
                    existing.setIsActive(true);
                    existing.setAssignedAt(LocalDateTime.now());
                    existing.setConsentGivenAt(LocalDateTime.now());
                    existing.setRevokedAt(null);
                    return assignmentRepository.save(existing);
                })
                .orElseGet(() -> {
                    PatientDoctorAssignment assignment = new PatientDoctorAssignment();
                    assignment.setPatientId(request.getPatientId());
                    assignment.setDoctorId(doctor.getId());
                    assignment.setAssignedAt(LocalDateTime.now());
                    assignment.setIsActive(true);
                    assignment.setConsentGivenAt(LocalDateTime.now());
                    return assignmentRepository.save(assignment);
                });
        }

        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));
        return toRequestResponse(request, patient, doctor);
    }

    @Transactional(readOnly = true)
    public List<FamilyDoctorRequestResponse> getMyRequests(UUID accountId) {
        Patient patient = patientRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found for account: " + accountId));
        return familyDoctorRequestRepository.findByPatientIdOrderByRequestedAtDesc(patient.getId())
            .stream()
            .map(r -> {
                Doctor doctor = doctorRepository.findById(r.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + r.getDoctorId()));
                return toRequestResponse(r, patient, doctor);
            })
            .collect(Collectors.toList());
    }

    public void cancelFamilyDoctorRequest(UUID requestId, UUID accountId) {
        Patient patient = patientRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found for account: " + accountId));
        FamilyDoctorRequest request = familyDoctorRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));
        if (!request.getPatientId().equals(patient.getId()))
            throw new UnauthorizedException("Not authorized to cancel this request");
        if (!"PENDING".equals(request.getStatus()))
            throw new IllegalArgumentException("Only pending requests can be cancelled");
        familyDoctorRequestRepository.delete(request);
    }

    private FamilyDoctorRequestResponse toRequestResponse(FamilyDoctorRequest r, Patient patient, Doctor doctor) {
        return new FamilyDoctorRequestResponse(
            r.getId(),
            patient.getId(),
            patient.getFirstName() + " " + patient.getLastName(),
            doctor.getId(),
            doctor.getFirstName() + " " + doctor.getLastName(),
            r.getStatus(),
            r.getMessage(),
            r.getRequestedAt(),
            r.getRespondedAt()
        );
    }
}
