import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCalendar from './pages/admin/AdminCalendar'
import PatientManagement from './pages/admin/PatientManagement'
import PatientDetail from './pages/admin/PatientDetail'
import ClientDashboard from './pages/client/ClientDashboard'
import BookingPage from './pages/client/BookingPage'

function AppLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/client'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* ADMIN routes */}
          <Route path="/admin" element={
            <PrivateRoute role="ADMIN">
              <AppLayout><AdminDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/calendar" element={
            <PrivateRoute role="ADMIN">
              <AppLayout><AdminCalendar /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/patients" element={
            <PrivateRoute role="ADMIN">
              <AppLayout><PatientManagement /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/patients/:id" element={
            <PrivateRoute role="ADMIN">
              <AppLayout><PatientDetail /></AppLayout>
            </PrivateRoute>
          } />

          {/* CLIENT routes */}
          <Route path="/client" element={
            <PrivateRoute role="CLIENT">
              <AppLayout><ClientDashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/client/book" element={
            <PrivateRoute role="CLIENT">
              <AppLayout><BookingPage /></AppLayout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  )
}
