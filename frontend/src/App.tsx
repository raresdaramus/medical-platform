import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import type { Role } from './types';

import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookConsultationPage from './pages/patient/BookConsultationPage';
import PatientConsultationsPage from './pages/patient/PatientConsultationsPage';
import ConsultationDetailPage from './pages/patient/ConsultationDetailPage';
import MedicalRecordPage from './pages/patient/MedicalRecordPage';
import DataPermissionsPage from './pages/patient/DataPermissionsPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorConsultationsPage from './pages/doctor/DoctorConsultationsPage';
import ConsultationWorkspacePage from './pages/doctor/ConsultationWorkspacePage';
import ManageSchedulePage from './pages/doctor/ManageSchedulePage';

// ─── Private Route ────────────────────────────────────────────────────────────

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

// ─── Root redirect ────────────────────────────────────────────────────────────

function RootRedirect() {
  const { accessToken, role } = useAuthStore();

  if (!accessToken) return <Navigate to="/login" replace />;
  if (role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Patient routes */}
        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <BookConsultationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/consultations"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <PatientConsultationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/consultations/:id"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <ConsultationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/record"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <MedicalRecordPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/permissions"
          element={
            <PrivateRoute requiredRole="PATIENT">
              <DataPermissionsPage />
            </PrivateRoute>
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute requiredRole="DOCTOR">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/consultations"
          element={
            <PrivateRoute requiredRole="DOCTOR">
              <DoctorConsultationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/consultations/:id"
          element={
            <PrivateRoute requiredRole="DOCTOR">
              <ConsultationWorkspacePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <PrivateRoute requiredRole="DOCTOR">
              <ManageSchedulePage />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
