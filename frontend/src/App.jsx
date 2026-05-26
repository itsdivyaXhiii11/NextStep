import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'

import StudentDashboard    from './pages/student/Dashboard'
import StudentNewRequest   from './pages/student/NewRequest'
import StudentMyRequests   from './pages/student/MyRequests'
import StudentProfile      from './pages/student/Profile'

import FacultyDashboard    from './pages/faculty/Dashboard'
import FacultyRequests     from './pages/faculty/Requests'
import FacultyProfile      from './pages/faculty/Profile'

import CoordDashboard  from './pages/coordinator/Dashboard'
import CoordReports    from './pages/coordinator/Reports'
import CoordUsers      from './pages/coordinator/Users'

import AdminDashboard  from './pages/admin/Dashboard'
import AdminUsers      from './pages/admin/Users'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  const map = { student: '/student', faculty: '/faculty', coordinator: '/coordinator', admin: '/admin' }
  return <Navigate to={map[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'DM Sans' } }} />
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Student */}
          <Route path="/student" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/new" element={<PrivateRoute roles={['student']}><StudentNewRequest /></PrivateRoute>} />
          <Route path="/student/requests" element={<PrivateRoute roles={['student']}><StudentMyRequests /></PrivateRoute>} />
          <Route path="/student/profile" element={<PrivateRoute roles={['student']}><StudentProfile /></PrivateRoute>} />

          {/* Faculty */}
          <Route path="/faculty" element={<PrivateRoute roles={['faculty']}><FacultyDashboard /></PrivateRoute>} />
          <Route path="/faculty/requests" element={<PrivateRoute roles={['faculty']}><FacultyRequests /></PrivateRoute>} />
          <Route path="/faculty/profile" element={<PrivateRoute roles={['faculty']}><FacultyProfile /></PrivateRoute>} />

          {/* Coordinator */}
          <Route path="/coordinator" element={<PrivateRoute roles={['coordinator']}><CoordDashboard /></PrivateRoute>} />
          <Route path="/coordinator/reports" element={<PrivateRoute roles={['coordinator']}><CoordReports /></PrivateRoute>} />
          <Route path="/coordinator/users" element={<PrivateRoute roles={['coordinator']}><CoordUsers /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
