import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctorAllConsultations } from '../../api/consultationApi';
import type { ConsultationResponse, ConsultationStatus, ConsultationType } from '../../types';

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
  const [filterType, setFilterType] = useState<ConsultationType | 'ALL'>('ALL');
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    if (!profileId) return;
    getDoctorAllConsultations(profileId)
      .then(setConsultations)
      .catch(() => setError(t('consultations.failedLoad')))
      .finally(() => setLoading(false));
  }, [profileId]);

  const filtered = consultations
    .filter((c) => filterStatus === 'ALL' || c.status === filterStatus)
    .filter((c) => filterType === 'ALL' || c.consultationType === filterType)
    .filter((c) => {
      if (!patientSearch.trim()) return true;
      const name = (c.patientName ?? '').toLowerCase();
      return name.includes(patientSearch.trim().toLowerCase());
    })
    .sort((a, b) => {
      const orderDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      const aSched = a.scheduledAt ?? '';
      const bSched = b.scheduledAt ?? '';
      return aSched.localeCompare(bSched);
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Filters row — single row, scrolls horizontally if it overflows */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Patient name search — kept outside the scroll area so its focus glow isn't clipped */}
        <input
          type="text"
          className="input-field w-full sm:w-56 shrink-0"
          placeholder={t('consultations.filterByPatient')}
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
        />

        {/* Filter buttons — scroll horizontally if they overflow */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 min-w-0">
        {/* Type filter */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm font-medium text-slate-400 mr-1">{t('consultations.filterByType')}</span>
          {(['ALL', 'IN_PERSON', 'TELEMEDICINE'] as const).map((typ) => (
            <button
              key={typ}
              onClick={() => setFilterType(typ)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterType === typ
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {typ === 'ALL'
                ? t('consultations.all')
                : typ === 'IN_PERSON'
                ? t('consultations.inPerson')
                : t('consultations.online')}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 shrink-0" />

        {/* Status tabs */}
        <div className="flex gap-1 shrink-0">
          {(['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => {
            const count = s === 'ALL' ? consultations.length : (statusCounts[s] ?? 0);
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
        </div>
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
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.date')}</th>
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
                    {c.nextConsultationId && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                        {t('consultations.series')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.scheduledAt ? (
                      new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    ) : (() => {
                      // Online consultations have no scheduled slot: show when it was actually
                      // performed (completed → started), falling back to the request date.
                      const performedAt = c.completedAt ?? c.startedAt;
                      return performedAt ? (
                        <span>
                          {new Date(performedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          <span className="block text-xs text-slate-400 italic">{t('consultations.performed')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {new Date(c.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          <span className="block text-xs text-slate-400 italic">{t('consultations.async')}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">
                    {c.consultationType.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.scheduledAt ? `${c.slotDurationMinutes} ${t('common.min')}` : '—'}
                  </td>
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
