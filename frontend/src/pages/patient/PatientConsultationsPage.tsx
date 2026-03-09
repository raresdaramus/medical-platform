import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPatientMedicalRecord } from '../../api/consultationApi';
import type { MedicalRecordResponse, ConsultationStatus } from '../../types';

function statusBadge(status?: ConsultationStatus) {
  switch (status) {
    case 'PENDING':
      return <span className="badge-yellow">Pending</span>;
    case 'CONFIRMED':
      return <span className="badge-blue">Confirmed</span>;
    case 'IN_PROGRESS':
      return <span className="badge-green">In Progress</span>;
    case 'COMPLETED':
      return <span className="badge-slate">Completed</span>;
    case 'CANCELLED':
      return <span className="badge-red">Cancelled</span>;
    default:
      return <span className="badge-slate">Unknown</span>;
  }
}

function entryTypeBadge(type: MedicalRecordResponse['entryType']) {
  const colors: Record<string, string> = {
    INTAKE: 'badge-yellow',
    DIAGNOSIS: 'badge-blue',
    PRESCRIPTION: 'badge-green',
    REFERRAL: 'badge-slate',
  };
  return <span className={colors[type] ?? 'badge-slate'}>{type}</span>;
}

export default function PatientConsultationsPage() {
  const { profileId } = useAuthStore();
  const navigate = useNavigate();

  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) return;
    getPatientMedicalRecord(profileId)
      .then(setRecords)
      .catch(() => setError('Failed to load consultations.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  // Group records by consultationId to show one row per consultation
  const consultationMap = new Map<
    string,
    {
      consultationId: string;
      entries: MedicalRecordResponse[];
      latestAt: string;
      scheduledAt?: string;
      status?: ConsultationStatus;
      doctorName?: string;
    }
  >();

  for (const r of records) {
    if (!consultationMap.has(r.consultationId)) {
      consultationMap.set(r.consultationId, {
        consultationId: r.consultationId,
        entries: [],
        latestAt: r.addedAt,
        scheduledAt: r.scheduledAt,
        status: r.consultationStatus,
        doctorName: r.doctorName,
      });
    }
    const entry = consultationMap.get(r.consultationId)!;
    entry.entries.push(r);
    if (r.addedAt > entry.latestAt) entry.latestAt = r.addedAt;
    if (r.scheduledAt) entry.scheduledAt = r.scheduledAt;
    if (r.consultationStatus) entry.status = r.consultationStatus;
    if (r.doctorName) entry.doctorName = r.doctorName;
  }

  const consultations = Array.from(consultationMap.values()).sort((a, b) =>
    b.latestAt.localeCompare(a.latestAt)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading consultations…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Consultations</h1>
          <p className="text-slate-500 mt-1">View your consultation history and medical entries.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/patient/book')}
        >
          Book new
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {consultations.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">No consultations yet.</p>
          <button
            className="btn-primary mt-4"
            onClick={() => navigate('/patient/book')}
          >
            Book your first consultation
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-slate-500">Scheduled</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">Doctor</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">Entries</th>
                <th className="text-left px-6 py-3 font-medium text-slate-500">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultations.map((c) => (
                <tr
                  key={c.consultationId}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/patient/consultations/${c.consultationId}`)}
                >
                  <td className="px-6 py-4 text-slate-700">
                    {c.scheduledAt
                      ? new Date(c.scheduledAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : new Date(c.latestAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {c.doctorName ? `Dr. ${c.doctorName}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(c.entries.map((e) => e.entryType))].map((t) => (
                        <span key={t}>{entryTypeBadge(t)}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">{statusBadge(c.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 text-xs font-medium">View →</span>
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
