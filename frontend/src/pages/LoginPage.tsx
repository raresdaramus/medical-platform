import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as loginApi } from '../api/authApi';
import { getMyPatient, getMyDoctor } from '../api/userApi';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setTokens, setProfile } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi({ email, password });
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
        accountId: data.accountId,
      });

      // Restore profileId so dashboards can fetch data (may be null if profile not yet created)
      if (data.role === 'PATIENT') {
        try {
          const patient = await getMyPatient();
          setProfile(patient.id);
        } catch {
          // No patient profile yet — dashboard will prompt to create one
        }
        navigate('/patient/dashboard');
      } else {
        try {
          const doctor = await getMyDoctor();
          setProfile(doctor.id);
        } catch {
          // No doctor profile yet — dashboard will prompt to create one
        }
        navigate('/doctor/dashboard');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ??
          t('auth.invalidCredentials')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-slate-900">MediConnect</h1>
          <p className="text-slate-500 mt-1">{t('auth.signInSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="label" htmlFor="email">{t('auth.emailAddress')}</label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
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
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
