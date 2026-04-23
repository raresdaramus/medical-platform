package com.mediconnect.user.service;

import com.mediconnect.user.dto.*;
import com.mediconnect.user.entity.Doctor;
import com.mediconnect.user.entity.DoctorSchedule;
import com.mediconnect.user.exception.ResourceNotFoundException;
import com.mediconnect.user.exception.UnauthorizedException;
import com.mediconnect.user.mapper.UserMapper;
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

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final PatientRepository patientRepository;
    private final UserMapper userMapper;

    public DoctorService(DoctorRepository doctorRepository,
                         DoctorScheduleRepository scheduleRepository,
                         PatientDoctorAssignmentRepository assignmentRepository,
                         PatientRepository patientRepository,
                         UserMapper userMapper) {
        this.doctorRepository = doctorRepository;
        this.scheduleRepository = scheduleRepository;
        this.assignmentRepository = assignmentRepository;
        this.patientRepository = patientRepository;
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
