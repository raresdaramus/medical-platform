import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { getPatient } from '../../api/userApi';
import { getDoctorPatientConsultations, getPatientMedicalRecord, getPatientDocuments, openDocument } from '../../api/consultationApi';
import type { PatientResponse, ConsultationResponse, ConsultationStatus, MedicalRecordResponse, RecordEntryType, DocumentResponse } from '../../types';

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

export default function DoctorPatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { profileId } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tab, setTab] = useState<'consultations' | 'record' | 'documents'>('consultations');
  const [typeFilter, setTypeFilter] = useState<RecordEntryType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const entryTypeLabels: Record<string, string> = {
    INTAKE: t('medicalRecord.intake'),
    DIAGNOSIS: t('medicalRecord.diagnosis'),
    PRESCRIPTION: t('medicalRecord.prescription'),
    REFERRAL: t('medicalRecord.referral'),
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  useEffect(() => {
    if (!patientId || !profileId) return;
    setLoading(true);
    getPatient(patientId)
      .then((p) => {
        setPatient(p);
        // The record and documents are keyed by the patient's accountId (same source the patient sees).
        return Promise.allSettled([
          getDoctorPatientConsultations(profileId, patientId),
          getPatientMedicalRecord(p.accountId),
          getPatientDocuments(p.accountId),
        ]);
      })
      .then(([c, r, d]) => {
        if (c.status === 'fulfilled') {
          setConsultations(c.value.sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? '')));
        }
        if (r.status === 'fulfilled') {
          setRecords(r.value.slice().sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '')));
        }
        if (d.status === 'fulfilled') {
          setDocuments(d.value.slice().sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? '')));
        }
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

  const filteredRecords = records.filter((r) => {
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'consultations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('consultations')}
        >
          {t('patients.consultationHistory')}
          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {consultations.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'record'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('record')}
        >
          {t('patients.medicalRecord')}
          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {records.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'documents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('documents')}
        >
          {t('workspace.documents.title')}
          <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
            {documents.length}
          </span>
        </button>
      </div>

      {/* Consultations tab */}
      {tab === 'consultations' && (
        consultations.length === 0 ? (
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
        )
      )}

      {/* Medical record tab — same view and filters the patient has */}
      {tab === 'record' && (
        <div className="space-y-5">
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
                    {filteredRecords.length} {filteredRecords.length === 1 ? t('medicalRecord.result') : t('medicalRecord.results')}
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
            <div className="card card-body text-center py-10">
              <p className="text-slate-500">{t('patients.noMedicalRecord')}</p>
            </div>
          ) : filteredRecords.length === 0 ? (
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
              {filteredRecords.map((record) => (
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
                            {new Date(record.addedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          {record.consultationStatus && (
                            <span className="text-xs text-slate-400">· {t('status.' + record.consultationStatus)}</span>
                          )}
                        </div>
                        {record.doctorName && (
                          <p className="text-sm text-slate-600 mt-1">Dr. {record.doctorName}</p>
                        )}
                        {record.summary && (
                          <p className="text-sm text-slate-700 mt-1 font-medium">{record.summary}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/doctor/consultations/${record.consultationId}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex-shrink-0"
                    >
                      {t('medicalRecord.viewConsultation')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents tab — all PDFs across the patient's consultations */}
      {tab === 'documents' && (
        documents.length === 0 ? (
          <div className="card card-body text-center py-10">
            <p className="text-slate-500">{t('workspace.documents.noDocuments')}</p>
          </div>
        ) : (
          <div className="card">
            <ul className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(doc.fileSize)} · {t('workspace.documents.uploadedBy')}{' '}
                      {doc.uploaderRole === 'DOCTOR' ? t('workspace.documents.doctor') : t('workspace.documents.patient')}
                      {' · '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="btn-secondary text-xs shrink-0"
                    onClick={() => openDocument(doc.id)}
                  >
                    {t('workspace.documents.download')}
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/consultations/${doc.consultationId}`)}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium shrink-0"
                  >
                    {t('medicalRecord.viewConsultation')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
