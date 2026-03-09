import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDoctor } from '../../api/userApi';
import { getDoctorPendingConsultations, confirmConsultation, cancelConsultation } from '../../api/consultationApi';
import type { ConsultationResponse, DoctorResponse } from '../../types';

export default function DoctorDashboard() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!profileId) return;
    try {
      const [d, c] = await Promise.allSettled([
        getDoctor(profileId),
        getDoctorPendingConsultations(profileId),
      ]);
      if (d.status === 'fulfilled') setDoctor(d.value);
      if (c.status === 'fulfilled') setConsultations(c.value);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profileId]);

  const handleConfirm = async (id: string) => {
    setActionLoading(id + '-confirm');
    try {
      await confirmConsultation(id);
      await load();
    } catch {
      setError('Failed to confirm consultation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this consultation?')) return;
    setActionLoading(id + '-cancel');
    try {
      await cancelConsultation(id);
      await load();
    } catch {
      setError('Failed to cancel consultation.');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = consultations.filter((c) => c.status === 'PENDING');
  const confirmed = consultations.filter((c) => c.status === 'CONFIRMED' || c.status === 'IN_PROGRESS');

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {doctor ? `Welcome, Dr. ${doctor.firstName} ${doctor.lastName}!` : 'Welcome!'}
          </h1>
          <p className="text-slate-500 mt-1">
            {doctor && `${doctor.specialization} · ${doctor.clinicName}`}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/doctor/schedule')}>
          Manage Schedule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Pending requests</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{pending.length}</div>
        </div>
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Confirmed / In progress</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{confirmed.length}</div>
        </div>
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">Total active</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{consultations.length}</div>
        </div>
      </div>

      {/* Pending consultations */}
      {pending.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Pending consultation requests</h2>
            <p className="text-sm text-slate-500 mt-0.5">Review and respond to incoming requests.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {pending.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/doctor/consultations/${c.id}`)}
                >
                  <div className="font-medium text-slate-800 text-sm">
                    {c.patientName ?? `Patient ${c.patientId.slice(0, 8)}…`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    {' · '}
                    {c.consultationType.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="btn-success text-xs py-1.5 px-3"
                    disabled={actionLoading === c.id + '-confirm'}
                    onClick={() => handleConfirm(c.id)}
                  >
                    {actionLoading === c.id + '-confirm' ? '…' : 'Confirm'}
                  </button>
                  <button
                    className="btn-danger text-xs py-1.5 px-3"
                    disabled={actionLoading === c.id + '-cancel'}
                    onClick={() => handleCancel(c.id)}
                  >
                    {actionLoading === c.id + '-cancel' ? '…' : 'Cancel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming confirmed */}
      {confirmed.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">Upcoming & active consultations</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {confirmed.map((c) => (
              <div
                key={c.id}
                className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                onClick={() => navigate(`/doctor/consultations/${c.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm">
                    {c.patientName ?? `Patient ${c.patientId.slice(0, 8)}…`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={c.status === 'IN_PROGRESS' ? 'badge-green' : 'badge-blue'}
                  >
                    {c.status === 'IN_PROGRESS' ? 'In progress' : 'Confirmed'}
                  </span>
                  <span className="text-blue-600 text-xs font-medium">Open →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {consultations.length === 0 && (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">No consultations at the moment.</p>
        </div>
      )}
    </div>
  );
}
