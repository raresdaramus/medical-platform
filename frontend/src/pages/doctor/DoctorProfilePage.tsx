import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyDoctor, updateMyDoctorProfile } from '../../api/userApi';
import type { ProviderType, UpdateDoctorProfileRequest } from '../../types';

export default function DoctorProfilePage() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Read-only identity (shown for context, not editable here).
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');

  // Editable clinic / CNAS fields.
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [cui, setCui] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [cas, setCas] = useState('');
  const [cnasContractNumber, setCnasContractNumber] = useState('');
  const [providerType, setProviderType] = useState<ProviderType | ''>('');

  useEffect(() => {
    getMyDoctor()
      .then((d) => {
        setFullName(`${d.firstName} ${d.lastName}`);
        setLicenseNumber(d.licenseNumber ?? '');
        setSpecialization(d.specialization ?? '');
        setClinicName(d.clinicName ?? '');
        setPhone(d.phone ?? '');
        setCui(d.cui ?? '');
        setClinicAddress(d.clinicAddress ?? '');
        setCas(d.cas ?? '');
        setCnasContractNumber(d.cnasContractNumber ?? '');
        setProviderType(d.providerType ?? '');
      })
      .catch(() => setError(t('profile.failedLoad')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    const payload: UpdateDoctorProfileRequest = {
      clinicName,
      phone,
      cui: cui || null,
      clinicAddress: clinicAddress || null,
      cas: cas || null,
      cnasContractNumber: cnasContractNumber || null,
      providerType: providerType || null,
    };
    try {
      await updateMyDoctorProfile(payload);
      setSuccessMsg(t('profile.saved'));
    } catch {
      setError(t('profile.failedSave'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('profile.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('profile.subtitle')}</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}

      <div className="card">
        <div className="card-header"><h3 className="font-semibold text-slate-900">{t('profile.identity')}</h3></div>
        <div className="card-body grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">{t('profile.name')}:</span> <span className="font-medium">{fullName}</span></div>
          <div><span className="text-slate-500">{t('profile.license')}:</span> <span className="font-medium">{licenseNumber}</span></div>
          <div><span className="text-slate-500">{t('profile.specialization')}:</span> <span className="font-medium">{specialization}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header"><h3 className="font-semibold text-slate-900">{t('profile.clinicData')}</h3></div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.clinicName')}</label>
              <input className="input-field" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile.phone')}</label>
              <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.cui')}</label>
              <input className="input-field" value={cui} onChange={(e) => setCui(e.target.value)} placeholder="RO12345678" />
            </div>
            <div>
              <label className="label">{t('profile.providerType')}</label>
              <select className="input-field" value={providerType} onChange={(e) => setProviderType(e.target.value as ProviderType | '')}>
                <option value="">{t('profile.selectProviderType')}</option>
                <option value="MF">{t('profile.providerMf')}</option>
                <option value="AMB_SPEC">{t('profile.providerAmbSpec')}</option>
                <option value="OTHER">{t('profile.providerOther')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t('profile.clinicAddress')}</label>
            <input className="input-field" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('profile.cas')}</label>
              <input className="input-field" value={cas} onChange={(e) => setCas(e.target.value)} placeholder="CAS Cluj" />
            </div>
            <div>
              <label className="label">{t('profile.cnasContractNumber')}</label>
              <input className="input-field" value={cnasContractNumber} onChange={(e) => setCnasContractNumber(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '…' : t('profile.save')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
