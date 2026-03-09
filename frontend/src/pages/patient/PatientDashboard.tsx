import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPatient, getPatientDoctor, createPatient } from '../../api/userApi';
import { getPatientMedicalRecord } from '../../api/consultationApi';
import type { PatientResponse, DoctorResponse, BloodType, Gender } from '../../types';

export default function PatientDashboard() {
  const { profileId, setProfile } = useAuthStore();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Profile creation form state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', cnp: '', dateOfBirth: '',
    gender: 'MALE' as Gender, phone: '', address: '', bloodType: 'A_POSITIVE' as BloodType,
  });

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
      setCreateError(axiosError.response?.data?.error?.message ?? 'Failed to create profile.');
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
        const [p, d, records] = await Promise.allSettled([
          getPatient(profileId),
          getPatientDoctor(profileId),
          getPatientMedicalRecord(profileId),
        ]);

        if (p.status === 'fulfilled') setPatient(p.value);
        if (d.status === 'fulfilled') setDoctor(d.value);
        if (records.status === 'fulfilled') setRecordCount(records.value.length);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Complete your patient profile</h2>
            <p className="text-sm text-slate-500 mt-1">Your account exists but you need to fill in your medical profile first.</p>
          </div>
          <div className="card-body">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{createError}</div>
            )}
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First name</label>
                  <input name="firstName" type="text" className="input-field" value={form.firstName} onChange={updateForm} required />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input name="lastName" type="text" className="input-field" value={form.lastName} onChange={updateForm} required />
                </div>
              </div>
              <div>
                <label className="label">CNP</label>
                <input name="cnp" type="text" className="input-field" value={form.cnp} onChange={updateForm} required maxLength={13} placeholder="1234567890123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of birth</label>
                  <input name="dateOfBirth" type="date" className="input-field" value={form.dateOfBirth} onChange={updateForm} required />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select name="gender" className="input-field" value={form.gender} onChange={updateForm}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" type="tel" className="input-field" value={form.phone} onChange={updateForm} required placeholder="+40 712 345 678" />
                </div>
                <div>
                  <label className="label">Blood type</label>
                  <select name="bloodType" className="input-field" value={form.bloodType} onChange={updateForm}>
                    {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map(bt => (
                      <option key={bt} value={bt}>{bt.replace('_POSITIVE','+').replace('_NEGATIVE','-').replace('_','')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input name="address" type="text" className="input-field" value={form.address} onChange={updateForm} required placeholder="Str. Exemplu nr. 1, București" />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={creating}>
                {creating ? 'Creating profile…' : 'Create patient profile'}
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
          {patient ? `Welcome, ${patient.firstName}!` : 'Welcome!'}
        </h1>
        <p className="text-slate-500 mt-1">Here is an overview of your health information.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Medical Records</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{recordCount}</div>
          <Link to="/patient/record" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
            View all records →
          </Link>
        </div>

        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Assigned Doctor</div>
          <div className="text-base font-semibold text-slate-900 mt-1">
            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Not assigned'}
          </div>
          {doctor && (
            <div className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</div>
          )}
        </div>

        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Quick Actions</div>
          <div className="mt-2 space-y-2">
            <Link to="/patient/book" className="btn-primary w-full text-xs py-1.5">
              Book Consultation
            </Link>
            <Link to="/patient/consultations" className="btn-secondary w-full text-xs py-1.5">
              My Consultations
            </Link>
          </div>
        </div>
      </div>

      {/* Patient info */}
      {patient && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Your Information</h2>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Full name</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {patient.firstName} {patient.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Date of birth</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Gender</dt>
                <dd className="font-medium text-slate-800 mt-0.5 capitalize">{patient.gender.toLowerCase()}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Blood type</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {patient.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '')}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{patient.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Address</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{patient.address}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Doctor card */}
      {doctor && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-base font-semibold text-slate-900">Your Doctor</h2>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  Dr. {doctor.firstName} {doctor.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Specialization</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.specialization}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Clinic</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.clinicName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{doctor.phone}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {!doctor && (
        <div className="card card-body text-center py-8">
          <p className="text-slate-500 text-sm">You have not been assigned a family doctor yet.</p>
          <p className="text-slate-400 text-xs mt-1">Contact your healthcare provider to get assigned.</p>
        </div>
      )}
    </div>
  );
}
