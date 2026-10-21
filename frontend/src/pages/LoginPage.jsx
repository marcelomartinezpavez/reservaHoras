import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/authService'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authService.login(form)
      login(data)
      navigate(data.role === 'ADMIN' ? '/admin' : '/client')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center p-3">
      <div className="card login-card p-4" style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>📅</div>
          <h4 className="fw-bold">AgendaApp</h4>
          <p className="text-muted mb-0">Sistema de Reservas</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email" className="form-control" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Contraseña</label>
            <input
              type="password" className="form-control" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Ingresar
          </button>
        </form>
        <hr />
        <p className="text-center text-muted mb-0">
          ¿Sin cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}
