import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatientDoctor, searchDoctors } from '../../api/userApi';
import { getSlots, createConsultation, submitIntake } from '../../api/consultationApi';
import type { DoctorResponse, SlotResponse, ConsultationType } from '../../types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Medical category → symptom map ──────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'nervous',
    icon: '🧠',
    symptoms: ['headache', 'dizziness', 'numbness', 'tingling', 'memory_loss', 'blurred_vision', 'balance_problems', 'tremor', 'difficulty_speaking'],
  },
  {
    key: 'respiratory',
    icon: '🫁',
    symptoms: ['cough', 'shortness_of_breath', 'wheezing', 'chest_tightness', 'coughing_up_blood', 'sore_throat', 'runny_nose', 'nasal_congestion', 'difficulty_breathing'],
  },
  {
    key: 'cardiovascular',
    icon: '🫀',
    symptoms: ['chest_pain', 'chest_pressure', 'rapid_heartbeat', 'irregular_heartbeat', 'shortness_of_breath_exertion', 'leg_swelling', 'fainting', 'pain_radiating_arm_jaw'],
  },
  {
    key: 'musculoskeletal',
    icon: '🦴',
    symptoms: ['joint_pain', 'back_pain', 'neck_pain', 'shoulder_pain', 'knee_pain', 'swollen_joints', 'morning_stiffness', 'muscle_weakness', 'limited_mobility'],
  },
  {
    key: 'digestive',
    icon: '🫃',
    symptoms: ['abdominal_pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'heartburn', 'blood_in_stool', 'loss_of_appetite', 'difficulty_swallowing'],
  },
  {
    key: 'skin',
    icon: '🧴',
    symptoms: ['skin_rash', 'itching', 'redness', 'skin_lesions', 'dry_skin', 'hair_loss', 'hives', 'swelling'],
  },
  {
    key: 'ent',
    icon: '👂',
    symptoms: ['sore_throat', 'ear_pain', 'nasal_congestion', 'runny_nose', 'hearing_loss', 'tinnitus', 'hoarse_voice', 'nosebleeds', 'facial_pain'],
  },
  {
    key: 'urinary',
    icon: '💧',
    symptoms: ['painful_urination', 'frequent_urination', 'blood_in_urine', 'difficulty_urinating', 'lower_back_pain', 'urinary_incontinence', 'cloudy_urine', 'pelvic_pain'],
  },
  {
    key: 'mental',
    icon: '🧘',
    symptoms: ['anxiety', 'depression', 'sleep_problems', 'panic_attacks', 'mood_swings', 'difficulty_concentrating', 'fatigue', 'irritability'],
  },
  {
    key: 'eyes',
    icon: '👁️',
    symptoms: ['blurred_vision', 'eye_pain', 'red_eyes', 'dry_eyes', 'vision_loss', 'double_vision', 'light_sensitivity', 'eye_discharge'],
  },
  {
    key: 'hormonal',
    icon: '⚗️',
    symptoms: ['excessive_thirst', 'unexplained_weight_gain', 'unexplained_weight_loss', 'fatigue', 'hair_loss', 'excessive_sweating', 'heat_intolerance', 'cold_intolerance'],
  },
  {
    key: 'general',
    icon: '🌡️',
    symptoms: ['fever', 'fatigue', 'weight_loss', 'night_sweats', 'swollen_lymph_nodes', 'general_weakness', 'loss_of_appetite', 'muscle_aches', 'chills'],
  },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

const SYMPTOM_ONSET_OPTIONS = ['today', '1_2_days', '3_7_days', 'over_week', 'over_month'] as const;

export default function BookConsultationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profileId } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ─── Step 1 state ─────────────────────────────────────────────────────────
  const [assignedDoctor, setAssignedDoctor] = useState<DoctorResponse | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [consultationType, setConsultationType] = useState<ConsultationType>('IN_PERSON');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Step 2 — intake (telemedicine) ──────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | ''>('');
  const [checkedSymptoms, setCheckedSymptoms] = useState<Set<string>>(new Set());
  const [symptomOnset, setSymptomOnset] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');

  // ─── Step 2 — date (in-person) ────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(todayIso());

  // ─── Step 3 — slot (in-person) ────────────────────────────────────────────
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotDuration, setSlotDuration] = useState(30);

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!profileId) return;
    Promise.all([getPatientDoctor(profileId), searchDoctors()]).then(([assigned, all]) => {
      if (assigned) {
        setAssignedDoctor(assigned);
        setSelectedDoctor(assigned);
        setSelectedDoctorId(assigned.id);
      }
      setSearchResults(all);
    }).finally(() => setDoctorLoading(false));
  }, [profileId]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try { setSearchResults(await searchDoctors(value)); }
      finally { setSearchLoading(false); }
    }, 300);
  };

  const selectDoctor = (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setSelectedDoctorId(doctor.id);
    setSearchQuery(`Dr. ${doctor.firstName} ${doctor.lastName}`);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (step !== 3 || !selectedDoctorId || !selectedDate) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot('');
    getSlots(selectedDoctorId, selectedDate)
      .then(setSlots)
      .catch(() => setError(t('booking.failedLoadSlots')))
      .finally(() => setSlotsLoading(false));
  }, [step, selectedDoctorId, selectedDate]);

  const toggleSymptom = (sym: string) => {
    setCheckedSymptoms((prev) => {
      const next = new Set(prev);
      next.has(sym) ? next.delete(sym) : next.add(sym);
      return next;
    });
  };

  const handleCategorySelect = (key: CategoryKey) => {
    if (selectedCategory !== key) {
      setCheckedSymptoms(new Set());
    }
    setSelectedCategory(key);
  };

  const handleBookTelemedicine = async () => {
    if (!selectedDoctorId || !selectedCategory) return;
    setBooking(true);
    setError('');

    const checkedNames = [...checkedSymptoms].map((s) => t('booking.sym.' + s));
    const chiefComplaint = checkedNames.length > 0
      ? `${t('booking.cat.' + selectedCategory)}: ${checkedNames.join(', ')}`
      : t('booking.cat.' + selectedCategory);

    try {
      const consultation = await createConsultation({
        doctorId: selectedDoctorId,
        consultationType: 'TELEMEDICINE',
      });
      try {
        await submitIntake(consultation.id, {
          chiefComplaint,
          symptomDuration: symptomDuration.trim(),
          currentMedications: currentMedications.trim(),
          allergies: allergies.trim(),
          additionalNotes: additionalNotes.trim(),
          symptoms: [...checkedSymptoms].map((s) => ({
            customText: t('booking.sym.' + s),
            severity: 'MILD' as const,
          })),
          temperature: temperature ? parseFloat(temperature) : null,
          bloodPressure: bloodPressure.trim() || undefined,
          symptomOnset: symptomOnset || undefined,
          bodyZone: selectedCategory,
        });
      } catch {
        // intake is non-fatal
      }
      navigate('/patient/consultations');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message ?? t('booking.failedBook'));
    } finally {
      setBooking(false);
    }
  };

  const handleBookInPerson = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError('');
    try {
      await createConsultation({
        doctorId: selectedDoctorId,
        scheduledAt: `${selectedDate}T${selectedSlot}:00`,
        consultationType: 'IN_PERSON',
        slotDurationMinutes: slotDuration,
      });
      navigate('/patient/consultations');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message ?? t('booking.failedBook'));
    } finally {
      setBooking(false);
    }
  };

  const isTelemedicine = consultationType === 'TELEMEDICINE';

  const stepLabels = isTelemedicine
    ? [t('booking.step1'), t('booking.stepIntake')]
    : [t('booking.step1'), t('booking.step2'), t('booking.step3')];

  const availableSlots = slots.filter((s) => s.available);
  const isPastSlot = (slotTime: string) => {
    if (selectedDate !== todayIso()) return false;
    const [h, m] = slotTime.split(':').map(Number);
    const now = new Date();
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
  };

  const catSymptoms = selectedCategory
    ? CATEGORIES.find((c) => c.key === selectedCategory)?.symptoms ?? []
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('booking.title')}</h1>
        <p className="text-slate-500 mt-1">{t('booking.subtitle')}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
              {i < stepLabels.length - 1 && <div className="flex-1 h-px bg-slate-200 w-8" />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* ─── Step 1: Doctor + Type ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('booking.stepLabel1')}</h2>
          </div>
          <div className="card-body space-y-4">
            {doctorLoading ? (
              <p className="text-slate-400 text-sm">{t('common.loading')}</p>
            ) : (
              <>
                {assignedDoctor && (
                  <div>
                    <p className="label mb-1">{t('booking.assignedDoctor')}</p>
                    <button
                      onClick={() => selectDoctor(assignedDoctor)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedDoctorId === assignedDoctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}</p>
                      <p className="text-xs text-slate-500">{assignedDoctor.specialization} · {assignedDoctor.clinicName}</p>
                    </button>
                  </div>
                )}

                <div ref={searchRef} className="relative">
                  <label className="label">
                    {assignedDoctor ? t('booking.orSearchAnother') : t('booking.searchForDoctor')}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('booking.searchDoctor')}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {searchLoading ? (
                        <p className="px-4 py-3 text-sm text-slate-400">{t('booking.searching')}</p>
                      ) : searchResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-400">{t('booking.noDoctors')}</p>
                      ) : (
                        searchResults.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => selectDoctor(doc)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                              selectedDoctorId === doc.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-slate-900">
                              Dr. {doc.firstName} {doc.lastName}
                              {doc.id === assignedDoctor?.id && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t('booking.yourDoctor')}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{doc.specialization} · {doc.clinicName}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedDoctor && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900">✓ {t('booking.selected')} Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                    <p className="text-xs text-green-700">{selectedDoctor.specialization} · {selectedDoctor.clinicName}</p>
                  </div>
                )}

                <div>
                  <label className="label">{t('booking.consultationType')}</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setConsultationType('IN_PERSON')}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        consultationType === 'IN_PERSON'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">{t('booking.inPerson')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t('booking.inPersonDesc')}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('TELEMEDICINE')}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        consultationType === 'TELEMEDICINE'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">{t('booking.telemedicine')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t('booking.telemedicineDesc')}</p>
                    </button>
                  </div>
                </div>

                {isTelemedicine && selectedDoctor && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    {t('booking.telemedicineNote')}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={!selectedDoctorId}
                onClick={() => { setError(''); setStep(2); }}
              >
                {isTelemedicine ? t('booking.nextIntake') : t('booking.nextDate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 2: Intake form (TELEMEDICINE) ───────────────────────────────── */}
      {step === 2 && isTelemedicine && (
        <div className="space-y-4">
          {/* Category grid */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-base font-semibold text-slate-900">{t('booking.selectCategory')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('booking.selectCategoryHint')}</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      selectedCategory === cat.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-slate-700 leading-tight">
                      {t('booking.cat.' + cat.key)}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {t('booking.catHint.' + cat.key)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symptom checklist */}
          {selectedCategory && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-base font-semibold text-slate-900">{t('booking.selectSymptoms')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('booking.selectSymptomsHint')}</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {catSymptoms.map((sym) => {
                    const checked = checkedSymptoms.has(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                          checked
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                          checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {checked && <span className="text-white text-[10px] leading-none">✓</span>}
                        </span>
                        <span className="leading-tight">{t('booking.sym.' + sym)}</span>
                      </button>
                    );
                  })}
                </div>
                {checkedSymptoms.size > 0 && (
                  <p className="mt-3 text-xs text-blue-700">
                    {checkedSymptoms.size} {t('booking.symptomsSelected')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional info */}
          {selectedCategory && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-base font-semibold text-slate-900">{t('booking.additionalInfo')}</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">{t('intake.symptomOnsetLabel')}</label>
                  <select className="input-field" value={symptomOnset} onChange={(e) => setSymptomOnset(e.target.value)}>
                    <option value="">—</option>
                    {SYMPTOM_ONSET_OPTIONS.map((o) => (
                      <option key={o} value={o}>{t('intake.onset.' + o)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">{t('booking.symptomDurationLabel')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('booking.symptomDurationPlaceholder')}
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('intake.temperatureLabel')}</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="36.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">{t('intake.bloodPressureLabel')}</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="120/80"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('intake.currentMedicationsLabel')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('intake.currentMedicationsPlaceholder')}
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">{t('intake.allergiesLabel')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('intake.allergiesPlaceholder')}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">{t('intake.additionalNotesLabel')}</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder={t('intake.additionalNotesPlaceholder')}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => { setError(''); setStep(1); }}>{t('common.back')}</button>
            <button
              className="btn-primary"
              disabled={!selectedCategory || booking}
              onClick={handleBookTelemedicine}
            >
              {booking ? t('booking.booking') : t('booking.bookTelemedicine')}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Date (IN_PERSON) ─────────────────────────────────────────── */}
      {step === 2 && !isTelemedicine && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('booking.stepLabel2')}</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">{t('booking.dateLabel')}</label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                min={todayIso()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(1)}>{t('common.back')}</button>
              <button className="btn-primary" disabled={!selectedDate} onClick={() => setStep(3)}>
                {t('booking.nextSlot')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Slot (IN_PERSON) ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">
              {t('booking.stepLabel3', { date: new Date(selectedDate + 'T00:00:00').toLocaleDateString() })}
            </h2>
          </div>
          <div className="card-body space-y-4">
            {slotsLoading ? (
              <p className="text-slate-400 text-sm">{t('booking.loadingSlots')}</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('booking.noSlots')}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const past = isPastSlot(slot.slotTime);
                  return (
                    <button
                      key={slot.slotTime}
                      onClick={() => { if (!past) { setSelectedSlot(slot.slotTime); setSlotDuration(30); } }}
                      disabled={past}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        past
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : selectedSlot === slot.slotTime
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {slot.slotTime}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedSlot && (
              <p className="text-sm text-slate-600">{t('booking.selected')} <strong>{selectedSlot}</strong></p>
            )}
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(2)}>{t('common.back')}</button>
              <button
                className="btn-primary"
                disabled={!selectedSlot || booking}
                onClick={handleBookInPerson}
              >
                {booking ? t('booking.booking') : t('booking.confirmBooking')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
