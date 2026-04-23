import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register as registerApi, login as loginApi } from '../api/authApi';
import { createPatient, createDoctor } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import type { Role, Gender, BloodType } from '../types';

interface PatientFields {
  cnp: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  address: string;
  bloodType: BloodType;
}

interface DoctorFields {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  specialization: string;
  clinicName: string;
  phone: string;
}

const defaultPatient: PatientFields = {
  cnp: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'MALE',
  phone: '',
  address: '',
  bloodType: 'A_POSITIVE',
};

const defaultDoctor: DoctorFields = {
  licenseNumber: '',
  firstName: '',
  lastName: '',
  specialization: '',
  clinicName: '',
  phone: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTokens, setProfile } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PATIENT');
  const [gdprData, setGdprData] = useState(false);
  const [gdprDoctor, setGdprDoctor] = useState(false);
  const [patientFields, setPatientFields] = useState<PatientFields>(defaultPatient);
  const [doctorFields, setDoctorFields] = useState<DoctorFields>(defaultDoctor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updatePatient = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPatientFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateDoctor = (e: ChangeEvent<HTMLInputElement>) => {
    setDoctorFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gdprData || !gdprDoctor) {
      setError(t('auth.mustAcceptGdpr'));
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register account
      await registerApi({
        email,
        password,
        role,
        gdprConsents: [
          { consentType: 'DATA_PROCESSING', granted: true },
          { consentType: 'DOCTOR_ACCESS', granted: true },
        ],
      });

      // Step 2: Login to get tokens
      const loginData = await loginApi({ email, password });
      setTokens({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        role: loginData.role,
        accountId: loginData.accountId,
      });

      // Step 3: Create profile
      if (role === 'PATIENT') {
        const patient = await createPatient(patientFields);
        setProfile(patient.id);
        navigate('/patient/dashboard');
      } else {
        const doctor = await createDoctor(doctorFields);
        setProfile(doctor.id);
        navigate('/doctor/dashboard');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ??
          t('auth.registrationFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.createAccount')}</h1>
          <p className="text-slate-500 mt-1">{t('auth.joinToday')}</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Account fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{t('auth.account')}</h3>

                <div>
                  <label className="label" htmlFor="email">{t('auth.emailAddress')}</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="password">{t('auth.password')}</label>
                  <input
                    id="password"
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.passwordMinLength')}
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="role">{t('auth.iAm')}</label>
                  <select
                    id="role"
                    className="input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="PATIENT">{t('auth.patient')}</option>
                    <option value="DOCTOR">{t('auth.doctor')}</option>
                  </select>
                </div>
              </div>

              {/* Profile fields */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {role === 'PATIENT' ? t('auth.patientProfile') : t('auth.doctorProfile')}
                </h3>

                {role === 'PATIENT' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('auth.firstName')}</label>
                        <input
                          name="firstName"
                          type="text"
                          className="input-field"
                          value={patientFields.firstName}
                          onChange={updatePatient}
                          required
                          placeholder="Ion"
                        />
                      </div>
                      <div>
                        <label className="label">{t('auth.lastName')}</label>
                        <input
                          name="lastName"
                          type="text"
                          className="input-field"
                          value={patientFields.lastName}
                          onChange={updatePatient}
                          required
                          placeholder="Popescu"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">{t('auth.cnp')}</label>
                      <input
                        name="cnp"
                        type="text"
                        className="input-field"
                        value={patientFields.cnp}
                        onChange={updatePatient}
                        required
                        placeholder="1234567890123"
                        maxLength={13}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('auth.dateOfBirth')}</label>
                        <input
                          name="dateOfBirth"
                          type="date"
                          className="input-field"
                          value={patientFields.dateOfBirth}
                          onChange={updatePatient}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">{t('auth.gender')}</label>
                        <select
                          name="gender"
                          className="input-field"
                          value={patientFields.gender}
                          onChange={updatePatient}
                        >
                          <option value="MALE">{t('auth.male')}</option>
                          <option value="FEMALE">{t('auth.female')}</option>
                          <option value="OTHER">{t('auth.other')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('auth.phone')}</label>
                        <input
                          name="phone"
                          type="tel"
                          className="input-field"
                          value={patientFields.phone}
                          onChange={updatePatient}
                          required
                          placeholder="+40 712 345 678"
                        />
                      </div>
                      <div>
                        <label className="label">{t('auth.bloodType')}</label>
                        <select
                          name="bloodType"
                          className="input-field"
                          value={patientFields.bloodType}
                          onChange={updatePatient}
                        >
                          {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map((bt) => (
                            <option key={bt} value={bt}>
                              {bt.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">{t('auth.address')}</label>
                      <input
                        name="address"
                        type="text"
                        className="input-field"
                        value={patientFields.address}
                        onChange={updatePatient}
                        required
                        placeholder="Str. Exemplu nr. 1, București"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('auth.firstName')}</label>
                        <input
                          name="firstName"
                          type="text"
                          className="input-field"
                          value={doctorFields.firstName}
                          onChange={updateDoctor}
                          required
                          placeholder="Andrei"
                        />
                      </div>
                      <div>
                        <label className="label">{t('auth.lastName')}</label>
                        <input
                          name="lastName"
                          type="text"
                          className="input-field"
                          value={doctorFields.lastName}
                          onChange={updateDoctor}
                          required
                          placeholder="Ionescu"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">{t('auth.licenseNumber')}</label>
                      <input
                        name="licenseNumber"
                        type="text"
                        className="input-field"
                        value={doctorFields.licenseNumber}
                        onChange={updateDoctor}
                        required
                        placeholder="CMR-12345"
                      />
                    </div>

                    <div>
                      <label className="label">{t('auth.specialization')}</label>
                      <input
                        name="specialization"
                        type="text"
                        className="input-field"
                        value={doctorFields.specialization}
                        onChange={updateDoctor}
                        required
                        placeholder="Family Medicine"
                      />
                    </div>

                    <div>
                      <label className="label">{t('auth.clinicHospital')}</label>
                      <input
                        name="clinicName"
                        type="text"
                        className="input-field"
                        value={doctorFields.clinicName}
                        onChange={updateDoctor}
                        required
                        placeholder="Clinica Sănătatea"
                      />
                    </div>

                    <div>
                      <label className="label">{t('auth.phone')}</label>
                      <input
                        name="phone"
                        type="tel"
                        className="input-field"
                        value={doctorFields.phone}
                        onChange={updateDoctor}
                        required
                        placeholder="+40 712 345 678"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* GDPR */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{t('auth.gdprConsent')}</h3>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdprData}
                    onChange={(e) => setGdprData(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">{t('auth.gdprDataProcessing')}</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdprDoctor}
                    onChange={(e) => setGdprDoctor(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">{t('auth.gdprDoctorAccess')}</span>
                </label>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
