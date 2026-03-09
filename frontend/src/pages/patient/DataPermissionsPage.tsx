import { useEffect, useState, type FormEvent } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getPatientPermissions, createPermission, deletePermission } from '../../api/userApi';
import type { PermissionResponse, PermissionType } from '../../types';

const permissionTypeLabels: Record<PermissionType, string> = {
  VIEW_RECORDS: 'View Records',
  EDIT_RECORDS: 'Edit Records',
  FULL_ACCESS: 'Full Access',
};

export default function DataPermissionsPage() {
  const { profileId } = useAuthStore();

  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [granteeId, setGranteeId] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('VIEW_RECORDS');
  const [expiresAt, setExpiresAt] = useState('');
  const [granting, setGranting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadPermissions = async () => {
    if (!profileId) return;
    try {
      const data = await getPatientPermissions(profileId);
      setPermissions(data);
    } catch {
      setError('Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPermissions(); }, [profileId]);

  const handleGrant = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileId || !granteeId.trim()) { setFormError('Doctor ID is required.'); return; }
    setGranting(true);
    setFormError('');

    try {
      await createPermission(profileId, {
        granteeId: granteeId.trim(),
        granteeType: 'DOCTOR',
        permissionType,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setGranteeId('');
      setExpiresAt('');
      await loadPermissions();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setFormError(axiosError.response?.data?.error?.message ?? 'Failed to grant permission.');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    if (!profileId) return;
    if (!confirm('Are you sure you want to revoke this permission?')) return;
    try {
      await deletePermission(profileId, permissionId);
      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch {
      setError('Failed to revoke permission.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Permissions</h1>
        <p className="text-slate-500 mt-1">Control who can access your medical data.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Grant form */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">Grant access to a doctor</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleGrant} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
            )}

            <div>
              <label className="label">Doctor ID (UUID)</label>
              <input
                type="text"
                className="input-field"
                value={granteeId}
                onChange={(e) => setGranteeId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Permission level</label>
                <select
                  className="input-field"
                  value={permissionType}
                  onChange={(e) => setPermissionType(e.target.value as PermissionType)}
                >
                  <option value="VIEW_RECORDS">View Records</option>
                  <option value="EDIT_RECORDS">Edit Records</option>
                  <option value="FULL_ACCESS">Full Access</option>
                </select>
              </div>
              <div>
                <label className="label">Expires at (optional)</label>
                <input
                  type="date"
                  className="input-field"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={granting}>
                {granting ? 'Granting…' : 'Grant access'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Current permissions */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-slate-900">Active permissions</h2>
        </div>

        {permissions.length === 0 ? (
          <div className="card-body text-center py-8">
            <p className="text-slate-500 text-sm">No permissions granted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {permissions.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 text-sm truncate">
                    {p.granteeName ?? `Doctor ${p.granteeId.slice(0, 8)}…`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono truncate">{p.granteeId}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="badge-blue text-xs">
                      {permissionTypeLabels[p.permissionType] ?? p.permissionType}
                    </span>
                    {p.expiresAt ? (
                      <span className="text-xs text-slate-500">
                        Expires {new Date(p.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No expiry</span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-danger flex-shrink-0 text-xs py-1.5 px-3"
                  onClick={() => handleRevoke(p.id)}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
