import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getDoctorPatients, getPermittedPatients } from '../../api/userApi';
import type { PatientResponse, PermittedPatientResponse, PermissionType } from '../../types';

const PERMISSION_BADGE: Record<PermissionType, string> = {
  VIEW_RECORDS: 'badge-blue',
  EDIT_RECORDS: 'badge-green',
  FULL_ACCESS:  'badge-green',
};

const PERMISSION_LABEL: Record<PermissionType, string> = {
  VIEW_RECORDS: 'permissions.viewRecords',
  EDIT_RECORDS: 'permissions.editRecords',
  FULL_ACCESS:  'permissions.fullAccess',
};

export default function DoctorPatientsPage() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [tab, setTab] = useState<'assigned' | 'permitted'>('assigned');
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [permitted, setPermitted] = useState<PermittedPatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profileId) return;
    Promise.allSettled([
      getDoctorPatients(profileId),
      getPermittedPatients(profileId),
    ]).then(([a, p]) => {
      if (a.status === 'fulfilled') setPatients(a.value);
      else setError(t('patients.failedLoad'));
      if (p.status === 'fulfilled') setPermitted(p.value);
    }).finally(() => setLoading(false));
  }, [profileId]);

  const filteredAssigned = patients.filter((p) => {
    const q = search.toLowerCase();
    return p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || p.cnp.includes(q);
  });

  const filteredPermitted = permitted.filter(({ patient: p }) => {
    const q = search.toLowerCase();
    return p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || p.cnp.includes(q);
  });

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('patients.myPatients')}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'assigned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => { setTab('assigned'); setSearch(''); }}
        >
          {t('patients.tabAssigned')}
          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {patients.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'permitted'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => { setTab('permitted'); setSearch(''); }}
        >
          {t('patients.tabPermitted')}
          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {permitted.length}
          </span>
        </button>
      </div>

      {tab === 'assigned' && (
        <>
          <p className="text-slate-500 text-sm">{t('patients.assignedToYou')}</p>
          <input
            type="text"
            placeholder={t('patients.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filteredAssigned.length === 0 ? (
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
                  {filteredAssigned.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">{p.firstName} {p.lastName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{p.cnp}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(p.dateOfBirth).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">{p.bloodType.replace('_', ' ')}</td>
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
        </>
      )}

      {tab === 'permitted' && (
        <>
          <p className="text-slate-500 text-sm">{t('patients.permittedSubtitle')}</p>
          <input
            type="text"
            placeholder={t('patients.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filteredPermitted.length === 0 ? (
            <div className="card card-body text-center py-12">
              <p className="text-slate-500">{search ? t('patients.noMatch') : t('patients.nonePermitted')}</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.name')}</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.dateOfBirth')}</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.bloodType')}</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.permissionLevel')}</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500">{t('patients.expiresOn')}</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPermitted.map(({ patient: p, permissionType, expiresAt }) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">{p.firstName} {p.lastName}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(p.dateOfBirth).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">{p.bloodType.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={PERMISSION_BADGE[permissionType as PermissionType] ?? 'badge-blue'}>
                          {t(PERMISSION_LABEL[permissionType as PermissionType] ?? 'permissions.viewRecords')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {expiresAt
                          ? new Date(expiresAt).toLocaleDateString()
                          : <span className="text-slate-400">{t('patients.noExpiry')}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 text-xs font-medium">{t('common.view')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
