import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctor, getIncomingFamilyDoctorRequests, respondToFamilyDoctorRequest } from '../../api/userApi';
import { getDoctorAllConsultations, confirmConsultation, cancelConsultation } from '../../api/consultationApi';
import type { ConsultationResponse, DoctorResponse, FamilyDoctorRequestResponse } from '../../types';
import DoctorChartsSection from './DoctorChartsSection';

export default function DoctorDashboard() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<FamilyDoctorRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!profileId) return;
    try {
      const [d, c, reqs] = await Promise.allSettled([
        getDoctor(profileId),
        getDoctorAllConsultations(profileId),
        getIncomingFamilyDoctorRequests(),
      ]);
      if (d.status === 'fulfilled') setDoctor(d.value);
      if (c.status === 'fulfilled') setConsultations(c.value);
      if (reqs.status === 'fulfilled') setEnrollmentRequests(reqs.value);
    } catch {
      setError(t('doctorDashboard.failedLoad'));
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
      setError(t('doctorDashboard.failedConfirm'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('doctorDashboard.cancelConfirm'))) return;
    setActionLoading(id + '-cancel');
    try {
      await cancelConsultation(id);
      await load();
    } catch {
      setError(t('doctorDashboard.failedCancel'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnrollmentResponse = async (requestId: string, accept: boolean) => {
    setActionLoading(requestId + (accept ? '-accept' : '-reject'));
    try {
      await respondToFamilyDoctorRequest(requestId, accept);
      setEnrollmentRequests(prev => prev.filter(r => r.id !== requestId));
    } catch {
      setError(t('familyDoctor.failedRespond'));
    } finally {
      setActionLoading(null);
    }
  };

  const pending = consultations.filter((c) => c.status === 'PENDING');
  const confirmed = consultations.filter((c) => c.status === 'CONFIRMED' || c.status === 'IN_PROGRESS');

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {doctor ? t('doctorDashboard.welcome', { name: `${doctor.firstName} ${doctor.lastName}` }) : t('doctorDashboard.welcomeGeneric')}
          </h1>
          <p className="text-slate-500 mt-1">
            {doctor && `${doctor.specialization} · ${doctor.clinicName}`}
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/doctor/schedule')}>
          {t('doctorDashboard.manageSchedule')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('doctorDashboard.pendingRequests')}</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{pending.length}</div>
        </div>
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('doctorDashboard.confirmedInProgress')}</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{confirmed.length}</div>
        </div>
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('doctorDashboard.totalActive')}</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{consultations.length}</div>
        </div>
        <div className="card card-body">
          <div className="text-sm font-medium text-slate-500">{t('familyDoctor.enrollmentRequests')}</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{enrollmentRequests.length}</div>
        </div>
      </div>

      {/* Charts */}
      <DoctorChartsSection consultations={consultations} />

      {/* Enrollment requests */}
      {enrollmentRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('familyDoctor.pendingEnrollmentTitle')}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{t('familyDoctor.pendingEnrollmentSubtitle')}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {enrollmentRequests.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm">{r.patientName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(r.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  {r.message && (
                    <div className="text-xs text-slate-600 mt-1 italic">"{r.message}"</div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="btn-success text-xs py-1.5 px-3"
                    disabled={actionLoading === r.id + '-accept'}
                    onClick={() => handleEnrollmentResponse(r.id, true)}
                  >
                    {actionLoading === r.id + '-accept' ? '…' : t('familyDoctor.accept')}
                  </button>
                  <button
                    className="btn-danger text-xs py-1.5 px-3"
                    disabled={actionLoading === r.id + '-reject'}
                    onClick={() => handleEnrollmentResponse(r.id, false)}
                  >
                    {actionLoading === r.id + '-reject' ? '…' : t('familyDoctor.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending consultations */}
      {pending.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-slate-900">{t('doctorDashboard.pendingTitle')}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{t('doctorDashboard.pendingSubtitle')}</p>
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
                    {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Telemedicine'}
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
                    {actionLoading === c.id + '-confirm' ? '…' : t('doctorDashboard.confirm')}
                  </button>
                  <button
                    className="btn-danger text-xs py-1.5 px-3"
                    disabled={actionLoading === c.id + '-cancel'}
                    onClick={() => handleCancel(c.id)}
                  >
                    {actionLoading === c.id + '-cancel' ? '…' : t('doctorDashboard.cancel')}
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
            <h2 className="font-semibold text-slate-900">{t('doctorDashboard.upcomingTitle')}</h2>
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
                    {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Telemedicine'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={c.status === 'IN_PROGRESS' ? 'badge-green' : 'badge-blue'}>
                    {c.status === 'IN_PROGRESS' ? t('doctorDashboard.inProgress') : t('status.CONFIRMED')}
                  </span>
                  <span className="text-blue-600 text-xs font-medium">{t('common.open')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {consultations.length === 0 && enrollmentRequests.length === 0 && (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">{t('doctorDashboard.noConsultations')}</p>
        </div>
      )}
    </div>
  );
}
