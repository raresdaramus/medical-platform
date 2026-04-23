import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctorPatients } from '../../api/userApi';
import type { PatientResponse } from '../../types';

export default function DoctorPatientsPage() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profileId) return;
    getDoctorPatients(profileId)
      .then(setPatients)
      .catch(() => setError(t('patients.failedLoad')))
      .finally(() => setLoading(false));
  }, [profileId]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.cnp.includes(q)
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('patients.myPatients')}</h1>
        <p className="text-slate-500 mt-1">{t('patients.assignedToYou')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <input
        type="text"
        placeholder={t('patients.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filtered.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">{search ? t('patients.noMatch') : t('patients.noneAssigned')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.name')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.cnp')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.dateOfBirth')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.bloodType')}</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.phone')}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/doctor/patients/${p.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{p.cnp}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(p.dateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {p.bloodType.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.phone}</td>
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
