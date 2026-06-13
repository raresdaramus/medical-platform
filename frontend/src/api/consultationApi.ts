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
  DocumentResponse,
  StatisticsResponse,
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

export const getStatistics = async (): Promise<StatisticsResponse> => {
  const response = await axiosInstance.get<ApiSuccess<StatisticsResponse>>('/api/consultations/statistics');
  return response.data.data;
};

export const deleteDiagnosis = async (diagnosisId: string): Promise<void> => {
  await axiosInstance.delete(`/api/consultations/diagnosis/${diagnosisId}`);
};

export const deletePrescription = async (prescriptionId: string): Promise<void> => {
  await axiosInstance.delete(`/api/consultations/prescription/${prescriptionId}`);
};

export const deleteReferral = async (referralId: string): Promise<void> => {
  await axiosInstance.delete(`/api/consultations/referral/${referralId}`);
};

export const aiSuggestDiagnoses = async (consultationId: string, lang: string): Promise<AiSuggestion[]> => {
  const response = await axiosInstance.post<ApiSuccess<AiSuggestion[]>>(
    `/api/consultations/${consultationId}/ai-suggest`,
    null,
    { params: { lang } }
  );
  return response.data.data;
};

// ─── Documents ────────────────────────────────────────────────────────────────

export const getDocuments = async (consultationId: string): Promise<DocumentResponse[]> => {
  const response = await axiosInstance.get<ApiSuccess<DocumentResponse[]>>(
    `/api/consultations/${consultationId}/documents`
  );
  return response.data.data;
};

export const uploadDocument = async (consultationId: string, file: File): Promise<DocumentResponse> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosInstance.post<ApiSuccess<DocumentResponse>>(
    `/api/consultations/${consultationId}/documents`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await axiosInstance.delete(`/api/consultations/documents/${documentId}`);
};

export const openDocument = async (documentId: string): Promise<void> => {
  const response = await axiosInstance.get(
    `/api/consultations/documents/${documentId}/download`,
    { responseType: 'blob' }
  );
  const url = URL.createObjectURL(response.data);
  window.open(url, '_blank');
};
