import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPatientMedicalRecord } from '../../api/consultationApi';
import type { MedicalRecordResponse } from '../../types';

const entryTypeLabels: Record<string, string> = {
  INTAKE: 'Patient Intake',
  DIAGNOSIS: 'Diagnosis',
  PRESCRIPTION: 'Prescription',
  REFERRAL: 'Referral',
};

const entryTypeBadge: Record<string, string> = {
  INTAKE: 'badge-yellow',
  DIAGNOSIS: 'badge-blue',
  PRESCRIPTION: 'badge-green',
  REFERRAL: 'badge-slate',
};

export default function MedicalRecordPage() {
  const { profileId } = useAuthStore();

  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) return;
    getPatientMedicalRecord(profileId)
      .then((data) => setRecords(data.sort((a, b) => b.addedAt.localeCompare(a.addedAt))))
      .catch(() => setError('Failed to load medical record.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Record</h1>
        <p className="text-slate-500 mt-1">Your complete medical history.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {records.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">Your medical record is empty.</p>
          <p className="text-slate-400 text-sm mt-1">Records will appear here after your consultations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="card">
              <div className="card-body flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Icon column */}
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-blue-600">
                      {record.entryType === 'INTAKE' && '📋'}
                      {record.entryType === 'DIAGNOSIS' && '🔬'}
                      {record.entryType === 'PRESCRIPTION' && '💊'}
                      {record.entryType === 'REFERRAL' && '📨'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={entryTypeBadge[record.entryType] ?? 'badge-slate'}>
                        {entryTypeLabels[record.entryType] ?? record.entryType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(record.addedAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {record.doctorName && (
                      <p className="text-sm text-slate-600 mt-1">Dr. {record.doctorName}</p>
                    )}

                    {record.summary && (
                      <p className="text-sm text-slate-700 mt-1">{record.summary}</p>
                    )}

                    {record.scheduledAt && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consultation:{' '}
                        {new Date(record.scheduledAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to={`/patient/consultations/${record.consultationId}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  View consultation →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
