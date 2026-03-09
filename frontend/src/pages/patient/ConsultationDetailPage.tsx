import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultation, submitIntake, searchSymptoms } from '../../api/consultationApi';
import type {
  FullConsultationResponse,
  IntakeFormRequest,
  SymptomEntry,
  SymptomDto,
  SeverityLevel,
  ConsultationStatus,
} from '../../types';

function statusBadge(status: ConsultationStatus) {
  const map: Record<ConsultationStatus, string> = {
    PENDING: 'badge-yellow',
    CONFIRMED: 'badge-blue',
    IN_PROGRESS: 'badge-green',
    COMPLETED: 'badge-slate',
    CANCELLED: 'badge-red',
  };
  return <span className={map[status]}>{status.replace('_', ' ')}</span>;
}

interface SymptomRow extends SymptomDto {
  severity: SeverityLevel;
  onsetDate: string;
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<FullConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Intake form state
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomRow[]>([]);
  const [symptomSearch, setSymptomSearch] = useState('');
  const [symptomResults, setSymptomResults] = useState<SymptomDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [intakeError, setIntakeError] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const data = await getConsultation(id);
      setConsultation(data);
    } catch {
      setError('Failed to load consultation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

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

  const removeSymptom = (id: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSymptom = (id: string, field: 'severity' | 'onsetDate', value: string) => {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleIntakeSubmit = async () => {
    if (!id || !chiefComplaint.trim()) { setIntakeError('Chief complaint is required.'); return; }
    setSubmitting(true);
    setIntakeError('');

    const payload: IntakeFormRequest = {
      chiefComplaint,
      symptomDuration,
      currentMedications,
      allergies,
      additionalNotes,
      symptoms: selectedSymptoms.map<SymptomEntry>((s) => ({
        symptomId: s.id,
        severity: s.severity,
        onsetDate: s.onsetDate || undefined,
      })),
    };

    try {
      await submitIntake(id, payload);
      await load();
      setShowIntakeForm(false);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setIntakeError(axiosError.response?.data?.error?.message ?? 'Failed to submit intake form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;
  }

  if (error || !consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || 'Consultation not found.'}</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/patient/consultations')}>Back</button>
      </div>
    );
  }

  const canSubmitIntake = ['CONFIRMED', 'IN_PROGRESS'].includes(consultation.status) && !consultation.intake;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button className="btn-secondary text-xs" onClick={() => navigate('/patient/consultations')}>
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Consultation Details</h1>
          <p className="text-slate-500 text-sm">
            {new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Overview</h2>
          {statusBadge(consultation.status)}
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Type</dt>
              <dd className="font-medium text-slate-800 mt-0.5 capitalize">
                {consultation.consultationType.replace('_', ' ').toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Duration</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{consultation.slotDurationMinutes} min</dd>
            </div>
            {consultation.noteDoctor && (
              <div className="col-span-2">
                <dt className="text-slate-500">Doctor's note</dt>
                <dd className="font-medium text-slate-800 mt-0.5 whitespace-pre-wrap">{consultation.noteDoctor}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Intake form CTA */}
      {canSubmitIntake && !showIntakeForm && (
        <div className="card card-body bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 font-medium">Your consultation is confirmed. Please fill in the intake form before your appointment.</p>
          <button className="btn-primary mt-3" onClick={() => setShowIntakeForm(true)}>
            Fill intake form
          </button>
        </div>
      )}

      {/* Intake form */}
      {showIntakeForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Intake Form</h2>
          </div>
          <div className="card-body space-y-4">
            {intakeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{intakeError}</div>
            )}

            <div>
              <label className="label">Chief complaint *</label>
              <input
                type="text"
                className="input-field"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe your main concern"
              />
            </div>

            <div>
              <label className="label">How long have you had these symptoms?</label>
              <input
                type="text"
                className="input-field"
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                placeholder="e.g. 3 days"
              />
            </div>

            <div>
              <label className="label">Current medications</label>
              <input
                type="text"
                className="input-field"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="List any medications you are taking"
              />
            </div>

            <div>
              <label className="label">Allergies</label>
              <input
                type="text"
                className="input-field"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Known drug or food allergies"
              />
            </div>

            <div>
              <label className="label">Additional notes</label>
              <textarea
                className="input-field"
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any other information for your doctor"
              />
            </div>

            {/* Symptom picker */}
            <div>
              <label className="label">Symptoms</label>
              <input
                type="text"
                className="input-field"
                value={symptomSearch}
                onChange={(e) => handleSymptomSearch(e.target.value)}
                placeholder="Search symptoms to add…"
              />
              {symptomResults.length > 0 && (
                <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  {symptomResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                      onClick={() => addSymptom(s)}
                    >
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
                      <select
                        className="input-field w-28 py-1 text-xs"
                        value={s.severity}
                        onChange={(e) => updateSymptom(s.id, 'severity', e.target.value)}
                      >
                        <option value="MILD">Mild</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="SEVERE">Severe</option>
                      </select>
                      <input
                        type="date"
                        className="input-field w-36 py-1 text-xs"
                        value={s.onsetDate}
                        onChange={(e) => updateSymptom(s.id, 'onsetDate', e.target.value)}
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() => removeSymptom(s.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setShowIntakeForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleIntakeSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit intake form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted intake */}
      {consultation.intake && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Intake Form</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted {new Date(consultation.intake.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="card-body space-y-3 text-sm">
            <div><span className="text-slate-500">Chief complaint:</span> <span className="font-medium">{consultation.intake.chiefComplaint}</span></div>
            {consultation.intake.symptomDuration && <div><span className="text-slate-500">Duration:</span> <span className="font-medium">{consultation.intake.symptomDuration}</span></div>}
            {consultation.intake.currentMedications && <div><span className="text-slate-500">Medications:</span> <span className="font-medium">{consultation.intake.currentMedications}</span></div>}
            {consultation.intake.allergies && <div><span className="text-slate-500">Allergies:</span> <span className="font-medium">{consultation.intake.allergies}</span></div>}
            {consultation.intake.additionalNotes && <div><span className="text-slate-500">Notes:</span> <span className="font-medium">{consultation.intake.additionalNotes}</span></div>}
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {consultation.diagnoses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Diagnoses</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {consultation.diagnoses.map((d) => (
              <div key={d.id} className="card-body text-sm space-y-1">
                <div className="font-medium text-slate-800">
                  {d.diseaseName ?? d.customDiagnosis ?? 'Unknown'}
                  {d.icd10Code && <span className="ml-2 text-xs text-slate-500">ICD-10: {d.icd10Code}</span>}
                </div>
                <div className="text-slate-500">Confidence: {Math.round(d.confidence * 100)}%</div>
                {d.notes && <div className="text-slate-600">{d.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {consultation.prescriptions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Prescriptions</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {consultation.prescriptions.map((p) => (
              <div key={p.id} className="card-body text-sm space-y-2">
                {p.customInstructions && <p className="text-slate-700">{p.customInstructions}</p>}
                <div className="text-xs text-slate-500">
                  Valid: {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}
                </div>
                {p.items.map((item) => (
                  <div key={item.id} className="pl-3 border-l-2 border-blue-200">
                    <div className="font-medium">{item.medicationName ?? 'Medication'}</div>
                    <div className="text-slate-500">
                      {item.dosage} · {item.frequency} · {item.durationDays} days · qty: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals */}
      {consultation.referrals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Referrals</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {consultation.referrals.map((r) => (
              <div key={r.id} className="card-body text-sm space-y-1">
                <div className="font-medium text-slate-800">
                  {r.referralType} → {r.destination}
                </div>
                <div className="text-slate-600">{r.reason}</div>
                <div className="text-xs text-slate-500">Urgency: {r.urgency}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
