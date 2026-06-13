// ─── API Envelope ────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
  status: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type Role = 'PATIENT' | 'DOCTOR';

export interface GdprConsent {
  consentType: 'DATA_PROCESSING' | 'DOCTOR_ACCESS';
  granted: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  gdprConsents: GdprConsent[];
}

export interface RegisterResponse {
  accountId: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  accountId: string;
}

export interface RefreshResponse {
  accessToken: string;
}

// ─── User Service ─────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodType = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';

export interface CreatePatientRequest {
  cnp: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date
  gender: Gender;
  phone: string;
  address: string;
  bloodType: BloodType;
}

export interface PatientResponse {
  id: string;
  accountId: string;
  cnp: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  address: string;
  bloodType: BloodType;
}

export interface CreateDoctorRequest {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinicName: string;
  phone: string;
}

export interface DoctorResponse {
  id: string;
  accountId: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinicName: string;
  phone: string;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ScheduleEntry {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface CreateScheduleEntry {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface AssignDoctorRequest {
  doctorId: string;
}

export type FamilyDoctorRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FamilyDoctorRequestResponse {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: FamilyDoctorRequestStatus;
  message: string | null;
  requestedAt: string;
  respondedAt: string | null;
}

export interface SendFamilyDoctorRequestRequest {
  doctorId: string;
  message?: string;
}

export type PermissionType = 'VIEW_RECORDS' | 'EDIT_RECORDS' | 'FULL_ACCESS';
export type GranteeType = 'DOCTOR';

export interface PermissionResponse {
  id: string;
  patientId: string;
  granteeId: string;
  granteeName?: string;
  granteeType: GranteeType;
  permissionType: PermissionType;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatePermissionRequest {
  granteeId: string;
  granteeType: GranteeType;
  permissionType: PermissionType;
  expiresAt: string | null;
}

export interface PermittedPatientResponse {
  patient: PatientResponse;
  permissionType: PermissionType;
  expiresAt: string | null;
}

// ─── Consultation Service ─────────────────────────────────────────────────────

export type ConsultationType = 'IN_PERSON' | 'TELEMEDICINE';
export type ConsultationStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type UrgencyLevel = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type ReferralType = 'SPECIALIST' | 'LABORATORY' | 'IMAGING' | 'HOSPITAL' | 'OTHER';
export type SeverityLevel = 'MILD' | 'MODERATE' | 'SEVERE';

export interface SlotResponse {
  slotTime: string; // ISO datetime
  available: boolean;
}

export interface CreateConsultationRequest {
  doctorId: string;
  scheduledAt?: string | null; // ISO datetime; null for TELEMEDICINE
  consultationType: ConsultationType;
  slotDurationMinutes?: number;
}

export interface ConsultationResponse {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  scheduledAt: string | null;
  consultationType: ConsultationType;
  status: ConsultationStatus;
  slotDurationMinutes: number;
  createdAt: string;
  nextConsultationId?: string | null;
}

export interface SymptomEntry {
  symptomId?: string;
  symptomName?: string;
  customText?: string;
  severity: SeverityLevel;
  onsetDate?: string;
}

export interface IntakeFormRequest {
  chiefComplaint: string;
  symptomDuration: string;
  currentMedications: string;
  allergies: string;
  additionalNotes: string;
  symptoms: SymptomEntry[];
  temperature?: number | null;
  bloodPressure?: string;
  bloodGlucose?: number | null;
  bodyZone?: string;
  bodyZoneSymptoms?: string;
  symptomOnset?: string;
  painIntensity?: string;
  painType?: string;
  hadSymptomsBefore?: boolean | null;
  generalSymptoms?: string;
  medicationsTakenText?: string;
  knownConditions?: string;
}

export interface IntakeResponse {
  id: string;
  consultationId: string;
  chiefComplaint: string;
  symptomDuration: string;
  currentMedications: string;
  allergies: string;
  additionalNotes: string;
  symptoms: SymptomEntry[];
  submittedAt: string;
  temperature?: number | null;
  bloodPressure?: string;
  bloodGlucose?: number | null;
  bodyZone?: string;
  bodyZoneSymptoms?: string;
  symptomOnset?: string;
  painIntensity?: string;
  painType?: string;
  hadSymptomsBefore?: boolean | null;
  generalSymptoms?: string;
  medicationsTakenText?: string;
  knownConditions?: string;
}

export interface DiagnosisRequest {
  diseaseId?: string;
  customDiagnosis?: string;
  icd10Code?: string;
  confidence: number;
  diagnosisDate: string;
  notes: string;
}

export interface DiagnosisResponse {
  id: string;
  consultationId: string;
  diseaseId?: string;
  diseaseName?: string;
  diseaseNameRo?: string;
  customDiagnosis?: string;
  icd10Code?: string;
  confidence: number;
  diagnosisDate: string;
  notes: string;
}

export interface PrescriptionItem {
  medicationId?: string;
  medicationName?: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
}

export interface PrescriptionRequest {
  diagnosisId?: string;
  treatmentId?: string;
  customInstructions: string;
  validFrom: string;
  validUntil: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItemResponse {
  id: string;
  medicationId?: string;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  quantity?: number;
}

export interface PrescriptionResponse {
  id: string;
  consultationId: string;
  diagnosisId: string;
  customInstructions: string;
  validFrom: string;
  validUntil: string;
  items: PrescriptionItemResponse[];
}

export interface ReferralRequest {
  referralType: ReferralType;
  destination: string;
  reason: string;
  urgency: UrgencyLevel;
}

export interface ReferralResponse {
  id: string;
  consultationId: string;
  referralType: ReferralType;
  destination: string;
  reason: string;
  urgency: UrgencyLevel;
  createdAt: string;
}

export interface DocumentResponse {
  id: string;
  consultationId: string;
  uploadedBy: string;
  uploaderRole: 'PATIENT' | 'DOCTOR';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface FullConsultationResponse extends ConsultationResponse {
  intake?: IntakeResponse;
  diagnoses: DiagnosisResponse[];
  prescriptions: PrescriptionResponse[];
  referrals: ReferralResponse[];
  noteDoctor?: string;
  previousConsultationId?: string | null;
  documents?: DocumentResponse[];
}

export interface CompleteConsultationRequest {
  noteDoctor: string;
  followUpScheduledAt?: string | null;
  followUpDurationMinutes?: number;
}

// ─── Ontology ─────────────────────────────────────────────────────────────────

export interface SymptomDto {
  id: string;
  name: string;
  description?: string;
}

export interface DiseaseDto {
  id: string;
  name: string;
  nameRo?: string;
  icd10Code?: string;
  description?: string;
  category?: string;
}

export interface MedicationDto {
  id: string;
  name: string;
  genericName?: string;
  form?: string;
}

export interface DiseaseSuggestion {
  diseaseId: string;
  diseaseName: string;
  diseaseNameRo?: string;
  icd10Code?: string;
  score: number;
}

export interface AiSuggestion {
  name: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface DiseaseFrequency { name: string; nameRo?: string; icd10Code?: string; category?: string; count: number; }
export interface MonthlyTrend     { diseaseName: string; diseaseNameRo?: string; year: number; month: number; count: number; }
export interface MedDiseaseHeat   { diseaseName: string; diseaseNameRo?: string; medicationName: string; count: number; }
export interface SankeyData       { total: number; completed: number; withDiagnosis: number; withPrescription: number; withReferral: number; withFollowUp: number; }
export interface ReferralUrgency  { urgency: string; year: number; month: number; count: number; }
export interface MedicationFrequency { medicationName: string; count: number; }
export interface SymptomLink      { diseaseId: string; diseaseName: string; diseaseNameRo?: string; symptomId: string; symptomName: string; symptomNameRo?: string; probability: number; isPathognomonic: boolean; }
export interface VitalsPerDisease { diseaseName: string; diseaseNameRo?: string; avgTemperature: number; avgGlucose: number; avgSystolic: number; avgDiastolic: number; count: number; }

export interface StatisticsResponse {
  diseaseFrequency:  DiseaseFrequency[];
  monthlyTrends:     MonthlyTrend[];
  medicationHeatmap: MedDiseaseHeat[];
  sankey:            SankeyData;
  referralUrgency:   ReferralUrgency[];
  topMedications:    MedicationFrequency[];
  symptomNetwork:    SymptomLink[];
  vitalsPerDisease:  VitalsPerDisease[];
}

// ─── Medical Record ───────────────────────────────────────────────────────────

export type RecordEntryType = 'INTAKE' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'REFERRAL';

export interface MedicalRecordResponse {
  id: string;
  consultationId: string;
  patientId: string;
  entryType: RecordEntryType;
  addedAt: string;
  summary?: string;
  doctorName?: string;
  scheduledAt?: string;
  consultationStatus?: ConsultationStatus;
}
