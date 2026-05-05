import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import {
  getPatient, getPatientDoctor, createPatient,
  searchDoctors, sendFamilyDoctorRequest, getMyFamilyDoctorRequests, cancelFamilyDoctorRequest,
} from '../../api/userApi';
import { getPatientMedicalRecord, getPatientConsultations } from '../../api/consultationApi';
import type {
  PatientResponse, DoctorResponse, BloodType, Gender, ConsultationResponse,
  FamilyDoctorRequestResponse,
} from '../../types';

export default function PatientDashboard() {
  const { profileId, accountId, setProfile } = useAuthStore();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [myRequests, setMyRequests] = useState<FamilyDoctorRequestResponse[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [upcomingConsultations, setUpcomingConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile creation form state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', cnp: '', dateOfBirth: '',
    gender: 'MALE' as Gender, phone: '', address: '', bloodType: 'A_POSITIVE' as BloodType,
  });

  // Family doctor request state
  const [doctorSearch, setDoctorSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateForm = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const p = await createPatient(form);
      setProfile(p.id);
      setPatient(p);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setCreateError(axiosError.response?.data?.error?.message ?? t('patientDashboard.failedCreate'));
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [p, d, records, cons, reqs] = await Promise.allSettled([
          getPatient(profileId),
          getPatientDoctor(profileId),
          accountId ? getPatientMedicalRecord(accountId) : Promise.resolve([]),
          accountId ? getPatientConsultations(accountId) : Promise.resolve([]),
          getMyFamilyDoctorRequests(),
        ]);

        if (p.status === 'fulfilled') setPatient(p.value);
        if (d.status === 'fulfilled') setDoctor(d.value);
        if (records.status === 'fulfilled') setRecordCount(records.value.length);
        if (reqs.status === 'fulfilled') setMyRequests(reqs.value);
        if (cons.status === 'fulfilled') {
          const upcoming = cons.value
            .filter(c => ['CONFIRMED', 'PENDING'].includes(c.status))
            .sort((a, b) => {
              if (!a.scheduledAt) return 1;
              if (!b.scheduledAt) return -1;
              return a.scheduledAt.localeCompare(b.scheduledAt);
            });
          setUpcomingConsultations(upcoming);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profileId]);

  // Debounced doctor search
  useEffect(() => {
    if (!doctorSearch.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchDoctors(doctorSearch.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [doctorSearch]);

  const handleSendRequest = async () => {
    if (!selectedDoctor) return;
    setSendingRequest(true);
    setRequestError('');
    try {
      const req = await sendFamilyDoctorRequest({
        doctorId: selectedDoctor.id,
        message: requestMessage.trim() || undefined,
      });
      setMyRequests(prev => [req, ...prev]);
      setSelectedDoctor(null);
      setDoctorSearch('');
      setRequestMessage('');
      setSearchResults([]);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setRequestError(axiosError.response?.data?.error?.message ?? t('familyDoctor.failedSend'));
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      await cancelFamilyDoctorRequest(requestId);
      setMyRequests(prev => prev.filter(r => r.id !== requestId));
    } catch {
      // silently ignore
    } finally {
      setCancellingId(null);
    }
  };

  const pendingRequest = myRequests.find(r => r.status === 'PENDING') ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('patientDashboard.completeProfile')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('patientDashboard.completeProfileSub')}</p>
          </div>
          <div className="card-body">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{createError}</div>
            )}
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('auth.firstName')}</label>
                  <input name="firstName" type="text" className="input-field" value={form.firstName} onChange={updateForm} required />
                </div>
                <div>
                  <label className="label">{t('auth.lastName')}</label>
                  <input name="lastName" type="text" className="input-field" value={form.lastName} onChange={updateForm} required />
                </div>
              </div>
              <div>
                <label className="label">{t('auth.cnp')}</label>
                <input name="cnp" type="text" className="input-field" value={form.cnp} onChange={updateForm} required maxLength={13} placeholder="1234567890123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('auth.dateOfBirth')}</label>
                  <input name="dateOfBirth" type="date" className="input-field" value={form.dateOfBirth} onChange={updateForm} required />
                </div>
                <div>
                  <label className="label">{t('auth.gender')}</label>
                  <select name="gender" className="input-field" value={form.gender} onChange={updateForm}>
                    <option value="MALE">{t('auth.male')}</option>
                    <option value="FEMALE">{t('auth.female')}</option>
                    <option value="OTHER">{t('auth.other')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('auth.phone')}</label>
                  <input name="phone" type="tel" className="input-field" value={form.phone} onChange={updateForm} required placeholder="+40 712 345 678" />
                </div>
                <div>
                  <label className="label">{t('auth.bloodType')}</label>
                  <select name="bloodType" className="input-field" value={form.bloodType} onChange={updateForm}>
                    {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map(bt => (
                      <option key={bt} value={bt}>{bt.replace('_POSITIVE','+').replace('_NEGATIVE','-').replace('_','')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t('auth.address')}</label>
                <input name="address" type="text" className="input-field" value={form.address} onChange={updateForm} required placeholder="Str. Exemplu nr. 1, București" />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={creating}>
                {creating ? t('patientDashboard.creatingProfile') : t('patientDashboard.createProfile')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {patient ? t('patientDashboard.welcome', { name: patient.firstName }) : t('patientDashboard.welcomeGeneric')}
        </h1>
        <p className="text-slate-500 mt-1">{t('patientDashboard.overview')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('patientDashboard.medicalRecords')}</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{recordCount}</div>
          <Link to="/patient/record" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
            {t('patientDashboard.viewAllRecords')}
          </Link>
        </div>

        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('patientDashboard.assignedDoctor')}</div>
          {doctor ? (
            <>
              <div className="text-base font-semibold text-slate-900 mt-1">
                Dr. {doctor.firstName} {doctor.lastName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</div>
            </>
          ) : pendingRequest ? (
            <>
              <div className="text-sm font-semibold text-yellow-700 mt-1">
                {t('familyDoctor.pendingRequest')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Dr. {pendingRequest.doctorName}</div>
            </>
          ) : (
            <div className="text-base font-semibold text-slate-900 mt-1">{t('patientDashboard.notAssigned')}</div>
          )}
        </div>

        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('patientDashboard.quickActions')}</div>
          <div className="mt-2 space-y-2">
            <Link to="/patient/book" className="btn-primary w-full text-xs py-1.5">
              {t('patientDashboard.bookConsultation')}
            </Link>
            <Link to="/patient/consultations" className="btn-secondary w-full text-xs py-1.5">
              {t('nav.myConsultations')}
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming consultations */}
      {upcomingConsultations.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">{t('patientDashboard.upcomingConsultations')}</h2>
            <Link to="/patient/consultations" className="text-xs text-blue-600 hover:text-blue-700">
              {t('patientDashboard.viewAll')}
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingConsultations.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                to={`/patient/consultations/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.scheduledAt
                      ? new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                      : t('consultations.async')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.consultationType === 'IN_PERSON' ? t('booking.inPerson') : t('booking.telemedicine')}
                    {c.doctorName ? ` · Dr. ${c.doctorName}` : ''}
                    {c.nextConsultationId ? ` · ${t('consultations.series')}` : ''}
                  </p>
                </div>
                <span className={c.status === 'CONFIRMED' ? 'badge-blue' : 'badge-yellow'}>
                  {t('status.' + c.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Patient info */}
      {patient && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('patientDashboard.yourInformation')}</h2>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">{t('patientDashboard.fullName')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {patient.firstName} {patient.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patients.dateOfBirth')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.gender')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5 capitalize">{patient.gender.toLowerCase()}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.bloodTypeLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {patient.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '')}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.phoneLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{patient.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.addressLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{patient.address}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Doctor card (assigned) */}
      {doctor && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('patientDashboard.yourDoctor')}</h2>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">{t('patientDashboard.name')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  Dr. {doctor.firstName} {doctor.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.specializationLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.specialization}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.clinicLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.clinicName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('patientDashboard.phoneLabel')}</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.phone}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* No doctor — find family doctor section */}
      {!doctor && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">{t('familyDoctor.requestTitle')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('familyDoctor.requestSubtitle')}</p>
          </div>
          <div className="card-body space-y-4">

            {/* Pending request banner */}
            {pendingRequest && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {t('familyDoctor.pendingRequestTo', { name: pendingRequest.doctorName })}
                  </p>
                  {pendingRequest.message && (
                    <p className="text-xs text-yellow-700 mt-0.5">
                      {t('familyDoctor.yourMessage')}: {pendingRequest.message}
                    </p>
                  )}
                </div>
                <button
                  className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                  disabled={cancellingId === pendingRequest.id}
                  onClick={() => handleCancelRequest(pendingRequest.id)}
                >
                  {cancellingId === pendingRequest.id ? '…' : t('familyDoctor.cancelRequest')}
                </button>
              </div>
            )}

            {/* Search + send (only if no pending request) */}
            {!pendingRequest && (
              <>
                {requestError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {requestError}
                  </div>
                )}

                <div>
                  <label className="label">{t('familyDoctor.searchPlaceholder')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('familyDoctor.searchPlaceholder')}
                    value={doctorSearch}
                    onChange={e => { setDoctorSearch(e.target.value); setSelectedDoctor(null); }}
                  />
                </div>

                {searchLoading && (
                  <p className="text-sm text-slate-400">{t('familyDoctor.searching')}</p>
                )}

                {!searchLoading && searchResults.length > 0 && !selectedDoctor && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-52 overflow-y-auto">
                    {searchResults.map(d => (
                      <button
                        key={d.id}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        onClick={() => { setSelectedDoctor(d); setDoctorSearch(`${d.firstName} ${d.lastName}`); setSearchResults([]); }}
                      >
                        <p className="text-sm font-medium text-slate-800">Dr. {d.firstName} {d.lastName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.specialization} · {d.clinicName}</p>
                      </button>
                    ))}
                  </div>
                )}

                {!searchLoading && doctorSearch.trim() && searchResults.length === 0 && !selectedDoctor && (
                  <p className="text-sm text-slate-400">{t('familyDoctor.noDoctors')}</p>
                )}

                {selectedDoctor && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <p className="text-sm font-medium text-blue-800">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        {selectedDoctor.specialization} · {selectedDoctor.clinicName}
                      </p>
                    </div>
                    <div>
                      <label className="label">{t('familyDoctor.messageLabel')}</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder={t('familyDoctor.messagePlaceholder')}
                        value={requestMessage}
                        onChange={e => setRequestMessage(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn-primary text-sm py-2"
                        disabled={sendingRequest}
                        onClick={handleSendRequest}
                      >
                        {sendingRequest ? t('familyDoctor.sending') : t('familyDoctor.sendRequest')}
                      </button>
                      <button
                        className="btn-secondary text-sm py-2"
                        onClick={() => { setSelectedDoctor(null); setDoctorSearch(''); setRequestMessage(''); }}
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Previous requests history */}
            {myRequests.filter(r => r.status !== 'PENDING').length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-slate-500 mb-2">{t('familyDoctor.previousRequests')}</p>
                <div className="space-y-2">
                  {myRequests.filter(r => r.status !== 'PENDING').slice(0, 3).map(r => (
                    <div key={r.id} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">Dr. {r.doctorName}</span>
                      <span className={r.status === 'ACCEPTED' ? 'badge-green' : 'badge-red'}>
                        {t('familyDoctor.status_' + r.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
