import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPatientDoctor, searchDoctors } from '../../api/userApi';
import { getSlots, createConsultation } from '../../api/consultationApi';
import type { DoctorResponse, SlotResponse, ConsultationType } from '../../types';

type Step = 1 | 2 | 3;

function formatTime(slotTime: string) {
  // slotTime is already "HH:mm" from the backend
  return slotTime;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookConsultationPage() {
  const navigate = useNavigate();
  const { profileId } = useAuthStore();

  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [assignedDoctor, setAssignedDoctor] = useState<DoctorResponse | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 2
  const [selectedDate, setSelectedDate] = useState(todayIso());

  // Step 3
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('IN_PERSON');
  const [slotDuration, setSlotDuration] = useState(30);

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load assigned doctor + initial doctor list
  useEffect(() => {
    if (!profileId) return;
    Promise.all([
      getPatientDoctor(profileId),
      searchDoctors(),
    ]).then(([assigned, all]) => {
      if (assigned) {
        setAssignedDoctor(assigned);
        setSelectedDoctor(assigned);
        setSelectedDoctorId(assigned.id);
      }
      setSearchResults(all);
    }).finally(() => setDoctorLoading(false));
  }, [profileId]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchDoctors(value);
        setSearchResults(results);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const selectDoctor = (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setSelectedDoctorId(doctor.id);
    setSearchQuery(`Dr. ${doctor.firstName} ${doctor.lastName}`);
    setShowDropdown(false);
  };

  // Load slots when entering step 3
  useEffect(() => {
    if (step !== 3 || !selectedDoctorId || !selectedDate) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot('');
    getSlots(selectedDoctorId, selectedDate)
      .then(setSlots)
      .catch(() => setError('Failed to load available slots.'))
      .finally(() => setSlotsLoading(false));
  }, [step, selectedDoctorId, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError('');
    try {
      await createConsultation({
        doctorId: selectedDoctorId,
        scheduledAt: `${selectedDate}T${selectedSlot}:00`,
        consultationType,
        slotDurationMinutes: slotDuration,
      });
      navigate('/patient/consultations');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message ?? 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book a Consultation</h1>
        <p className="text-slate-500 mt-1">Follow the steps to schedule your appointment.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={`text-sm font-medium ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
              {s === 1 ? 'Doctor' : s === 2 ? 'Date' : 'Time slot'}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 w-8" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Step 1: Select doctor */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Step 1 — Select your doctor</h2>
          </div>
          <div className="card-body space-y-4">
            {doctorLoading ? (
              <p className="text-slate-400 text-sm">Loading…</p>
            ) : (
              <>
                {assignedDoctor && (
                  <div>
                    <p className="label mb-1">Your assigned doctor</p>
                    <button
                      onClick={() => selectDoctor(assignedDoctor)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedDoctorId === assignedDoctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{assignedDoctor.specialization} · {assignedDoctor.clinicName}</p>
                    </button>
                  </div>
                )}

                <div ref={searchRef} className="relative">
                  <label className="label">{assignedDoctor ? 'Or search for another doctor' : 'Search for a doctor'}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search by name…"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {searchLoading ? (
                        <p className="px-4 py-3 text-sm text-slate-400">Searching…</p>
                      ) : searchResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-400">No doctors found.</p>
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
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Your doctor</span>
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
                    <p className="text-sm font-medium text-green-900">
                      ✓ Selected: Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                    <p className="text-xs text-green-700">{selectedDoctor.specialization} · {selectedDoctor.clinicName}</p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end">
              <button
                className="btn-primary"
                disabled={!selectedDoctorId}
                onClick={() => setStep(2)}
              >
                Next: Pick a date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select date */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Step 2 — Choose a date</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                min={todayIso()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Consultation type</label>
              <select
                className="input-field"
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
              >
                <option value="IN_PERSON">In person</option>
                <option value="TELEMEDICINE">Telemedicine</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn-primary"
                disabled={!selectedDate}
                onClick={() => setStep(3)}
              >
                Next: Pick a slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Select time slot */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">
              Step 3 — Available slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
            </h2>
          </div>
          <div className="card-body space-y-4">
            {slotsLoading ? (
              <p className="text-slate-400 text-sm">Loading slots…</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-slate-500 text-sm">No available slots for this day. Try a different date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.slotTime}
                    onClick={() => {
                      setSelectedSlot(slot.slotTime);
                      setSlotDuration(30);
                    }}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSlot === slot.slotTime
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {formatTime(slot.slotTime)}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <p className="text-sm text-slate-600">
                Selected: <strong>{formatTime(selectedSlot)}</strong>
              </p>
            )}

            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button
                className="btn-primary"
                disabled={!selectedSlot || booking}
                onClick={handleBook}
              >
                {booking ? 'Booking…' : 'Confirm booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
