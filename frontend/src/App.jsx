import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'
import VerifyCertificate from './VerifyCertificate'

function Dashboard() {
  const token = localStorage.getItem('access_token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token) return <Navigate to="/login" replace />

  if (user.role === 'ADMIN') return <Navigate to="/admin/students" replace />
  if (user.role === 'TEACHER') return <Navigate to="/teacher/courses" replace />
  return <Navigate to="/student" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

        {/* Role-based redirects */}
        <Route path="/" element={<Dashboard />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/students" replace />} />
        <Route path="/admin/:section" element={<AdminDashboard />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<Navigate to="/teacher/courses" replace />} />
        <Route path="/teacher/:section" element={<TeacherDashboard />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
