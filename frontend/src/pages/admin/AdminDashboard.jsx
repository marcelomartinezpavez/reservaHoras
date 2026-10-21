import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as appointmentService from '../../services/appointmentService'
import * as patientService from '../../services/patientService'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([appointmentService.getAll(), patientService.getAll()])
      .then(([appts, pts]) => { setAppointments(appts); setPatients(pts) })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: appointments.length,
    available: appointments.filter(a => a.status === 'AVAILABLE').length,
    reserved: appointments.filter(a => a.status === 'FULL' || a.status === 'RESERVED').length,
    used: appointments.filter(a => a.status === 'USED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  }

  const pending = appointments
    .filter(a => a.status === 'FULL' || a.status === 'RESERVED')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 8)

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" /></div>

  return (
    <div>
      <h4 className="fw-bold mb-4">Dashboard</h4>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Horas', value: stats.total, color: 'primary', icon: '📅', to: '/admin/calendar' },
          { label: 'Disponibles', value: stats.available, color: 'success', icon: '✅', to: '/admin/calendar' },
          { label: 'Reservadas', value: stats.reserved, color: 'info', icon: '🔵', to: '/admin/calendar' },
          { label: 'Atendidas', value: stats.used, color: 'secondary', icon: '✔️', to: '/admin/calendar' },
          { label: 'Total Clientes', value: patients.length, color: 'warning', icon: '👥', to: '/admin/patients' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-4 col-lg-2">
            <Link to={s.to} className="text-decoration-none">
              <div className={`card stat-card text-white bg-${s.color} p-3`}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <div className="fs-4">{s.icon}</div>
                <div className="fs-2 fw-bold">{s.value}</div>
                <div className="small">{s.label}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">Próximas Reservas</h6>
              <Link to="/admin/calendar" className="btn btn-sm btn-outline-primary">Ver Calendario</Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-muted text-center py-3">No hay reservas pendientes</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(a => (
                      <tr key={a.id}>
                        <td>{a.patientNombre} {a.patientApellido}</td>
                        <td>{new Date(a.startTime).toLocaleDateString('es-CL')}</td>
                        <td>{new Date(a.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">Últimos Clientes</h6>
              <Link to="/admin/patients" className="btn btn-sm btn-outline-primary">Ver todos</Link>
            </div>
            {patients.slice(0, 6).map(p => (
              <Link key={p.id} to={`/admin/patients/${p.id}`} className="text-decoration-none">
                <div className="d-flex align-items-center p-2 rounded hover-bg mb-1"
                  style={{ background: '#f8f9fa', marginBottom: 4 }}>
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                    style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                    {p.nombre[0]}{p.apellido[0]}
                  </div>
                  <div>
                    <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>
                      {p.nombre} {p.apellido}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{p.rut}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
