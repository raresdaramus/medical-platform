import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getConsultation,
  startConsultation,
  completeConsultation,
  addDiagnosis,
  addPrescription,
  addReferral,
  aiSuggestDiagnoses,
  searchDiseases,
  searchMedications,
  submitIntake,
  linkNextConsultation,
  unlinkNextConsultation,
  searchSymptoms,
  getSlots,
} from '../../api/consultationApi';
import type {
  FullConsultationResponse,
  ConsultationStatus,
  DiagnosisRequest,
  PrescriptionRequest,
  PrescriptionItem,
  ReferralRequest,
  ReferralType,
  UrgencyLevel,
  DiseaseDto,
  MedicationDto,
  AiSuggestion,
  IntakeFormRequest,
  SymptomEntry,
  SymptomDto,
  SeverityLevel,
  SlotResponse,
} from '../../types';

type Tab = 'overview' | 'intake' | 'symptoms' | 'diagnosis' | 'prescription' | 'referral';

function StatusBadge({ status, t }: { status: ConsultationStatus; t: (k: string) => string }) {
  const map: Record<string, string> = {
    PENDING: 'badge-yellow',
    CONFIRMED: 'badge-blue',
    IN_PROGRESS: 'badge-green',
    COMPLETED: 'badge-slate',
    CANCELLED: 'badge-red',
  };
  const cls = map[status] ?? 'badge-slate';
  return <span className={cls}>{t('status.' + status)}</span>;
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  consultation,
  onStart,
  onComplete,
  actionLoading,
}: {
  consultation: FullConsultationResponse;
  onStart: () => void;
  onComplete: (note: string, followUpScheduledAt?: string) => void;
  actionLoading: boolean;
}) {
  const { t } = useTranslation();
  const [noteDoctor, setNoteDoctor] = useState('');
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpSlot, setFollowUpSlot] = useState('');
  const [followUpSlots, setFollowUpSlots] = useState<SlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!needsFollowUp || !followUpDate) { setFollowUpSlots([]); return; }
    setSlotsLoading(true);
    setFollowUpSlot('');
    getSlots(consultation.doctorId, followUpDate)
      .then(s => setFollowUpSlots(s.filter(sl => sl.available)))
      .catch(() => setFollowUpSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [needsFollowUp, followUpDate]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{t('workspace.consultationInfo')}</h3>
          <StatusBadge status={consultation.status} t={t} />
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('workspace.scheduled')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5">
                {consultation.scheduledAt
                  ? new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })
                  : <span className="italic text-slate-400">{t('consultations.async')}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('workspace.type')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5 capitalize">
                {consultation.consultationType.replace('_', ' ').toLowerCase()}
              </dd>
            </div>
            {consultation.scheduledAt && (
              <div>
                <dt className="text-slate-500">{t('workspace.duration')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{consultation.slotDurationMinutes} {t('common.min')}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Intake summary (TELEMEDICINE only; IN_PERSON has its own tab) */}
      {consultation.intake && consultation.consultationType !== 'IN_PERSON' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">{t('workspace.patientIntake')}</h3>
          </div>
          <div className="card-body text-sm space-y-2">
            <div><span className="text-slate-500">{t('workspace.chiefComplaint')}: </span><span className="font-medium">{consultation.intake.chiefComplaint}</span></div>
            {consultation.intake.temperature != null && <div><span className="text-slate-500">{t('workspace.temperature')}: </span><span className="font-medium">{consultation.intake.temperature} °C</span></div>}
            {consultation.intake.bloodPressure && <div><span className="text-slate-500">{t('workspace.bloodPressure')}: </span><span className="font-medium">{consultation.intake.bloodPressure}</span></div>}
            {consultation.intake.bloodGlucose != null && <div><span className="text-slate-500">{t('workspace.bloodGlucose')}: </span><span className="font-medium">{consultation.intake.bloodGlucose} mg/dL</span></div>}
            {consultation.intake.symptomOnset && <div><span className="text-slate-500">{t('workspace.symptomOnset')}: </span>{consultation.intake.symptomOnset}</div>}
            {consultation.intake.painIntensity && <div><span className="text-slate-500">{t('workspace.painIntensity')}: </span>{consultation.intake.painIntensity}</div>}
            {consultation.intake.painType && <div><span className="text-slate-500">{t('workspace.painType')}: </span>{consultation.intake.painType}</div>}
            {consultation.intake.hadSymptomsBefore != null && <div><span className="text-slate-500">{t('workspace.hadBefore')}: </span>{consultation.intake.hadSymptomsBefore ? t('common.yes') : t('common.no')}</div>}
            {consultation.intake.bodyZone && <div><span className="text-slate-500">{t('workspace.bodyZone')}: </span><span className="font-medium">{consultation.intake.bodyZone}</span></div>}
            {consultation.intake.bodyZoneSymptoms && <div><span className="text-slate-500">{t('workspace.zoneSymptoms')}: </span>{consultation.intake.bodyZoneSymptoms}</div>}
            {consultation.intake.generalSymptoms && <div><span className="text-slate-500">{t('workspace.generalSymptoms')}: </span>{consultation.intake.generalSymptoms}</div>}
            {consultation.intake.knownConditions && <div><span className="text-slate-500">{t('workspace.knownConditions')}: </span>{consultation.intake.knownConditions}</div>}
            {consultation.intake.medicationsTakenText && <div><span className="text-slate-500">{t('workspace.medsTaken')}: </span>{consultation.intake.medicationsTakenText}</div>}
            {consultation.intake.currentMedications && <div><span className="text-slate-500">{t('workspace.currentMedications')}: </span>{consultation.intake.currentMedications}</div>}
            {consultation.intake.allergies && <div><span className="text-slate-500">{t('workspace.allergies')}: </span>{consultation.intake.allergies}</div>}
            {consultation.intake.additionalNotes && <div><span className="text-slate-500">{t('workspace.notes')}: </span>{consultation.intake.additionalNotes}</div>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card card-body flex flex-wrap gap-3">
        {consultation.status === 'CONFIRMED' && (
          <button className="btn-success" onClick={onStart} disabled={actionLoading}>
            {actionLoading ? '…' : t('workspace.startConsultation')}
          </button>
        )}
        {consultation.status === 'IN_PROGRESS' && (
          <div className="w-full space-y-4">
            <div>
              <label className="label">{t('workspace.doctorsClosingNote')}</label>
              <textarea
                className="input-field"
                rows={3}
                value={noteDoctor}
                onChange={(e) => setNoteDoctor(e.target.value)}
                placeholder={t('workspace.closingNotePlaceholder')}
              />
            </div>

            {/* Follow-up toggle */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={needsFollowUp}
                onChange={(e) => { setNeedsFollowUp(e.target.checked); setFollowUpDate(''); setFollowUpSlot(''); }}
              />
              <span className="text-sm font-medium text-slate-700">{t('workspace.followUp.needsFollowUp')}</span>
            </label>

            {/* Follow-up date + slot picker */}
            {needsFollowUp && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-blue-900">{t('workspace.followUp.scheduleTitle')}</h4>
                <div>
                  <label className="label">{t('workspace.followUp.scheduleDate')}</label>
                  <input
                    type="date"
                    className="input-field"
                    value={followUpDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => { setFollowUpDate(e.target.value); setFollowUpSlot(''); }}
                  />
                </div>
                {followUpDate && (
                  slotsLoading ? (
                    <p className="text-sm text-slate-400">{t('workspace.followUp.loadingSlots')}</p>
                  ) : followUpSlots.length === 0 ? (
                    <p className="text-sm text-slate-500">{t('workspace.followUp.noSlots')}</p>
                  ) : (
                    <div>
                      <label className="label">{t('workspace.followUp.scheduleTime')}</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                        {followUpSlots.map((slot) => (
                          <button
                            key={slot.slotTime}
                            type="button"
                            onClick={() => setFollowUpSlot(slot.slotTime)}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                              followUpSlot === slot.slotTime
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                            }`}
                          >
                            {slot.slotTime}
                          </button>
                        ))}
                      </div>
                      {followUpSlot && (
                        <p className="text-xs text-blue-700 mt-2">
                          {t('workspace.followUp.selectedSlot')}: <strong>{followUpDate} {followUpSlot}</strong>
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={() => {
                const followUpScheduledAt = (needsFollowUp && followUpDate && followUpSlot)
                  ? `${followUpDate}T${followUpSlot}:00`
                  : undefined;
                onComplete(noteDoctor, followUpScheduledAt);
              }}
              disabled={actionLoading || (needsFollowUp && (!followUpDate || !followUpSlot))}
            >
              {actionLoading
                ? '…'
                : (needsFollowUp && followUpDate && followUpSlot)
                  ? t('workspace.followUp.completeAndSchedule')
                  : t('workspace.completeConsultation')}
            </button>
          </div>
        )}
        {['COMPLETED', 'CANCELLED'].includes(consultation.status) && (
          <p className="text-slate-500 text-sm">
            {t('status.' + consultation.status)}
          </p>
        )}
        {consultation.status === 'PENDING' && (
          <p className="text-slate-500 text-sm">{t('workspace.waitingConfirmation')}</p>
        )}
      </div>
    </div>
  );
}

// ─── Symptoms Tab ─────────────────────────────────────────────────────────────

function SymptomsTab({ consultation }: { consultation: FullConsultationResponse }) {
  const { t } = useTranslation();
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const symptoms = consultation.intake?.symptoms ?? [];

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const data = await aiSuggestDiagnoses(consultation.id);
      setAiSuggestions(data);
    } catch {
      setAiError(t('workspace.aiSuggestError'));
    } finally {
      setAiLoading(false);
    }
  };

  const confidenceBadge = (c: string) =>
    c === 'high' ? 'badge-green' : c === 'low' ? 'badge-red' : 'badge-yellow';

  return (
    <div className="space-y-4">
      {/* AI Suggest button — always visible */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          onClick={handleAiSuggest}
          disabled={aiLoading}
        >
          {aiLoading ? t('workspace.aiSuggestLoading') : t('workspace.aiSuggest')}
        </button>
      </div>

      {symptoms.length === 0 ? (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500">{t('workspace.noSymptoms')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">{t('workspace.reportedSymptoms')}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {symptoms.map((s, i) => (
              <div key={i} className="card-body flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{s.customText ?? s.symptomName ?? s.symptomId}</span>
                <div className="flex items-center gap-3">
                  {s.onsetDate && (
                    <span className="text-slate-500 text-xs">
                      {t('workspace.since')} {new Date(s.onsetDate).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={
                      s.severity === 'SEVERE'
                        ? 'badge-red'
                        : s.severity === 'MODERATE'
                        ? 'badge-yellow'
                        : 'badge-green'
                    }
                  >
                    {s.severity ? t('intake.severity.' + s.severity) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(aiSuggestions.length > 0 || aiError) && (
        <div className="card border-violet-200">
          <div className="card-header bg-violet-50 rounded-t-xl">
            <h3 className="font-semibold text-violet-900">{t('workspace.aiSuggestions')}</h3>
            <p className="text-xs text-violet-600 mt-0.5">{t('workspace.aiSuggestSub')}</p>
          </div>
          {aiError && (
            <div className="card-body">
              <p className="text-red-600 text-sm">{aiError}</p>
            </div>
          )}
          {aiSuggestions.length > 0 && (
            <div className="divide-y divide-violet-100">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="card-body text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className={confidenceBadge(s.confidence)}>
                      {t('workspace.aiConfidence.' + s.confidence)}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-slate-500 text-xs">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Diagnosis Tab ────────────────────────────────────────────────────────────

function DiagnosisTab({
  consultation,
  onAdd,
}: {
  consultation: FullConsultationResponse;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseResults, setDiseaseResults] = useState<DiseaseDto[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseDto | null>(null);
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('');
  const [confidence, setConfidence] = useState(0.8);
  const [diagnosisDate, setDiagnosisDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSearch = async (q: string) => {
    setDiseaseSearch(q);
    setSelectedDisease(null);
    if (q.length < 2) { setDiseaseResults([]); return; }
    const data = await searchDiseases(q);
    setDiseaseResults(data);
  };

  const handleSubmit = async () => {
    if (!selectedDisease && !customDiagnosis.trim()) {
      setFormError(t('workspace.selectDiseaseOrCustom'));
      return;
    }
    setSubmitting(true);
    setFormError('');
    const payload: DiagnosisRequest = {
      diseaseId: selectedDisease?.id,
      customDiagnosis: customDiagnosis || undefined,
      icd10Code: icd10Code || selectedDisease?.icd10Code || undefined,
      confidence,
      diagnosisDate,
      notes,
    };
    try {
      await addDiagnosis(consultation.id, payload);
      setSelectedDisease(null);
      setDiseaseSearch('');
      setCustomDiagnosis('');
      setIcd10Code('');
      setNotes('');
      setConfidence(0.8);
      onAdd();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? t('workspace.failedDiagnosis'));
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = ['IN_PROGRESS', 'CONFIRMED'].includes(consultation.status);

  return (
    <div className="space-y-4">
      {/* Existing */}
      {(consultation.diagnoses ?? []).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.diagnoses')}</h3></div>
          <div className="divide-y divide-slate-100">
            {(consultation.diagnoses ?? []).map((d) => (
              <div key={d.id} className="card-body text-sm">
                <div className="font-medium text-slate-800">
                  {d.diseaseName ?? d.customDiagnosis ?? t('workspace.unknown')}
                  {d.icd10Code && <span className="ml-2 text-xs text-slate-500">{d.icd10Code}</span>}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {t('workspace.confidenceLabel')}: {Math.round(d.confidence * 100)}% · {new Date(d.diagnosisDate).toLocaleDateString()}
                </div>
                {d.notes && <div className="text-slate-600 mt-1">{d.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {isEditable && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.addDiagnosisForm')}</h3></div>
          <div className="card-body space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            <div>
              <label className="label">{t('workspace.searchDisease')}</label>
              <input
                type="text"
                className="input-field"
                value={diseaseSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('workspace.searchDisease')}
              />
              {selectedDisease && (
                <div className="mt-1 p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                  {t('booking.selected')} <strong>{selectedDisease.name}</strong>
                  {selectedDisease.icd10Code && ` (${selectedDisease.icd10Code})`}
                  <button className="ml-2 text-xs text-blue-600" onClick={() => { setSelectedDisease(null); setDiseaseSearch(''); }}>✕</button>
                </div>
              )}
              {diseaseResults.length > 0 && !selectedDisease && (
                <div className="mt-1 border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  {diseaseResults.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                      onClick={() => { setSelectedDisease(d); setDiseaseResults([]); setDiseaseSearch(d.name); }}
                    >
                      {d.name} {d.icd10Code && <span className="text-slate-400 text-xs">({d.icd10Code})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">{t('workspace.customDiagnosisLabel')}</label>
              <input
                type="text"
                className="input-field"
                value={customDiagnosis}
                onChange={(e) => setCustomDiagnosis(e.target.value)}
                placeholder={t('workspace.orCustom')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('workspace.icd10Optional')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={icd10Code}
                  onChange={(e) => setIcd10Code(e.target.value)}
                  placeholder="e.g. J06.9"
                />
              </div>
              <div>
                <label className="label">{t('workspace.confidenceLabel')}</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="text-xs text-slate-500 mt-1">{Math.round(confidence * 100)}%</div>
              </div>
            </div>

            <div>
              <label className="label">{t('workspace.diagnosisDate')}</label>
              <input
                type="date"
                className="input-field"
                value={diagnosisDate}
                onChange={(e) => setDiagnosisDate(e.target.value)}
              />
            </div>

            <div>
              <label className="label">{t('workspace.diagnosisNotes')}</label>
              <textarea
                className="input-field"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('workspace.diagnosisNotes') + '…'}
              />
            </div>

            <div className="flex justify-end">
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '…' : t('workspace.saveDiagnosis')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(consultation.diagnoses ?? []).length === 0 && !isEditable && (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500">{t('workspace.noDiagnoses')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Prescription Tab ─────────────────────────────────────────────────────────

function PrescriptionTab({
  consultation,
  onAdd,
}: {
  consultation: FullConsultationResponse;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const [diagnosisId, setDiagnosisId] = useState((consultation.diagnoses ?? [])[0]?.id ?? '');
  const [customInstructions, setCustomInstructions] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<(PrescriptionItem & { medName?: string })[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState<MedicationDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleMedSearch = async (q: string) => {
    setMedSearch(q);
    if (q.length < 2) { setMedResults([]); return; }
    const data = await searchMedications(q);
    setMedResults(data);
  };

  const addItem = (med?: MedicationDto) => {
    setItems((prev) => [
      ...prev,
      {
        medicationId: med?.id,
        medName: med?.name ?? medSearch,
        dosage: '',
        frequency: '',
        durationDays: 7,
        quantity: 1,
      },
    ]);
    setMedSearch('');
    setMedResults([]);
  };

  const updateItem = (i: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (items.length === 0) { setFormError(t('workspace.atLeastOneMed')); return; }
    if (!validUntil) { setFormError(t('workspace.validUntilRequired')); return; }
    setSubmitting(true);
    setFormError('');

    const payload: PrescriptionRequest = {
      diagnosisId: diagnosisId || undefined,
      customInstructions,
      validFrom,
      validUntil,
      items: items.map(({ medName, ...rest }) => ({ ...rest, medicationName: medName })),
    };

    try {
      await addPrescription(consultation.id, payload);
      setItems([]);
      setCustomInstructions('');
      setValidUntil('');
      onAdd();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? t('workspace.failedPrescription'));
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = ['IN_PROGRESS', 'CONFIRMED'].includes(consultation.status);

  return (
    <div className="space-y-4">
      {/* Existing */}
      {(consultation.prescriptions ?? []).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.prescriptions')}</h3></div>
          <div className="divide-y divide-slate-100">
            {(consultation.prescriptions ?? []).map((p) => (
              <div key={p.id} className="card-body text-sm space-y-2">
                {p.customInstructions && <p className="text-slate-700">{p.customInstructions}</p>}
                <div className="text-xs text-slate-500">
                  {t('workspace.validRange')} {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}
                </div>
                {(p.items ?? []).map((item) => (
                  <div key={item.id} className="pl-3 border-l-2 border-blue-200 text-sm">
                    <div className="font-medium">{item.medicationName ?? t('workspace.searchMedication')}</div>
                    <div className="text-slate-500">{item.dosage} · {item.frequency} · {item.durationDays}{t('intake.days')} · {t('intake.qty')} {item.quantity}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditable && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.addPrescriptionForm')}</h3></div>
          <div className="card-body space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            {(consultation.diagnoses ?? []).length > 0 && (
              <div>
                <label className="label">{t('workspace.linkedDiagnosis')}</label>
                <select
                  className="input-field"
                  value={diagnosisId}
                  onChange={(e) => setDiagnosisId(e.target.value)}
                >
                  {(consultation.diagnoses ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.diseaseName ?? d.customDiagnosis ?? d.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label">{t('workspace.instructions')}</label>
              <textarea
                className="input-field"
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={t('workspace.instructions') + '…'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('workspace.validFrom')}</label>
                <input type="date" className="input-field" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div>
                <label className="label">{t('workspace.validUntil')} *</label>
                <input type="date" className="input-field" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
              </div>
            </div>

            {/* Medication search */}
            <div>
              <label className="label">{t('workspace.addMedication')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={medSearch}
                  onChange={(e) => handleMedSearch(e.target.value)}
                  placeholder={t('workspace.searchMedication')}
                />
                <button type="button" className="btn-secondary" onClick={() => addItem()}>
                  {t('workspace.addCustom')}
                </button>
              </div>
              {medResults.length > 0 && (
                <div className="mt-1 border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  {medResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                      onClick={() => addItem(m)}
                    >
                      {m.name} {m.genericName && <span className="text-slate-400 text-xs">({m.genericName})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{item.medName ?? t('workspace.searchMedication')}</span>
                      <button type="button" className="text-red-500 text-xs" onClick={() => removeItem(i)}>{t('workspace.remove')}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="label text-xs">{t('workspace.dosage')}</label>
                        <input type="text" className="input-field py-1" placeholder="e.g. 500mg" value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} />
                      </div>
                      <div>
                        <label className="label text-xs">{t('workspace.frequency')}</label>
                        <input type="text" className="input-field py-1" placeholder="e.g. 3x daily" value={item.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} />
                      </div>
                      <div>
                        <label className="label text-xs">{t('workspace.duration')}</label>
                        <input type="number" className="input-field py-1" min={1} value={item.durationDays} onChange={(e) => updateItem(i, 'durationDays', parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label className="label text-xs">{t('workspace.quantity')}</label>
                        <input type="number" className="input-field py-1" min={1} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '…' : t('workspace.savePrescription')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(consultation.prescriptions ?? []).length === 0 && !isEditable && (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500">{t('workspace.noPrescriptions')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Referral Tab ─────────────────────────────────────────────────────────────

function ReferralTab({
  consultation,
  onAdd,
}: {
  consultation: FullConsultationResponse;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const [referralType, setReferralType] = useState<ReferralType>('SPECIALIST');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('ROUTINE');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    if (!destination.trim()) { setFormError(t('workspace.destinationRequired')); return; }
    if (!reason.trim()) { setFormError(t('workspace.reasonRequired')); return; }
    setSubmitting(true);
    setFormError('');
    const payload: ReferralRequest = { referralType, destination, reason, urgency };
    try {
      await addReferral(consultation.id, payload);
      setDestination('');
      setReason('');
      onAdd();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? t('workspace.failedReferral'));
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = ['IN_PROGRESS', 'CONFIRMED'].includes(consultation.status);

  return (
    <div className="space-y-4">
      {(consultation.referrals ?? []).length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.referrals')}</h3></div>
          <div className="divide-y divide-slate-100">
            {(consultation.referrals ?? []).map((r) => (
              <div key={r.id} className="card-body text-sm">
                <div className="font-medium text-slate-800">{r.referralType} → {r.destination}</div>
                <div className="text-slate-600 mt-0.5">{r.reason}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t('workspace.urgency')}: {r.urgency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditable && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.addReferralForm')}</h3></div>
          <div className="card-body space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('workspace.referralType')}</label>
                <select className="input-field" value={referralType} onChange={(e) => setReferralType(e.target.value as ReferralType)}>
                  <option value="SPECIALIST">{t('workspace.specialist')}</option>
                  <option value="LABORATORY">{t('workspace.laboratory')}</option>
                  <option value="IMAGING">{t('workspace.imaging')}</option>
                  <option value="HOSPITAL">{t('workspace.hospital')}</option>
                  <option value="OTHER">{t('workspace.other')}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('workspace.urgency')}</label>
                <select className="input-field" value={urgency} onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}>
                  <option value="ROUTINE">{t('workspace.routine')}</option>
                  <option value="URGENT">{t('workspace.urgent')}</option>
                  <option value="EMERGENCY">{t('workspace.emergency')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">{t('workspace.destination')} *</label>
              <input
                type="text"
                className="input-field"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Cardiology dept."
              />
            </div>

            <div>
              <label className="label">{t('workspace.reason')} *</label>
              <textarea
                className="input-field"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('workspace.reason') + '…'}
              />
            </div>

            <div className="flex justify-end">
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '…' : t('workspace.saveReferral')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(consultation.referrals ?? []).length === 0 && !isEditable && (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500">{t('workspace.noReferrals')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Doctor Intake Tab (IN_PERSON: doctor fills anamnesis during consultation) ──

interface SymptomRow extends SymptomDto { severity: SeverityLevel; onsetDate: string; }

function DoctorIntakeTab({ consultation, onSaved }: { consultation: FullConsultationResponse; onSaved: () => void }) {
  const { t } = useTranslation();
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [painIntensity, setPainIntensity] = useState('');
  const [generalSymptomsList, setGeneralSymptomsList] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [knownConditions, setKnownConditions] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomRow[]>([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [symptomResults, setSymptomResults] = useState<SymptomDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const GENERAL_SYMPTOMS = ['Fever', 'Chills', 'Extreme fatigue', 'Dizziness', 'Nausea', 'Weight loss', 'Loss of appetite'];

  const handleSymptomSearch = async (q: string) => {
    setSymptomSearch(q);
    if (q.length < 2) { setSymptomResults([]); return; }
    const results = await searchSymptoms(q);
    setSymptomResults(results.filter((r) => !selectedSymptoms.find((s) => s.id === r.id)));
  };

  const addSymptom = (sym: SymptomDto) => {
    setSelectedSymptoms((prev) => [...prev, { ...sym, severity: 'MILD', onsetDate: '' }]);
    setSymptomResults([]);
    setSymptomSearch('');
  };

  const removeSymptom = (sid: string) => setSelectedSymptoms((prev) => prev.filter((s) => s.id !== sid));
  const updateSymptom = (sid: string, field: 'severity' | 'onsetDate', value: string) =>
    setSelectedSymptoms((prev) => prev.map((s) => (s.id === sid ? { ...s, [field]: value } : s)));

  const toggleGeneral = (val: string) =>
    setGeneralSymptomsList((prev) => prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]);

  const handleSubmit = async () => {
    if (!chiefComplaint.trim()) { setFormError(t('intake.chiefComplaintRequired')); return; }
    setSubmitting(true);
    setFormError('');
    const payload: IntakeFormRequest = {
      chiefComplaint,
      symptomDuration: symptomOnset,
      currentMedications,
      allergies,
      additionalNotes,
      symptoms: selectedSymptoms.map<SymptomEntry>((s) => ({ symptomId: s.id, severity: s.severity, onsetDate: s.onsetDate || undefined })),
      temperature: temperature ? parseFloat(temperature) : null,
      bloodPressure: bloodPressure || undefined,
      bloodGlucose: bloodGlucose ? parseFloat(bloodGlucose) : null,
      symptomOnset: symptomOnset || undefined,
      painIntensity: painIntensity || undefined,
      generalSymptoms: generalSymptomsList.join(', ') || undefined,
      knownConditions: knownConditions || undefined,
    };
    try {
      await submitIntake(consultation.id, payload);
      onSaved();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? t('intake.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (consultation.intake) {
    return (
      <div className="card">
        <div className="card-header"><h3 className="font-semibold text-slate-900">{t('workspace.patientIntake')}</h3></div>
        <div className="card-body text-sm space-y-2">
          <div><span className="text-slate-500">{t('workspace.chiefComplaint')}: </span><span className="font-medium">{consultation.intake.chiefComplaint}</span></div>
          {consultation.intake.temperature != null && <div><span className="text-slate-500">{t('workspace.temperature')}: </span><span className="font-medium">{consultation.intake.temperature} °C</span></div>}
          {consultation.intake.bloodPressure && <div><span className="text-slate-500">{t('workspace.bloodPressure')}: </span><span className="font-medium">{consultation.intake.bloodPressure}</span></div>}
          {consultation.intake.bloodGlucose != null && <div><span className="text-slate-500">{t('workspace.bloodGlucose')}: </span><span className="font-medium">{consultation.intake.bloodGlucose} mg/dL</span></div>}
          {consultation.intake.symptomOnset && <div><span className="text-slate-500">{t('workspace.symptomOnset')}: </span>{consultation.intake.symptomOnset}</div>}
          {consultation.intake.painIntensity && <div><span className="text-slate-500">{t('workspace.painIntensity')}: </span>{consultation.intake.painIntensity}</div>}
          {consultation.intake.generalSymptoms && <div><span className="text-slate-500">{t('workspace.generalSymptoms')}: </span>{consultation.intake.generalSymptoms}</div>}
          {consultation.intake.knownConditions && <div><span className="text-slate-500">{t('workspace.knownConditions')}: </span>{consultation.intake.knownConditions}</div>}
          {consultation.intake.currentMedications && <div><span className="text-slate-500">{t('workspace.currentMedications')}: </span>{consultation.intake.currentMedications}</div>}
          {consultation.intake.allergies && <div><span className="text-slate-500">{t('workspace.allergies')}: </span>{consultation.intake.allergies}</div>}
          {consultation.intake.additionalNotes && <div><span className="text-slate-500">{t('workspace.notes')}: </span>{consultation.intake.additionalNotes}</div>}
          {(consultation.intake.symptoms ?? []).length > 0 && (
            <div>
              <span className="text-slate-500">{t('workspace.reportedSymptoms')}: </span>
              <div className="mt-1 space-y-1">
                {consultation.intake.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{s.symptomName ?? s.symptomId}</span>
                    <span className={s.severity === 'SEVERE' ? 'badge-red' : s.severity === 'MODERATE' ? 'badge-yellow' : 'badge-green'}>{s.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!['IN_PROGRESS', 'CONFIRMED'].includes(consultation.status)) {
    return (
      <div className="card card-body text-center py-8">
        <p className="text-slate-500">{t('workspace.intakeNotFilled')}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-slate-900">{t('workspace.fillIntakeDoctor')}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{t('workspace.fillIntakeDoctorSub')}</p>
      </div>
      <div className="card-body space-y-6">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
        )}

        {/* Vitals */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t('intake.vitals')}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">{t('intake.temperatureLabel')}</label>
              <input type="number" step="0.1" min="34" max="43" className="input-field" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="37.0" />
            </div>
            <div>
              <label className="label">{t('intake.bloodPressureLabel')}</label>
              <input type="text" className="input-field" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="120/80" />
            </div>
            <div>
              <label className="label">{t('intake.bloodGlucoseLabel')}</label>
              <input type="number" step="0.1" min="0" className="input-field" value={bloodGlucose} onChange={(e) => setBloodGlucose(e.target.value)} placeholder="95" />
            </div>
          </div>
        </div>

        {/* Chief complaint */}
        <div>
          <label className="label">{t('intake.chiefComplaintLabel')}</label>
          <input type="text" className="input-field" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder={t('intake.chiefComplaintPlaceholder')} />
        </div>

        {/* Symptom onset */}
        <div>
          <label className="label">{t('intake.symptomOnsetLabel')}</label>
          <input type="text" className="input-field" value={symptomOnset} onChange={(e) => setSymptomOnset(e.target.value)} placeholder="e.g. 3 days" />
        </div>

        {/* Pain intensity */}
        <div>
          <label className="label">{t('intake.painIntensityLabel')}</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {['No pain', 'Mild', 'Moderate', 'Severe'].map((val) => (
              <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="painIntensity" className="text-blue-600" checked={painIntensity === val} onChange={() => setPainIntensity(val)} />
                <span className="text-slate-700">{val}</span>
              </label>
            ))}
          </div>
        </div>

        {/* General symptoms */}
        <div>
          <label className="label">{t('intake.generalSymptomsLabel')}</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {GENERAL_SYMPTOMS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600" checked={generalSymptomsList.includes(s)} onChange={() => toggleGeneral(s)} />
                <span className="text-slate-700">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Symptom search */}
        <div>
          <label className="label">{t('intake.symptomSearchLabel')}</label>
          <input type="text" className="input-field" value={symptomSearch} onChange={(e) => handleSymptomSearch(e.target.value)} placeholder={t('intake.symptomSearchPlaceholder')} />
          {symptomResults.length > 0 && (
            <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {symptomResults.map((s) => (
                <button key={s.id} type="button" className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0" onClick={() => addSymptom(s)}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
          {selectedSymptoms.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedSymptoms.map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-slate-700 flex-1">{s.name}</span>
                  <select className="input-field w-28 py-1 text-xs" value={s.severity} onChange={(e) => updateSymptom(s.id, 'severity', e.target.value)}>
                    <option value="MILD">{t('intake.severity.MILD')}</option>
                    <option value="MODERATE">{t('intake.severity.MODERATE')}</option>
                    <option value="SEVERE">{t('intake.severity.SEVERE')}</option>
                  </select>
                  <input type="date" className="input-field w-36 py-1 text-xs" value={s.onsetDate} onChange={(e) => updateSymptom(s.id, 'onsetDate', e.target.value)} />
                  <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => removeSymptom(s.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Known conditions */}
        <div>
          <label className="label">{t('intake.knownConditionsLabel')}</label>
          <input type="text" className="input-field" value={knownConditions} onChange={(e) => setKnownConditions(e.target.value)} placeholder={t('intake.knownConditionsOtherPlaceholder')} />
        </div>

        {/* Current medications + allergies */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('intake.currentMedicationsLabel')}</label>
            <input type="text" className="input-field" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} placeholder={t('intake.currentMedicationsPlaceholder')} />
          </div>
          <div>
            <label className="label">{t('intake.allergiesLabel')}</label>
            <input type="text" className="input-field" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder={t('intake.allergiesPlaceholder')} />
          </div>
        </div>

        {/* Additional notes */}
        <div>
          <label className="label">{t('intake.additionalNotesLabel')}</label>
          <textarea className="input-field" rows={3} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder={t('intake.additionalNotesPlaceholder')} />
        </div>

        <div className="flex justify-end">
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? t('intake.submitting') : t('workspace.saveIntake')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Series Nav ────────────────────────────────────────────────────────────────

function SeriesNav({ consultation, onReload }: { consultation: FullConsultationResponse; onReload: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [linkInput, setLinkInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);

  const handleLink = async () => {
    if (!linkInput.trim()) return;
    setLinking(true);
    setLinkError('');
    try {
      await linkNextConsultation(consultation.id, linkInput.trim());
      setLinkInput('');
      setShowLinkForm(false);
      onReload();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setLinkError(axiosError.response?.data?.error?.message ?? t('workspace.linkFailed'));
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkNextConsultation(consultation.id);
      onReload();
    } catch { /* ignore */ }
  };

  const hasPrev = !!consultation.previousConsultationId;
  const hasNext = !!consultation.nextConsultationId;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{t('workspace.consultationSeries')}</h3>
        {!hasNext && (
          <button className="btn-secondary text-xs" onClick={() => setShowLinkForm(!showLinkForm)}>
            {showLinkForm ? t('common.cancel') : t('workspace.linkToNext')}
          </button>
        )}
      </div>
      <div className="card-body space-y-3">
        <div className="flex items-center gap-3">
          {hasPrev ? (
            <button
              className="btn-secondary text-xs"
              onClick={() => navigate(`/doctor/consultations/${consultation.previousConsultationId}`)}
            >
              ← {t('workspace.previousConsultation')}
            </button>
          ) : (
            <span className="text-xs text-slate-400">{t('workspace.firstInSeries')}</span>
          )}
          <span className="text-slate-300">|</span>
          {hasNext ? (
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary text-xs"
                onClick={() => navigate(`/doctor/consultations/${consultation.nextConsultationId}`)}
              >
                {t('workspace.nextConsultation')} →
              </button>
              <button className="text-red-500 text-xs hover:text-red-700" onClick={handleUnlink}>
                {t('workspace.removeLink')}
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">{t('workspace.lastInSeries')}</span>
          )}
        </div>

        {showLinkForm && (
          <div className="space-y-2">
            {linkError && <p className="text-red-600 text-xs">{linkError}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 text-sm"
                placeholder={t('workspace.nextConsultationIdPlaceholder')}
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />
              <button className="btn-primary text-sm" onClick={handleLink} disabled={linking || !linkInput.trim()}>
                {linking ? '…' : t('workspace.link')}
              </button>
            </div>
            <p className="text-xs text-slate-400">{t('workspace.linkHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

export default function ConsultationWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultation, setConsultation] = useState<FullConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const data = await getConsultation(id);
      setConsultation(data);
    } catch {
      setError(t('workspace.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStart = async () => {
    if (!id) return;
    setActionLoading(true);
    try { await startConsultation(id); await load(); }
    catch { setError(t('workspace.failedStart')); }
    finally { setActionLoading(false); }
  };

  const handleComplete = async (note: string, followUpScheduledAt?: string) => {
    if (!id) return;
    setActionLoading(true);
    try { await completeConsultation(id, { noteDoctor: note, followUpScheduledAt }); await load(); }
    catch { setError(t('workspace.failedComplete')); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  if (error || !consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || t('workspace.notFound')}</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/doctor/consultations')}>{t('common.back')}</button>
      </div>
    );
  }

  const isInPerson = consultation.consultationType === 'IN_PERSON';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('workspace.tabs.overview') },
    ...(isInPerson ? [{ key: 'intake' as Tab, label: t('workspace.tabs.intake') }] : []),
    { key: 'symptoms', label: t('workspace.tabs.symptomsSuggestions') },
    { key: 'diagnosis', label: t('workspace.tabs.diagnosis') },
    { key: 'prescription', label: t('workspace.tabs.prescription') },
    { key: 'referral', label: t('workspace.tabs.referral') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button className="btn-secondary text-xs" onClick={() => navigate('/doctor/consultations')}>← {t('common.back')}</button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('workspace.consultationWorkspace')}</h1>
          <p className="text-slate-500 text-sm">
            {consultation.scheduledAt
              ? new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })
              : t('consultations.async')}
          </p>
        </div>
      </div>

      {/* Series navigation */}
      {(consultation.previousConsultationId || consultation.nextConsultationId) && (
        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
          <span className="text-purple-700 font-medium">{t('consultations.partOfSeries')}</span>
          <div className="flex gap-2 ml-auto">
            {consultation.previousConsultationId && (
              <button className="btn-secondary text-xs" onClick={() => navigate(`/doctor/consultations/${consultation.previousConsultationId}`)}>
                ← {t('consultations.previousConsultation')}
              </button>
            )}
            {consultation.nextConsultationId && (
              <button className="btn-secondary text-xs" onClick={() => navigate(`/doctor/consultations/${consultation.nextConsultationId}`)}>
                {t('consultations.nextConsultation')} →
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Tab navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <OverviewTab
              consultation={consultation}
              onStart={handleStart}
              onComplete={handleComplete}
              actionLoading={actionLoading}
            />
            <SeriesNav consultation={consultation} onReload={load} />
          </div>
        )}
        {activeTab === 'intake' && isInPerson && (
          <DoctorIntakeTab consultation={consultation} onSaved={load} />
        )}
        {activeTab === 'symptoms' && <SymptomsTab consultation={consultation} />}
        {activeTab === 'diagnosis' && <DiagnosisTab consultation={consultation} onAdd={load} />}
        {activeTab === 'prescription' && <PrescriptionTab consultation={consultation} onAdd={load} />}
        {activeTab === 'referral' && <ReferralTab consultation={consultation} onAdd={load} />}
      </div>
    </div>
  );
}
