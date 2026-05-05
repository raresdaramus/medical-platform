import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatientMedicalRecord } from '../../api/consultationApi';
import type { MedicalRecordResponse, RecordEntryType } from '../../types';

const entryTypeBadge: Record<string, string> = {
  INTAKE: 'badge-yellow',
  DIAGNOSIS: 'badge-blue',
  PRESCRIPTION: 'badge-green',
  REFERRAL: 'badge-slate',
};

const entryTypeIcon: Record<string, string> = {
  INTAKE: '📋',
  DIAGNOSIS: '🔬',
  PRESCRIPTION: '💊',
  REFERRAL: '📨',
};

const ALL_ENTRY_TYPES: RecordEntryType[] = ['INTAKE', 'DIAGNOSIS', 'PRESCRIPTION', 'REFERRAL'];

export default function MedicalRecordPage() {
  const { accountId } = useAuthStore();
  const { t } = useTranslation();

  const entryTypeLabels: Record<string, string> = {
    INTAKE: t('medicalRecord.intake'),
    DIAGNOSIS: t('medicalRecord.diagnosis'),
    PRESCRIPTION: t('medicalRecord.prescription'),
    REFERRAL: t('medicalRecord.referral'),
  };

  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<RecordEntryType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!accountId) return;
    getPatientMedicalRecord(accountId)
      .then((data) => setRecords(data.sort((a, b) => b.addedAt.localeCompare(a.addedAt))))
      .catch(() => setError(t('medicalRecord.failedLoad')))
      .finally(() => setLoading(false));
  }, [accountId]);

  const filtered = records.filter((r) => {
    if (typeFilter !== 'ALL' && r.entryType !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSummary = r.summary?.toLowerCase().includes(q) ?? false;
      const matchDoctor = r.doctorName?.toLowerCase().includes(q) ?? false;
      if (!matchSummary && !matchDoctor) return false;
    }
    return true;
  });

  const hasActiveFilter = typeFilter !== 'ALL' || search.trim() !== '';

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('medicalRecord.title')}</h1>
        <p className="text-slate-500 mt-1">{t('medicalRecord.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Filters — only shown when there are records */}
      {records.length > 0 && (
        <div className="card card-body space-y-3">
          {/* Entry type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-16 shrink-0">{t('consultations.type')}:</span>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t('common.all')}
            </button>
            {ALL_ENTRY_TYPES.map((et) => (
              <button
                key={et}
                onClick={() => setTypeFilter(typeFilter === et ? 'ALL' : et)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  typeFilter === et
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span>{entryTypeIcon[et]}</span>
                {entryTypeLabels[et]}
              </button>
            ))}
          </div>

          {/* Text search */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-16 shrink-0">{t('common.search')}:</span>
            <input
              type="text"
              className="input-field py-1.5 text-sm flex-1 max-w-xs"
              placeholder={t('medicalRecord.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active filter summary */}
          {hasActiveFilter && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {filtered.length} {filtered.length === 1 ? t('medicalRecord.result') : t('medicalRecord.results')}
              </span>
              <button
                onClick={() => { setTypeFilter('ALL'); setSearch(''); }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          )}
        </div>
      )}

      {records.length === 0 ? (
        <div className="card card-body text-center py-12">
          <p className="text-slate-500">{t('medicalRecord.empty')}</p>
          <p className="text-slate-400 text-sm mt-1">{t('medicalRecord.emptySub')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card card-body text-center py-10">
          <p className="text-slate-500 text-sm">{t('medicalRecord.noMatch')}</p>
          <button
            className="text-blue-600 text-sm mt-2 hover:text-blue-700"
            onClick={() => { setTypeFilter('ALL'); setSearch(''); }}
          >
            {t('common.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <div key={record.id} className="card">
              <div className="card-body flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{entryTypeIcon[record.entryType]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={entryTypeBadge[record.entryType] ?? 'badge-slate'}>
                        {entryTypeLabels[record.entryType] ?? record.entryType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(record.addedAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {record.consultationStatus && (
                        <span className="text-xs text-slate-400">
                          · {t('status.' + record.consultationStatus)}
                        </span>
                      )}
                    </div>

                    {record.doctorName && (
                      <p className="text-sm text-slate-600 mt-1">Dr. {record.doctorName}</p>
                    )}

                    {record.summary && (
                      <p className="text-sm text-slate-700 mt-1 font-medium">{record.summary}</p>
                    )}

                    {record.scheduledAt && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('medicalRecord.consultationLabel')}{' '}
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
                  {t('medicalRecord.viewConsultation')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
