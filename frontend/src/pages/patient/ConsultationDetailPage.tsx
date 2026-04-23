import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getConsultation, submitIntake, searchSymptoms } from '../../api/consultationApi';
import type {
  FullConsultationResponse,
  IntakeFormRequest,
  SymptomEntry,
  SymptomDto,
  SeverityLevel,
  ConsultationStatus,
} from '../../types';

function statusBadge(status: ConsultationStatus, t: (k: string) => string) {
  const map: Record<ConsultationStatus, string> = {
    PENDING: 'badge-yellow',
    CONFIRMED: 'badge-blue',
    IN_PROGRESS: 'badge-green',
    COMPLETED: 'badge-slate',
    CANCELLED: 'badge-red',
  };
  return <span className={map[status]}>{t('status.' + status)}</span>;
}

interface SymptomRow extends SymptomDto {
  severity: SeverityLevel;
  onsetDate: string;
}

const BODY_ZONE_KEYS = [
  'head_face', 'neck', 'chest_heart', 'abdomen_stomach', 'back',
  'arms_shoulders_hands', 'legs_knees_feet', 'skin', 'urinary_genital', 'general',
] as const;
type BodyZoneKey = typeof BODY_ZONE_KEYS[number];

const ZONE_SYMPTOMS_EN: Record<BodyZoneKey, string[]> = {
  head_face: ['Headache', 'Dizziness', 'Blurred vision', 'Light sensitivity', 'Nasal congestion', 'Runny nose', 'Sinus pain', 'Ear pain', 'Tinnitus', 'Facial swelling'],
  neck: ['Sore throat', 'Difficulty swallowing', 'Hoarse voice', 'Swollen lymph nodes', 'Globus sensation', 'Cough', 'Neck swelling'],
  chest_heart: ['Chest pain', 'Chest pressure', 'Shortness of breath', 'Rapid heartbeat', 'Irregular heartbeat', 'Cough', 'Coughing up blood', 'Dizziness', 'Pain radiating to arm or jaw'],
  abdomen_stomach: ['Abdominal pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Bloating', 'Heartburn', 'Loss of appetite', 'Blood in stool'],
  back: ['Lower back pain', 'Upper back pain', 'Pain radiating down the leg', 'Numbness', 'Muscle weakness', 'Stiffness', 'Difficulty moving'],
  arms_shoulders_hands: ['Shoulder pain', 'Arm pain', 'Hand pain', 'Numbness', 'Tingling', 'Muscle weakness', 'Swelling', 'Difficulty moving'],
  legs_knees_feet: ['Leg pain', 'Knee pain', 'Swelling', 'Numbness', 'Cramps', 'Weakness', 'Difficulty walking', 'Stiffness'],
  skin: ['Skin rash', 'Itching', 'Redness', 'Swelling', 'Lesions or wounds', 'Dry skin', 'Mole changes'],
  urinary_genital: ['Pain with urination', 'Frequent urination', 'Blood in urine', 'Difficulty urinating', 'Genital pain', 'Abnormal discharge', 'Genital itching', 'Pelvic pain'],
  general: ['Fever', 'Chills', 'Fatigue', 'Dizziness', 'Weakness', 'Excessive sweating', 'Weight loss', 'Muscle aches'],
};

const GENERAL_SYMPTOMS_EN = ['Fever', 'Chills', 'Extreme fatigue', 'Dizziness', 'Nausea', 'Weight loss', 'Loss of appetite'];
const KNOWN_CONDITIONS_EN = ['Diabetes', 'Hypertension', 'Heart problems', 'Asthma', 'Digestive issues', 'Kidney problems'];

const SYMPTOM_ONSET_OPTIONS = [
  { value: 'Today', key: 'today' },
  { value: '1-2 days ago', key: '1_2_days' },
  { value: '3-7 days ago', key: '3_7_days' },
  { value: 'Over a week ago', key: 'over_week' },
  { value: 'Over a month ago', key: 'over_month' },
];

const PAIN_INTENSITY_OPTIONS = [
  { value: 'No pain', key: 'none' },
  { value: 'Mild', key: 'mild' },
  { value: 'Moderate', key: 'moderate' },
  { value: 'Severe', key: 'severe' },
];

const PAIN_TYPE_OPTIONS = [
  { value: 'Constant', key: 'constant' },
  { value: 'Comes and goes', key: 'comesGoes' },
  { value: 'Only with movement', key: 'withMovement' },
  { value: 'Only with exertion', key: 'withExertion' },
];

