import axiosInstance from './axiosInstance';
import type {
  CreatePatientRequest,
  PatientResponse,
  CreateDoctorRequest,
  DoctorResponse,
  UpdateDoctorProfileRequest,
  ScheduleEntry,
  CreateScheduleEntry,
  AssignDoctorRequest,
  PermissionResponse,
  CreatePermissionRequest,
  PermittedPatientResponse,
  FamilyDoctorRequestResponse,
  SendFamilyDoctorRequestRequest,
  ApiSuccess,
} from '../types';

// ─── Patient endpoints ────────────────────────────────────────────────────────

export const createPatient = async (data: CreatePatientRequest): Promise<PatientResponse> => {
  const response = await axiosInstance.post<ApiSuccess<PatientResponse>>('/api/users/patients', data);
  return response.data.data;
};

export const getPatient = async (patientId: string): Promise<PatientResponse> => {
  const response = await axiosInstance.get<ApiSuccess<PatientResponse>>(`/api/users/patients/${patientId}`);
  return response.data.data;
};

export const getMyPatient = async (): Promise<PatientResponse> => {
  const response = await axiosInstance.get<ApiSuccess<PatientResponse>>('/api/users/patients/me');
  return response.data.data;
};

// ─── Doctor endpoints ─────────────────────────────────────────────────────────

export const createDoctor = async (data: CreateDoctorRequest): Promise<DoctorResponse> => {
  const response = await axiosInstance.post<ApiSuccess<DoctorResponse>>('/api/users/doctors', data);
  return response.data.data;
};

export const getDoctor = async (doctorId: string): Promise<DoctorResponse> => {
  const response = await axiosInstance.get<ApiSuccess<DoctorResponse>>(`/api/users/doctors/${doctorId}`);
  return response.data.data;
};

export const getMyDoctor = async (): Promise<DoctorResponse> => {
  const response = await axiosInstance.get<ApiSuccess<DoctorResponse>>('/api/users/doctors/me');
  return response.data.data;
};

export const updateMyDoctorProfile = async (data: UpdateDoctorProfileRequest): Promise<DoctorResponse> => {
  const response = await axiosInstance.put<ApiSuccess<DoctorResponse>>('/api/users/doctors/me', data);
  return response.data.data;
};

export const searchDoctors = async (search?: string): Promise<DoctorResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<DoctorResponse[]>>('/api/users/doctors', {
    params: search ? { search } : {},
  });
  return response.data.data;
};

// ─── Schedule endpoints ───────────────────────────────────────────────────────

export const getDoctorSchedule = async (doctorId: string): Promise<ScheduleEntry[]> => {
  const response = await axiosInstance.get<ApiSuccess<ScheduleEntry[]>>(`/api/users/doctors/${doctorId}/schedule`);
  return response.data.data;
};

export const updateDoctorSchedule = async (
  doctorId: string,
  entries: CreateScheduleEntry[]
): Promise<ScheduleEntry[]> => {
  const response = await axiosInstance.post<ApiSuccess<ScheduleEntry[]>>(
    `/api/users/doctors/${doctorId}/schedule`,
    entries
  );
  return response.data.data;
};

// ─── Assignment endpoints ─────────────────────────────────────────────────────

export const assignDoctor = async (data: AssignDoctorRequest): Promise<void> => {
  await axiosInstance.post('/api/users/assignments', data);
};

export const getDoctorPatients = async (doctorId: string): Promise<PatientResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<PatientResponse[]>>(`/api/users/doctors/${doctorId}/patients`);
  return response.data.data;
};

export const getPermittedPatients = async (doctorId: string): Promise<PermittedPatientResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<PermittedPatientResponse[]>>(`/api/users/doctors/${doctorId}/permitted-patients`);
  return response.data.data;
};

export const getPatientDoctor = async (patientId: string): Promise<DoctorResponse | null> => {
  try {
    const response = await axiosInstance.get<ApiSuccess<DoctorResponse>>(`/api/users/patients/${patientId}/doctor`);
    return response.data.data;
  } catch {
    return null;
  }
};

// ─── Permission endpoints ─────────────────────────────────────────────────────

export const getPatientPermissions = async (patientId: string): Promise<PermissionResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<PermissionResponse[]>>(
    `/api/users/patients/${patientId}/permissions`
  );
  return response.data.data;
};

export const createPermission = async (
  patientId: string,
  data: CreatePermissionRequest
): Promise<PermissionResponse> => {
  const response = await axiosInstance.post<ApiSuccess<PermissionResponse>>(
    `/api/users/patients/${patientId}/permissions`,
    data
  );
  return response.data.data;
};

export const deletePermission = async (patientId: string, permissionId: string): Promise<void> => {
  await axiosInstance.delete(`/api/users/patients/${patientId}/permissions/${permissionId}`);
};

// ─── Family Doctor Request endpoints ─────────────────────────────────────────

export const sendFamilyDoctorRequest = async (
  data: SendFamilyDoctorRequestRequest
): Promise<FamilyDoctorRequestResponse> => {
  const response = await axiosInstance.post<ApiSuccess<FamilyDoctorRequestResponse>>(
    '/api/users/family-doctor-requests',
    data
  );
  return response.data.data;
};

export const getMyFamilyDoctorRequests = async (): Promise<FamilyDoctorRequestResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<FamilyDoctorRequestResponse[]>>(
    '/api/users/family-doctor-requests/mine'
  );
  return response.data.data;
};

export const cancelFamilyDoctorRequest = async (requestId: string): Promise<void> => {
  await axiosInstance.delete(`/api/users/family-doctor-requests/${requestId}`);
};

export const getIncomingFamilyDoctorRequests = async (): Promise<FamilyDoctorRequestResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<FamilyDoctorRequestResponse[]>>(
    '/api/users/family-doctor-requests/incoming'
  );
  return response.data.data;
};

export const respondToFamilyDoctorRequest = async (
  requestId: string,
  accept: boolean
): Promise<FamilyDoctorRequestResponse> => {
  const response = await axiosInstance.put<ApiSuccess<FamilyDoctorRequestResponse>>(
    `/api/users/family-doctor-requests/${requestId}/respond`,
    { accept }
  );
  return response.data.data;
};
