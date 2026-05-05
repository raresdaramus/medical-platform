import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatient } from '../../api/userApi';
import { getDoctorPatientConsultations } from '../../api/consultationApi';
import type { PatientResponse, ConsultationResponse, ConsultationStatus } from '../../types';

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

export default function DoctorPatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patientId || !profileId) return;
    Promise.all([
      getPatient(patientId),
      getDoctorPatientConsultations(profileId, patientId),
    ])
      .then(([p, c]) => {
        setPatient(p);
        setConsultations(c.sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? '')));
      })
      .catch(() => setError(t('patients.failedLoadPatient')))
      .finally(() => setLoading(false));
  }, [patientId, profileId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error || t('patients.patientNotFound')}
      </div>
    );
  }

  const age = Math.floor(
    (Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const completedCount = consultations.filter((c) => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/doctor/patients')}
        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        {t('patients.backToPatients')}
      </button>

      {/* Patient header */}
      <div className="card card-body">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-slate-500 mt-1">
              {age} {t('patients.yearsOld')} · {patient.gender} · {t('patients.bloodType')}: {patient.bloodType.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500 space-y-0.5">
            <p>{t('patients.cnp')}: <span className="font-mono">{patient.cnp}</span></p>
            <p>{t('patients.phone')}: {patient.phone}</p>
            <p>{t('patients.dateOfBirth')}: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          </div>
        </div>

        {patient.address && (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-medium">{t('patients.address')}:</span> {patient.address}
          </p>
        )}

        <div className="mt-4 flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{consultations.length}</p>
            <p className="text-slate-500">{t('patients.totalConsultations')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
            <p className="text-slate-500">{t('patients.completed')}</p>
          </div>
        </div>
      </div>

      {/* Consultations history */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('patients.consultationHistory')}</h2>

        {consultations.length === 0 ? (
          <div className="card card-body text-center py-10">
            <p className="text-slate-500">{t('patients.noConsultations')}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.scheduled')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.type')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.duration')}</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-500">{t('consultations.status')}</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/doctor/consultations/${c.id}`)}
                  >
                    <td className="px-6 py-4 text-slate-800">
                      {c.scheduledAt
                        ? new Date(c.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                        : <span className="italic text-slate-400">Telemedicine</span>}
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
    </div>
  );
}
