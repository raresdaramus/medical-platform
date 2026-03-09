import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logout as logoutApi } from '../api/authApi';

const patientLinks = [
  { to: '/patient/dashboard', label: 'Dashboard' },
  { to: '/patient/consultations', label: 'My Consultations' },
  { to: '/patient/record', label: 'Medical Record' },
  { to: '/patient/permissions', label: 'Data Permissions' },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard' },
  { to: '/doctor/consultations', label: 'Consultations' },
  { to: '/doctor/schedule', label: 'My Schedule' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

  const links = role === 'PATIENT' ? patientLinks : role === 'DOCTOR' ? doctorLinks : [];

  const handleSignOut = async () => {
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // ignore error, log out anyway
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-slate-900">MediConnect</span>
              </NavLink>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1">
                {links.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {role && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {links.length > 0 && (
          <div className="md:hidden border-t border-slate-100 px-4 py-2 flex gap-1 overflow-x-auto">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
