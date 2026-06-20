import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatientPermissions, createPermission, deletePermission, searchDoctors } from '../../api/userApi';
import type { PermissionResponse, PermissionType, DoctorResponse } from '../../types';

export default function DataPermissionsPage() {
  const { profileId } = useAuthStore();
  const { t } = useTranslation();

  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor search
  const [doctorSearch, setDoctorSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state — all granted permissions are FULL_ACCESS (the only level offered).
  const [expiresAt, setExpiresAt] = useState('');
  const [granting, setGranting] = useState(false);
  const [formError, setFormError] = useState('');

  const permissionTypeLabels: Record<PermissionType, string> = {
    VIEW_RECORDS: t('permissions.viewRecords'),
    EDIT_RECORDS: t('permissions.editRecords'),
    FULL_ACCESS: t('permissions.fullAccess'),
  };

  const loadPermissions = async () => {
    if (!profileId) return;
    try {
      const data = await getPatientPermissions(profileId);
      setPermissions(data);
    } catch {
      setError(t('permissions.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPermissions(); }, [profileId]);

  useEffect(() => {
    if (!doctorSearch.trim()) { setSearchResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        setSearchResults(await searchDoctors(doctorSearch.trim()));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [doctorSearch]);

  const handleGrant = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileId || !selectedDoctor) { setFormError(t('permissions.doctorRequired')); return; }
    setGranting(true);
    setFormError('');

    try {
      await createPermission(profileId, {
        granteeId: selectedDoctor.id,
        granteeType: 'DOCTOR',
        permissionType: 'FULL_ACCESS',
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setSelectedDoctor(null);
      setDoctorSearch('');
      setExpiresAt('');
      await loadPermissions();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? t('permissions.failedGrant'));
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    if (!profileId) return;
    if (!confirm(t('permissions.revokeConfirm'))) return;
    try {
      await deletePermission(profileId, permissionId);
      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch {
      setError(t('permissions.failedRevoke'));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('permissions.title')}</h1>
        <p className="text-slate-500 mt-1">{t('permissions.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Grant form */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">{t('permissions.grantAccess')}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleGrant} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            {/* Doctor search / selected */}
            <div>
              <label className="label">{t('familyDoctor.searchPlaceholder')}</label>
              {selectedDoctor ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      {selectedDoctor.specialization} · {selectedDoctor.clinicName}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 underline ml-4 flex-shrink-0"
                    onClick={() => { setSelectedDoctor(null); setDoctorSearch(''); setSearchResults([]); }}
                  >
                    {t('common.change')}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('permissions.searchDoctor')}
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                  />
                  {searchLoading && (
                    <p className="text-sm text-slate-400 mt-1">{t('familyDoctor.searching')}</p>
                  )}
                  {!searchLoading && searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-52 overflow-y-auto mt-1">
                      {searchResults.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                          onClick={() => { setSelectedDoctor(d); setDoctorSearch(''); setSearchResults([]); }}
                        >
                          <p className="text-sm font-medium text-slate-800">Dr. {d.firstName} {d.lastName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{d.specialization} · {d.clinicName}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searchLoading && doctorSearch.trim() && searchResults.length === 0 && (
                    <p className="text-sm text-slate-400 mt-1">{t('familyDoctor.noDoctors')}</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="label">{t('permissions.expiresAt')}</label>
              <input
                type="date"
                className="input-field"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {/* Access explanation */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              {t('permissions.accessNote')}
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={granting || !selectedDoctor}>
                {granting ? t('permissions.granting') : t('permissions.grant')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Current permissions */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">{t('permissions.activePermissions')}</h2>
        </div>

        {permissions.length === 0 ? (
          <div className="card-body text-center py-8">
            <p className="text-slate-500 text-sm">{t('permissions.none')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {permissions.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">
                    {p.granteeName ? `Dr. ${p.granteeName}` : `Dr. ${p.granteeId.slice(0, 8)}…`}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="badge-blue text-xs">
                      {permissionTypeLabels[p.permissionType] ?? p.permissionType}
                    </span>
                    {p.expiresAt ? (
                      <span className="text-xs text-slate-500">
                        {t('permissions.expires')} {new Date(p.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{t('permissions.noExpiry')}</span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-danger flex-shrink-0 text-xs py-1.5 px-3"
                  onClick={() => handleRevoke(p.id)}
                >
                  {t('permissions.revoke')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
