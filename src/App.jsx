import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Loader from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// ── Public Pages (lazy-loaded for code splitting) ──────────────────────────
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));

// ── Admin Pages ────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Sessions       = lazy(() => import('./pages/admin/Sessions'));
const Subjects       = lazy(() => import('./pages/admin/Subjects'));
const Teachers       = lazy(() => import('./pages/admin/Teachers'));
const Students       = lazy(() => import('./pages/admin/Students'));
const Timetables     = lazy(() => import('./pages/admin/Timetables'));
const Notices        = lazy(() => import('./pages/admin/Notices'));
const AdminComplaints= lazy(() => import('./pages/admin/Complaints'));
const PreRegistrations = lazy(() => import('./pages/admin/PreRegistrations'));
const ContactMessages  = lazy(() => import('./pages/admin/ContactMessages'));

// ── Teacher Pages ──────────────────────────────────────────────────────────
const TeacherDashboard  = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherSubjects   = lazy(() => import('./pages/teacher/Subjects'));
const TeacherMarks      = lazy(() => import('./pages/teacher/Marks'));
const TeacherAttendance = lazy(() => import('./pages/teacher/Attendance'));
const TeacherAssignments= lazy(() => import('./pages/teacher/Assignments'));
const TeacherComplaints = lazy(() => import('./pages/teacher/Complaints'));
const TeacherProfile    = lazy(() => import('./pages/teacher/Profile'));

// ── Student Pages ──────────────────────────────────────────────────────────
const StudentDashboard  = lazy(() => import('./pages/student/StudentDashboard'));
const StudentMarks      = lazy(() => import('./pages/student/Marks'));
const StudentAttendance = lazy(() => import('./pages/student/Attendance'));
const StudentTimetable  = lazy(() => import('./pages/student/Timetable'));
const StudentAssignments= lazy(() => import('./pages/student/Assignments'));
const StudentNotices    = lazy(() => import('./pages/student/Notices'));
const StudentComplaints = lazy(() => import('./pages/student/Complaints'));
const StudentProfile    = lazy(() => import('./pages/student/Profile'));

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader fullPage={true} />}>
          <Routes>

            {/* ── Public routes ─────────────────────────────────────────── */}
            <Route path="/"                      element={<LandingPage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/register"              element={<RegisterPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* ── Admin Protected Routes ────────────────────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sessions"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Sessions />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Subjects />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Teachers />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Students />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pre-registrations"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <PreRegistrations />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/timetable"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Timetables />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin/notices"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Notices />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <ContactMessages />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <AdminComplaints />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* ── Teacher Protected Routes ──────────────────────────────── */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/subjects"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherSubjects />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherMarks />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherAttendance />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherAssignments />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/complaints"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherComplaints />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['teacher']}>
                    <TeacherProfile />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* ── Student Protected Routes ──────────────────────────────── */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/marks"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentMarks />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentAttendance />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentTimetable />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentAssignments />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notices"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentNotices />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentComplaints />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['student']}>
                    <StudentProfile />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* ── 404 fallback ─────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>

        {/* ── Global Toast Notifications ──────────────────────────────── */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F172A',
              color: '#F8FAFC',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#0F172A' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#0F172A' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