function CheckboxGroup({ options, selected, onChange }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ value, label }) => (
        <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={selected.includes(value)}
            onChange={() => toggle(value)}
          />
          <span className="text-slate-700">{label}</span>
        </label>
      ))}
    </div>
  );
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultation, setConsultation] = useState<FullConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Intake form state
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('');
  const [painIntensity, setPainIntensity] = useState('');
  const [painType, setPainType] = useState('');
  const [hadSymptomsBefore, setHadSymptomsBefore] = useState<string>('');
  const [generalSymptomsList, setGeneralSymptomsList] = useState<string[]>([]);
  const [medicationsTakenOption, setMedicationsTakenOption] = useState('');
  const [medicationsTakenText, setMedicationsTakenText] = useState('');
  const [knownConditionsList, setKnownConditionsList] = useState<string[]>([]);
  const [knownConditionsOther, setKnownConditionsOther] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [bodyZoneKey, setBodyZoneKey] = useState<BodyZoneKey | ''>('');
  const [bodyZoneSymptomsList, setBodyZoneSymptomsList] = useState<string[]>([]);
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

  const removeSymptom = (sid: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== sid));
  };

  const updateSymptom = (sid: string, field: 'severity' | 'onsetDate', value: string) => {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, [field]: value } : s))
    );
  };

  const handleBodyZoneChange = (key: BodyZoneKey) => {
    setBodyZoneKey(key);
    setBodyZoneSymptomsList([]);
  };

  const handleIntakeSubmit = async () => {
    if (!id || !chiefComplaint.trim()) { setIntakeError(t('intake.chiefComplaintRequired')); return; }
    setSubmitting(true);
    setIntakeError('');

    const allKnownConditions = [
      ...knownConditionsList,
      ...(knownConditionsOther.trim() ? [knownConditionsOther.trim()] : []),
    ].join(', ');

    const payload: IntakeFormRequest = {
      chiefComplaint,
      symptomDuration: symptomOnset,
      currentMedications,
      allergies,
      additionalNotes,
      symptoms: selectedSymptoms.map<SymptomEntry>((s) => ({
        symptomId: s.id,
        severity: s.severity,
        onsetDate: s.onsetDate || undefined,
      })),
      temperature: temperature ? parseFloat(temperature) : null,
      bloodPressure: bloodPressure || undefined,
      bloodGlucose: bloodGlucose ? parseFloat(bloodGlucose) : null,
      bodyZone: bodyZoneKey ? t('bodyZone.' + bodyZoneKey) : undefined,
      bodyZoneSymptoms: bodyZoneSymptomsList.join(', ') || undefined,
      symptomOnset: symptomOnset || undefined,
      painIntensity: painIntensity || undefined,
      painType: painType || undefined,
      hadSymptomsBefore: hadSymptomsBefore === 'yes' ? true : hadSymptomsBefore === 'no' ? false : null,
      generalSymptoms: generalSymptomsList.join(', ') || undefined,
      medicationsTakenText: medicationsTakenOption === 'yes' ? medicationsTakenText : undefined,
      knownConditions: allKnownConditions || undefined,
    };

    try {
      await submitIntake(id, payload);
      await load();
      setShowIntakeForm(false);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setIntakeError(axiosError.response?.data?.error?.message ?? t('intake.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  if (error || !consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || 'Consultation not found.'}</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/patient/consultations')}>{t('common.back')}</button>
      </div>
    );
  }

  const canSubmitIntake = ['CONFIRMED', 'IN_PROGRESS'].includes(consultation.status) && !consultation.intake;

  const zoneSymptomsEN = bodyZoneKey ? ZONE_SYMPTOMS_EN[bodyZoneKey] : [];
  const zoneSymptomsOptions = zoneSymptomsEN.map((s) => ({ value: s, label: t('symptomName.' + s) }));
  const generalOptions = GENERAL_SYMPTOMS_EN.map((s) => ({ value: s, label: t('symptomName.' + s) }));
  const conditionOptions = KNOWN_CONDITIONS_EN.map((s) => ({ value: s, label: t('conditionName.' + s) }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button className="btn-secondary text-xs" onClick={() => navigate('/patient/consultations')}>
          ← {t('common.back')}
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('intake.consultationDetails')}</h1>
          <p className="text-slate-500 text-sm">
            {new Date(consultation.scheduledAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{t('intake.summary')}</h2>
          {statusBadge(consultation.status, t)}
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">{t('intake.type')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5 capitalize">
                {consultation.consultationType.replace('_', ' ').toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">{t('intake.duration')}</dt>
              <dd className="font-medium text-slate-800 mt-0.5">{consultation.slotDurationMinutes} {t('common.min')}</dd>
            </div>
            {consultation.noteDoctor && (
              <div className="col-span-2">
                <dt className="text-slate-500">{t('intake.doctorNote')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5 whitespace-pre-wrap">{consultation.noteDoctor}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Intake form CTA */}
      {canSubmitIntake && !showIntakeForm && (
        <div className="card card-body bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 font-medium">{t('intake.confirmed')}</p>
          <button className="btn-primary mt-3" onClick={() => setShowIntakeForm(true)}>
            {t('intake.fillForm')}
          </button>
        </div>
      )}

      {/* Intake form */}
      {showIntakeForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('intake.intakeFormTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('intake.intakeFormSubtitle')}</p>
          </div>
          <div className="card-body space-y-8">
            {intakeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{intakeError}</div>
            )}

            {/* SECTION: Vitals */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
                {t('intake.vitals')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">{t('intake.temperatureLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="34"
                    max="43"
                    className="input-field"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g. 37.5"
                  />
                </div>
                <div>
                  <label className="label">{t('intake.bloodPressureLabel')}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="e.g. 120/80"
                  />
                </div>
                <div>
                  <label className="label">{t('intake.bloodGlucoseLabel')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    placeholder="e.g. 95"
                  />
                </div>
              </div>
            </section>

            {/* SECTION: General questions */}
            <section className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
                {t('intake.generalQuestions')}
              </h3>

              {/* 1. Chief complaint */}
              <div>
                <label className="label">{t('intake.chiefComplaintLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder={t('intake.chiefComplaintPlaceholder')}
                />
              </div>

              {/* 2. Onset */}
              <div>
                <label className="label">{t('intake.symptomOnsetLabel')}</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {SYMPTOM_ONSET_OPTIONS.map(({ value, key }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="symptomOnset"
                        className="text-blue-600"
                        checked={symptomOnset === value}
                        onChange={() => setSymptomOnset(value)}
                      />
                      <span className="text-slate-700">{t('intake.onset.' + key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Pain intensity */}
              <div>
                <label className="label">{t('intake.painIntensityLabel')}</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {PAIN_INTENSITY_OPTIONS.map(({ value, key }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="painIntensity"
                        className="text-blue-600"
                        checked={painIntensity === value}
                        onChange={() => setPainIntensity(value)}
                      />
                      <span className="text-slate-700">{t('intake.painIntensity.' + key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Pain type */}
              <div>
                <label className="label">{t('intake.painTypeLabel')}</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {PAIN_TYPE_OPTIONS.map(({ value, key }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="painType"
                        className="text-blue-600"
                        checked={painType === value}
                        onChange={() => setPainType(value)}
                      />
                      <span className="text-slate-700">{t('intake.painType.' + key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Had before */}
              <div>
                <label className="label">{t('intake.hadBeforeLabel')}</label>
                <div className="flex gap-6 mt-1">
                  {[{ val: 'yes', labelKey: 'common.yes' }, { val: 'no', labelKey: 'common.no' }].map(({ val, labelKey }) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="hadBefore"
                        className="text-blue-600"
                        checked={hadSymptomsBefore === val}
                        onChange={() => setHadSymptomsBefore(val)}
                      />
                      <span className="text-slate-700">{t(labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. General symptoms checkboxes */}
              <div>
                <label className="label">{t('intake.generalSymptomsLabel')}</label>
                <div className="mt-2">
                  <CheckboxGroup
                    options={generalOptions}
                    selected={generalSymptomsList}
                    onChange={setGeneralSymptomsList}
                  />
                </div>
              </div>

              {/* 7. Medications taken */}
              <div>
                <label className="label">{t('intake.medicationsTakenLabel')}</label>
                <div className="flex gap-6 mt-1">
                  {[{ val: 'no', labelKey: 'common.no' }, { val: 'yes', labelKey: 'common.yes' }].map(({ val, labelKey }) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="medsTaken"
                        className="text-blue-600"
                        checked={medicationsTakenOption === val}
                        onChange={() => setMedicationsTakenOption(val)}
                      />
                      <span className="text-slate-700">{t(labelKey)}</span>
                    </label>
                  ))}
                </div>
                {medicationsTakenOption === 'yes' && (
                  <input
                    type="text"
                    className="input-field mt-2"
                    value={medicationsTakenText}
                    onChange={(e) => setMedicationsTakenText(e.target.value)}
                    placeholder={t('intake.medicationsTakenPlaceholder')}
                  />
                )}
              </div>

              {/* 8. Known conditions */}
              <div>
                <label className="label">{t('intake.knownConditionsLabel')}</label>
                <div className="mt-2">
                  <CheckboxGroup
                    options={conditionOptions}
                    selected={knownConditionsList}
                    onChange={setKnownConditionsList}
                  />
                </div>
                <input
                  type="text"
                  className="input-field mt-2"
                  value={knownConditionsOther}
                  onChange={(e) => setKnownConditionsOther(e.target.value)}
                  placeholder={t('intake.knownConditionsOtherPlaceholder')}
                />
              </div>
            </section>

            {/* SECTION: Body zone */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
                {t('intake.problemArea')}
              </h3>
              <div>
                <label className="label">{t('intake.bodyZoneLabel')}</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {BODY_ZONE_KEYS.map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="bodyZone"
                        className="text-blue-600"
                        checked={bodyZoneKey === key}
                        onChange={() => handleBodyZoneChange(key)}
                      />
                      <span className={`text-slate-700 ${key === 'chest_heart' ? 'font-medium' : ''}`}>
                        {key === 'chest_heart' ? '⚠️ ' : ''}{t('bodyZone.' + key)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Zone-specific symptoms */}
              {bodyZoneKey && zoneSymptomsOptions.length > 0 && (
                <div>
                  <label className="label">{t('intake.zoneSpecificLabel', { zone: t('bodyZone.' + bodyZoneKey) })}</label>
                  <div className="mt-2">
                    <CheckboxGroup
                      options={zoneSymptomsOptions}
                      selected={bodyZoneSymptomsList}
                      onChange={setBodyZoneSymptomsList}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* SECTION: Extra fields */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
                {t('intake.additionalInfo')}
              </h3>

              <div>
                <label className="label">{t('intake.currentMedicationsLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder={t('intake.currentMedicationsPlaceholder')}
                />
              </div>

              <div>
                <label className="label">{t('intake.allergiesLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder={t('intake.allergiesPlaceholder')}
                />
              </div>

              {/* Symptom picker */}
              <div>
                <label className="label">{t('intake.symptomSearchLabel')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={symptomSearch}
                  onChange={(e) => handleSymptomSearch(e.target.value)}
                  placeholder={t('intake.symptomSearchPlaceholder')}
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
                          <option value="MILD">{t('intake.severity.MILD')}</option>
                          <option value="MODERATE">{t('intake.severity.MODERATE')}</option>
                          <option value="SEVERE">{t('intake.severity.SEVERE')}</option>
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

              {/* Final message */}
              <div>
                <label className="label">{t('intake.additionalNotesLabel')}</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={t('intake.additionalNotesPlaceholder')}
                />
              </div>
            </section>

            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setShowIntakeForm(false)}>{t('common.cancel')}</button>
              <button className="btn-primary" onClick={handleIntakeSubmit} disabled={submitting}>
                {submitting ? t('intake.submitting') : t('intake.submitForm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted intake */}
      {consultation.intake && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('intake.intakeFormTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('intake.submittedOn', { date: new Date(consultation.intake.submittedAt).toLocaleDateString() })}
            </p>
          </div>
          <div className="card-body space-y-3 text-sm">
            <div><span className="text-slate-500">{t('intake.chiefComplaintField')}:</span> <span className="font-medium">{consultation.intake.chiefComplaint}</span></div>
            {consultation.intake.temperature != null && <div><span className="text-slate-500">{t('intake.temperatureField')}:</span> <span className="font-medium">{consultation.intake.temperature} °C</span></div>}
            {consultation.intake.bloodPressure && <div><span className="text-slate-500">{t('intake.bloodPressureField')}:</span> <span className="font-medium">{consultation.intake.bloodPressure}</span></div>}
            {consultation.intake.bloodGlucose != null && <div><span className="text-slate-500">{t('intake.bloodGlucoseField')}:</span> <span className="font-medium">{consultation.intake.bloodGlucose} mg/dL</span></div>}
            {consultation.intake.symptomOnset && <div><span className="text-slate-500">{t('intake.onsetField')}:</span> <span className="font-medium">{consultation.intake.symptomOnset}</span></div>}
            {consultation.intake.painIntensity && <div><span className="text-slate-500">{t('intake.painIntensityField')}:</span> <span className="font-medium">{consultation.intake.painIntensity}</span></div>}
            {consultation.intake.painType && <div><span className="text-slate-500">{t('intake.painTypeField')}:</span> <span className="font-medium">{consultation.intake.painType}</span></div>}
            {consultation.intake.hadSymptomsBefore != null && <div><span className="text-slate-500">{t('intake.hadBeforeField')}:</span> <span className="font-medium">{consultation.intake.hadSymptomsBefore ? t('common.yes') : t('common.no')}</span></div>}
            {consultation.intake.bodyZone && <div><span className="text-slate-500">{t('intake.bodyZoneField')}:</span> <span className="font-medium">{consultation.intake.bodyZone}</span></div>}
            {consultation.intake.bodyZoneSymptoms && <div><span className="text-slate-500">{t('intake.zoneField')}:</span> <span className="font-medium">{consultation.intake.bodyZoneSymptoms}</span></div>}
            {consultation.intake.generalSymptoms && <div><span className="text-slate-500">{t('intake.generalField')}:</span> <span className="font-medium">{consultation.intake.generalSymptoms}</span></div>}
            {consultation.intake.knownConditions && <div><span className="text-slate-500">{t('intake.knownField')}:</span> <span className="font-medium">{consultation.intake.knownConditions}</span></div>}
            {consultation.intake.medicationsTakenText && <div><span className="text-slate-500">{t('intake.medsField')}:</span> <span className="font-medium">{consultation.intake.medicationsTakenText}</span></div>}
            {consultation.intake.currentMedications && <div><span className="text-slate-500">{t('intake.currentMedsField')}:</span> <span className="font-medium">{consultation.intake.currentMedications}</span></div>}
            {consultation.intake.allergies && <div><span className="text-slate-500">{t('intake.allergiesField')}:</span> <span className="font-medium">{consultation.intake.allergies}</span></div>}
            {consultation.intake.additionalNotes && <div><span className="text-slate-500">{t('intake.notesField')}:</span> <span className="font-medium">{consultation.intake.additionalNotes}</span></div>}
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {(consultation.diagnoses ?? []).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('intake.diagnosesTitle')}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(consultation.diagnoses ?? []).map((d) => (
              <div key={d.id} className="card-body text-sm space-y-1">
                <div className="font-medium text-slate-800">
                  {d.diseaseName ?? d.customDiagnosis ?? t('intake.unknown')}
                  {d.icd10Code && <span className="ml-2 text-xs text-slate-500">ICD-10: {d.icd10Code}</span>}
                </div>
                <div className="text-slate-500">{t('common.confidence')}: {Math.round(d.confidence * 100)}%</div>
                {d.notes && <div className="text-slate-600">{d.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {(consultation.prescriptions ?? []).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('intake.prescriptionsTitle')}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(consultation.prescriptions ?? []).map((p) => (
              <div key={p.id} className="card-body text-sm space-y-2">
                {p.customInstructions && <p className="text-slate-700">{p.customInstructions}</p>}
                <div className="text-xs text-slate-500">
                  {t('intake.validFrom')}: {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}
                </div>
                {(p.items ?? []).map((item) => (
                  <div key={item.id} className="pl-3 border-l-2 border-blue-200">
                    <div className="font-medium">{item.medicationName ?? t('intake.unknown')}</div>
                    <div className="text-slate-500">
                      {item.dosage} · {item.frequency} · {item.durationDays} {t('intake.days')} · {t('intake.qty')}: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals */}
      {(consultation.referrals ?? []).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('intake.referralsTitle')}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(consultation.referrals ?? []).map((r) => (
              <div key={r.id} className="card-body text-sm space-y-1">
                <div className="font-medium text-slate-800">
                  {r.referralType} → {r.destination}
                </div>
                <div className="text-slate-600">{r.reason}</div>
                <div className="text-xs text-slate-500">{t('intake.urgency')}: {r.urgency}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
