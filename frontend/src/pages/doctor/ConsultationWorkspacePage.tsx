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
  suggestDiseases,
  searchDiseases,
  searchMedications,
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
  DiseaseSuggestion,
} from '../../types';

type Tab = 'overview' | 'symptoms' | 'diagnosis' | 'prescription' | 'referral';

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
  onComplete: (note: string) => void;
  actionLoading: boolean;
}) {
  const { t } = useTranslation();
  const [noteDoctor, setNoteDoctor] = useState('');

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
                {new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('workspace.type')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5 capitalize">
                {consultation.consultationType.replace('_', ' ').toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('workspace.duration')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{consultation.slotDurationMinutes} {t('common.min')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Intake summary */}
      {consultation.intake && (
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
          <div className="w-full space-y-3">
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
            <button
              className="btn-primary"
              onClick={() => onComplete(noteDoctor)}
              disabled={actionLoading}
            >
              {actionLoading ? '…' : t('workspace.completeConsultation')}
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
  const [suggestions, setSuggestions] = useState<DiseaseSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const symptoms = consultation.intake?.symptoms ?? [];
  const symptomIds = symptoms.map((s) => s.symptomId).filter((id): id is string => !!id);

  const handleSuggest = async () => {
    if (symptomIds.length === 0) return;
    setLoading(true);
    try {
      const data = await suggestDiseases(symptomIds);
      setSuggestions(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {symptoms.length === 0 ? (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500">{t('workspace.noSymptoms')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{t('workspace.reportedSymptoms')}</h3>
            {symptomIds.length > 0 && (
              <button className="btn-secondary text-xs" onClick={handleSuggest} disabled={loading}>
                {loading ? t('workspace.analyzing') : t('workspace.getSuggestions')}
              </button>
            )}
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

      {suggestions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">{t('workspace.diseaseSuggestions')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('workspace.aiDiagnosis')}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {suggestions.map((s, i) => (
              <div key={i} className="card-body text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{s.diseaseName}</span>
                  <span className="badge-blue">{Math.round(s.score * 100)}{t('workspace.match')}</span>
                </div>
                {s.icd10Code && (
                  <span className="text-xs text-slate-500">ICD-10: {s.icd10Code}</span>
                )}
              </div>
            ))}
          </div>
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
      diagnosisId,
      customInstructions,
      validFrom,
      validUntil,
      items: items.map(({ medName: _medName, ...rest }) => rest),
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

  const handleComplete = async (note: string) => {
    if (!id) return;
    setActionLoading(true);
    try { await completeConsultation(id, { noteDoctor: note }); await load(); }
    catch { setError(t('workspace.failedComplete')); }
    finally { setActionLoading(false); }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('workspace.tabs.overview') },
    { key: 'symptoms', label: t('workspace.tabs.symptomsSuggestions') },
    { key: 'diagnosis', label: t('workspace.tabs.diagnosis') },
    { key: 'prescription', label: t('workspace.tabs.prescription') },
    { key: 'referral', label: t('workspace.tabs.referral') },
  ];

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  if (error || !consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || t('workspace.notFound')}</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/doctor/consultations')}>{t('common.back')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button className="btn-secondary text-xs" onClick={() => navigate('/doctor/consultations')}>← {t('common.back')}</button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('workspace.consultationWorkspace')}</h1>
          <p className="text-slate-500 text-sm">
            {new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
      </div>

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
          <OverviewTab
            consultation={consultation}
            onStart={handleStart}
            onComplete={handleComplete}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'symptoms' && <SymptomsTab consultation={consultation} />}
        {activeTab === 'diagnosis' && <DiagnosisTab consultation={consultation} onAdd={load} />}
        {activeTab === 'prescription' && <PrescriptionTab consultation={consultation} onAdd={load} />}
        {activeTab === 'referral' && <ReferralTab consultation={consultation} onAdd={load} />}
      </div>
    </div>
  );
}
