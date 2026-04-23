import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatientConsultations } from '../../api/consultationApi';
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

export default function PatientConsultationsPage() {
  const { accountId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accountId) return;
    getPatientConsultations(accountId)
      .then((data) => setConsultations(data.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))))
      .catch(() => setError(t('consultations.failedLoad')))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('consultations.myConsultations')}</h1>
          <p className="text-slate-500 mt-1">{t('consultations.viewHistory')}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/patient/book')}
        >
          {t('consultations.bookNew')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {consultations.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">{t('consultations.noneYet')}</p>
          <button
            className="btn-primary mt-4"
            onClick={() => navigate('/patient/book')}
          >
            {t('consultations.bookFirst')}
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.scheduled')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.doctor')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.type')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.status')}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultations.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/patient/consultations/${c.id}`)}
                >
                  <td className="px-6 py-4 text-slate-700">
                    {new Date(c.scheduledAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {c.doctorName ? `Dr. ${c.doctorName}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">
                    {c.consultationType.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="px-6 py-4">{statusBadge(c.status, t)}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 text-xs font-medium">{t('common.view')}</span>
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
