import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { HomePage } from '../pages/public/HomePage';
import { DoctorsPage } from '../pages/public/DoctorsPage';
import { DoctorDetailPage } from '../pages/public/DoctorDetailPage';
import { DepartmentsPage } from '../pages/public/DepartmentsPage';
import { HospitalsPage } from '../pages/public/HospitalsPage';
import { BookPage } from '../pages/public/BookPage';
import { HospitalDetailPage } from '../pages/public/HospitalDetailPage';
import { AboutPage } from '../pages/public/AboutPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Patient pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { MyAppointmentsPage } from '../pages/patient/MyAppointmentsPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';
import { NotificationsPage } from '../pages/patient/NotificationsPage';

// Doctor pages
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from '../pages/doctor/DoctorAppointmentsPage';
import { DoctorSchedulePage } from '../pages/doctor/DoctorSchedulePage';

// Admin pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DoctorManagementPage } from '../pages/admin/DoctorManagementPage';
import { DepartmentManagementPage } from '../pages/admin/DepartmentManagementPage';
import { HospitalManagementPage } from '../pages/admin/HospitalManagementPage';
import { AppointmentAuditPage } from '../pages/admin/AppointmentAuditPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { AuditLogViewerPage } from '../pages/admin/AuditLogViewerPage';

// Receptionist pages
import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { PatientSearchPage } from '../pages/receptionist/PatientSearchPage';
import { DailySchedulePage } from '../pages/receptionist/DailySchedulePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/hospitals" element={<HospitalsPage />} />
      <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
      <Route path="/departments" element={<DepartmentsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Patient Pages */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Global Notifications Page */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Pages */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorSchedulePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hospitals"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <HospitalManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DoctorManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DepartmentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppointmentAuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogViewerPage />
          </ProtectedRoute>
        }
      />

      {/* Receptionist Pages */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
            <PatientSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/daily-schedule"
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
            <DailySchedulePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
