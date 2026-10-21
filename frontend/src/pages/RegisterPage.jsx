import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as authService from '../services/authService'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', nombre: '', apellido: '', rut: '', numeroContacto: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.register(form)
      toast.success('Cuenta creada correctamente. Ya puedes iniciar sesión.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center p-3">
      <div className="card login-card p-4" style={{ width: '100%', maxWidth: 480 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2rem' }}>📅</div>
          <h4 className="fw-bold">Crear Cuenta</h4>
          <p className="text-muted mb-0">Regístrate para reservar horas</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Nombre</label>
              <input className="form-control" required value={form.nombre} onChange={set('nombre')} />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Apellido</label>
              <input className="form-control" required value={form.apellido} onChange={set('apellido')} />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">RUT</label>
              <input className="form-control" required value={form.rut} onChange={set('rut')} placeholder="12345678-9" />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Teléfono</label>
              <input className="form-control" required value={form.numeroContacto} onChange={set('numeroContacto')} placeholder="+56912345678" />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" required value={form.email} onChange={set('email')} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" required minLength={6} value={form.password} onChange={set('password')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Registrarse
          </button>
        </form>
        <hr />
        <p className="text-center text-muted mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
