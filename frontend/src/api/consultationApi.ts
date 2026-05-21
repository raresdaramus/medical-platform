import axiosInstance from './axiosInstance';
import type {
  SlotResponse,
  CreateConsultationRequest,
  ConsultationResponse,
  FullConsultationResponse,
  IntakeFormRequest,
  IntakeResponse,
  DiagnosisRequest,
  DiagnosisResponse,
  PrescriptionRequest,
  PrescriptionResponse,
  ReferralRequest,
  ReferralResponse,
  MedicalRecordResponse,
  SymptomDto,
  DiseaseDto,
  MedicationDto,
  DiseaseSuggestion,
  AiSuggestion,
  CompleteConsultationRequest,
  ApiSuccess,
} from '../types';

// ─── Slots ────────────────────────────────────────────────────────────────────

export const getSlots = async (doctorId: string, date: string): Promise<SlotResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<SlotResponse[]>>('/api/consultations/slots', {
    params: { doctorId, date },
  });
  return response.data.data;
};

// ─── Consultations CRUD ───────────────────────────────────────────────────────

export const createConsultation = async (data: CreateConsultationRequest): Promise<ConsultationResponse> => {
  const response = await axiosInstance.post<ApiSuccess<ConsultationResponse>>('/api/consultations', data);
  return response.data.data;
};

export const getConsultation = async (id: string): Promise<FullConsultationResponse> => {
  const response = await axiosInstance.get<ApiSuccess<FullConsultationResponse>>(`/api/consultations/${id}`);
  return response.data.data;
};

export const getDoctorPendingConsultations = async (doctorId: string): Promise<ConsultationResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<ConsultationResponse[]>>(
    `/api/consultations/doctor/${doctorId}/pending`
  );
  return response.data.data;
};

export const getDoctorAllConsultations = async (doctorId: string): Promise<ConsultationResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<ConsultationResponse[]>>(
    `/api/consultations/doctor/${doctorId}/all`
  );
  return response.data.data;
};

export const getPatientConsultations = async (patientId: string): Promise<ConsultationResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<ConsultationResponse[]>>(
    `/api/consultations/patient/${patientId}`
  );
  return response.data.data;
};

// ─── Status transitions ───────────────────────────────────────────────────────

export const confirmConsultation = async (id: string): Promise<ConsultationResponse> => {
  const response = await axiosInstance.put<ApiSuccess<ConsultationResponse>>(`/api/consultations/${id}/confirm`);
  return response.data.data;
};

export const cancelConsultation = async (id: string): Promise<ConsultationResponse> => {
  const response = await axiosInstance.put<ApiSuccess<ConsultationResponse>>(`/api/consultations/${id}/cancel`);
  return response.data.data;
};

export const startConsultation = async (id: string): Promise<ConsultationResponse> => {
  const response = await axiosInstance.put<ApiSuccess<ConsultationResponse>>(`/api/consultations/${id}/start`);
  return response.data.data;
};

export const completeConsultation = async (
  id: string,
  data: CompleteConsultationRequest
): Promise<ConsultationResponse> => {
  const response = await axiosInstance.put<ApiSuccess<ConsultationResponse>>(
    `/api/consultations/${id}/complete`,
    data
  );
  return response.data.data;
};

// ─── Clinical data ────────────────────────────────────────────────────────────

export const submitIntake = async (id: string, data: IntakeFormRequest): Promise<IntakeResponse> => {
  const response = await axiosInstance.post<ApiSuccess<IntakeResponse>>(`/api/consultations/${id}/intake`, data);
  return response.data.data;
};

export const addDiagnosis = async (id: string, data: DiagnosisRequest): Promise<DiagnosisResponse> => {
  const response = await axiosInstance.post<ApiSuccess<DiagnosisResponse>>(`/api/consultations/${id}/diagnosis`, data);
  return response.data.data;
};

export const addPrescription = async (id: string, data: PrescriptionRequest): Promise<PrescriptionResponse> => {
  const response = await axiosInstance.post<ApiSuccess<PrescriptionResponse>>(
    `/api/consultations/${id}/prescription`,
    data
  );
  return response.data.data;
};

export const addReferral = async (id: string, data: ReferralRequest): Promise<ReferralResponse> => {
  const response = await axiosInstance.post<ApiSuccess<ReferralResponse>>(`/api/consultations/${id}/referral`, data);
  return response.data.data;
};

export const linkNextConsultation = async (id: string, nextId: string): Promise<ConsultationResponse> => {
  const response = await axiosInstance.put<ApiSuccess<ConsultationResponse>>(`/api/consultations/${id}/link-next/${nextId}`);
  return response.data.data;
};

export const unlinkNextConsultation = async (id: string): Promise<ConsultationResponse> => {
  const response = await axiosInstance.delete<ApiSuccess<ConsultationResponse>>(`/api/consultations/${id}/link-next`);
  return response.data.data;
};

export const getDoctorPatientConsultations = async (doctorId: string, patientId: string): Promise<ConsultationResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<ConsultationResponse[]>>(
    `/api/consultations/doctor/${doctorId}/patient/${patientId}`
  );
  return response.data.data;
};

// ─── Medical Record ───────────────────────────────────────────────────────────

export const getPatientMedicalRecord = async (patientId: string): Promise<MedicalRecordResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<MedicalRecordResponse[]>>(
    `/api/consultations/patients/${patientId}/record`
  );
  return response.data.data;
};

// ─── Ontology ─────────────────────────────────────────────────────────────────

export const searchSymptoms = async (search: string): Promise<SymptomDto[]> => {
  const response = await axiosInstance.get<ApiSuccess<SymptomDto[]>>('/api/consultations/symptoms', {
    params: { search },
  });
  return response.data.data;
};

export const suggestDiseases = async (symptomIds: string[]): Promise<DiseaseSuggestion[]> => {
  const response = await axiosInstance.get<ApiSuccess<DiseaseSuggestion[]>>('/api/consultations/symptoms/suggest', {
    params: { symptomIds: symptomIds.join(',') },
  });
  return response.data.data;
};

export const searchDiseases = async (search: string): Promise<DiseaseDto[]> => {
  const response = await axiosInstance.get<ApiSuccess<DiseaseDto[]>>('/api/consultations/diseases', {
    params: { search },
  });
  return response.data.data;
};

export const searchMedications = async (search: string): Promise<MedicationDto[]> => {
  const response = await axiosInstance.get<ApiSuccess<MedicationDto[]>>('/api/consultations/medications', {
    params: { search },
  });
  return response.data.data;
};

export const aiSuggestDiagnoses = async (consultationId: string): Promise<AiSuggestion[]> => {
  const response = await axiosInstance.post<ApiSuccess<AiSuggestion[]>>(
    `/api/consultations/${consultationId}/ai-suggest`
  );
  return response.data.data;
};
