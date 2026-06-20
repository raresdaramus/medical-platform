package com.mediconnect.user.mapper;

import com.mediconnect.user.dto.*;
import com.mediconnect.user.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    PatientResponse toPatientResponse(Patient patient);
    DoctorResponse toDoctorResponse(Doctor doctor);
    ScheduleEntryResponse toScheduleResponse(DoctorSchedule schedule);
    AssignmentResponse toAssignmentResponse(PatientDoctorAssignment assignment);
}
