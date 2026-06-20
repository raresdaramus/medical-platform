package com.mediconnect.user.service;

import com.mediconnect.user.dto.*;
import com.mediconnect.user.entity.DataAccessPermission;
import com.mediconnect.user.entity.Doctor;
import com.mediconnect.user.entity.DoctorSchedule;
import com.mediconnect.user.entity.Patient;
import com.mediconnect.user.exception.ResourceNotFoundException;
import com.mediconnect.user.exception.UnauthorizedException;
import com.mediconnect.user.mapper.UserMapper;
import com.mediconnect.user.repository.DataAccessPermissionRepository;
import com.mediconnect.user.repository.DoctorRepository;
import com.mediconnect.user.repository.DoctorScheduleRepository;
import com.mediconnect.user.repository.PatientDoctorAssignmentRepository;
import com.mediconnect.user.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final PatientRepository patientRepository;
    private final DataAccessPermissionRepository permissionRepository;
    private final UserMapper userMapper;

    public DoctorService(DoctorRepository doctorRepository,
                         DoctorScheduleRepository scheduleRepository,
                         PatientDoctorAssignmentRepository assignmentRepository,
                         PatientRepository patientRepository,
                         DataAccessPermissionRepository permissionRepository,
                         UserMapper userMapper) {
        this.doctorRepository = doctorRepository;
        this.scheduleRepository = scheduleRepository;
        this.assignmentRepository = assignmentRepository;
        this.patientRepository = patientRepository;
        this.permissionRepository = permissionRepository;
        this.userMapper = userMapper;
    }

    public DoctorResponse createDoctor(CreateDoctorRequest req, UUID accountId) {
        Doctor doctor = new Doctor();
        doctor.setAccountId(accountId);
        doctor.setLicenseNumber(req.licenseNumber());
        doctor.setFirstName(req.firstName());
        doctor.setLastName(req.lastName());
        doctor.setSpecialization(req.specialization());
        doctor.setClinicName(req.clinicName());
        doctor.setPhone(req.phone());
        doctor.setIsAcceptingPatients(true);
        doctor.setCreatedAt(LocalDateTime.now());
        return userMapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctor(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));
        return userMapper.toDoctorResponse(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> searchDoctors(String query) {
        List<Doctor> doctors = (query == null || query.isBlank())
            ? doctorRepository.findAll()
            : doctorRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
        return doctors.stream().map(userMapper::toDoctorResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByAccountId(UUID accountId) {
        Doctor doctor = doctorRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for account: " + accountId));
        return userMapper.toDoctorResponse(doctor);
    }

    public DoctorResponse updateMyProfile(UUID accountId, UpdateDoctorProfileRequest req) {
        Doctor doctor = doctorRepository.findByAccountId(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for account: " + accountId));
        doctor.setClinicName(req.clinicName());
        doctor.setPhone(req.phone());
        doctor.setCui(req.cui());
        doctor.setClinicAddress(req.clinicAddress());
        doctor.setCas(req.cas());
        doctor.setCnasContractNumber(req.cnasContractNumber());
        doctor.setProviderType(req.providerType());
        return userMapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public List<ScheduleEntryResponse> getSchedule(UUID doctorId) {
        return scheduleRepository.findByDoctorIdAndIsActiveTrue(doctorId)
            .stream().map(userMapper::toScheduleResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getDoctorPatients(UUID doctorId) {
        return assignmentRepository.findByDoctorIdAndIsActiveTrue(doctorId).stream()
            .map(assignment -> patientRepository.findById(assignment.getPatientId()).orElse(null))
            .filter(p -> p != null)
            .map(userMapper::toPatientResponse)
            .collect(Collectors.toList());
    }

    /**
     * Whether a doctor may view a patient's medical record: either the patient's
     * active family doctor, or the holder of an active (non-expired) data-access
     * permission for that patient. Both parameters are account ids.
     */
    @Transactional(readOnly = true)
    public boolean canDoctorAccessPatient(UUID doctorAccountId, UUID patientAccountId) {
        Doctor doctor = doctorRepository.findByAccountId(doctorAccountId).orElse(null);
        if (doctor == null) return false;
        Patient patient = patientRepository.findByAccountId(patientAccountId).orElse(null);
        if (patient == null) return false;

        boolean isFamilyDoctor = assignmentRepository
            .findByPatientIdAndDoctorId(patient.getId(), doctor.getId())
            .map(a -> Boolean.TRUE.equals(a.getIsActive()))
            .orElse(false);
        if (isFamilyDoctor) return true;

        return permissionRepository.findByGranteeIdAndIsActiveTrue(doctor.getId()).stream()
            .anyMatch(p -> p.getPatientId().equals(patient.getId()) && p.isNotExpired());
    }

    @Transactional(readOnly = true)
    public List<PermittedPatientResponse> getPermittedPatients(UUID doctorId) {
        return permissionRepository.findByGranteeIdAndIsActiveTrue(doctorId)
            .stream()
            .filter(DataAccessPermission::isNotExpired)
            .map(permission -> patientRepository.findById(permission.getPatientId())
                .map(patient -> new PermittedPatientResponse(
                    userMapper.toPatientResponse(patient),
                    permission.getPermissionType(),
                    permission.getExpiresAt()
                ))
                .orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    public List<ScheduleEntryResponse> createSchedule(UUID doctorId, UUID accountId, List<ScheduleEntryRequest> entries) {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));
        if (!doctor.getAccountId().equals(accountId)) {
            throw new UnauthorizedException("Not authorized to manage this doctor's schedule");
        }
        scheduleRepository.deleteByDoctorIdAndIsActiveTrue(doctorId);
        List<DoctorSchedule> schedules = entries.stream().map(entry -> {
            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setDoctorId(doctorId);
            schedule.setDayOfWeek(entry.dayOfWeek());
            schedule.setStartTime(entry.startTime());
            schedule.setEndTime(entry.endTime());
            schedule.setSlotDurationMinutes(entry.slotDurationMinutes() != null ? entry.slotDurationMinutes() : 30);
            schedule.setIsActive(true);
            return schedule;
        }).collect(Collectors.toList());
        return scheduleRepository.saveAll(schedules)
            .stream().map(userMapper::toScheduleResponse).collect(Collectors.toList());
    }
}
