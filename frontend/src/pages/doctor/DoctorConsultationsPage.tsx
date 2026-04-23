import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAllConsultations } from '../../api/consultationApi';
import type { ConsultationResponse, ConsultationStatus } from '../../types';

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

const STATUS_ORDER: Record<ConsultationStatus, number> = {
  IN_PROGRESS: 0,
  CONFIRMED: 1,
  PENDING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

export default function DoctorConsultationsPage() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<ConsultationStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!profileId) return;
    getDoctorAllConsultations(profileId)
      .then(setConsultations)
      .catch(() => setError(t('consultations.failedLoad')))
      .finally(() => setLoading(false));
  }, [profileId]);

  const filtered = consultations
    .filter((c) => filterStatus === 'ALL' || c.status === filterStatus)
    .sort((a, b) => {
      const orderDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return a.scheduledAt.localeCompare(b.scheduledAt);
    });

  const statusCounts = consultations.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('consultations.myConsultations')}</h1>
        <p className="text-slate-500 mt-1">{t('consultations.managingConsultations')}</p>
        <p className="text-xs text-slate-400 mt-1">{t('consultations.consultationsNote')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {(['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => {
          const count = s === 'ALL' ? consultations.length : (statusCounts[s] ?? 0);
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'ALL' ? t('consultations.all') : t('status.' + s)}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${filterStatus === s ? 'text-blue-200' : 'text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">{t('consultations.noFound')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.patient')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.scheduled')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.type')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.duration')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.status')}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/doctor/consultations/${c.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {c.patientName ?? `Patient ${c.patientId.slice(0, 8)}…`}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(c.scheduledAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">
                    {c.consultationType.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.slotDurationMinutes} {t('common.min')}</td>
                  <td className="px-6 py-4">{statusBadge(c.status, t)}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 text-xs font-medium">{t('common.open')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
