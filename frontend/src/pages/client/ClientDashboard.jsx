import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as appointmentService from '../../services/appointmentService'
import * as patientService from '../../services/patientService'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'

export default function ClientDashboard() {
  const [appointments, setAppointments] = useState([])
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [appts, p] = await Promise.all([
        appointmentService.getMy(),
        patientService.getMyProfile()
      ])
      setAppointments(appts.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)))
      setPatient(p)
    } catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta hora?')) return
    try {
      await appointmentService.cancel(id)
      toast.success('Hora cancelada')
      load()
    } catch { toast.error('Error al cancelar') }
  }

  const fmt = (dt) => new Date(dt).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })

  const upcoming = appointments.filter(a => a.status === 'RESERVED')
  const past = appointments.filter(a => ['USED', 'CANCELLED'].includes(a.status))

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" /></div>

  return (
    <div>
      <h4 className="fw-bold mb-4">Mis Horas</h4>

      {patient && (
        <div className="card p-3 mb-4" style={{ background: 'linear-gradient(135deg, #1a3a6c, #0d6efd)', color: 'white', borderRadius: 12 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 56, height: 56, fontSize: 20 }}>
              {patient.nombre[0]}{patient.apellido[0]}
            </div>
            <div>
              <div className="fw-bold fs-5">{patient.nombre} {patient.apellido}</div>
              <div className="opacity-75">RUT: {patient.rut} · {patient.numeroContacto}</div>
            </div>
            <Link to="/client/book" className="btn btn-light ms-auto">
              📅 Reservar Hora
            </Link>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card p-3 text-center stat-card">
            <div className="fs-2 fw-bold text-primary">{upcoming.length}</div>
            <div className="text-muted small">Próximas</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card p-3 text-center stat-card">
            <div className="fs-2 fw-bold text-secondary">{appointments.filter(a => a.status === 'USED').length}</div>
            <div className="text-muted small">Atendidas</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card p-3 text-center stat-card">
            <div className="fs-2 fw-bold text-danger">{appointments.filter(a => a.status === 'CANCELLED').length}</div>
            <div className="text-muted small">Canceladas</div>
          </div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="card p-3 mb-3">
          <h6 className="fw-bold mb-3">Próximas Reservas</h6>
          {upcoming.map(a => (
            <div key={a.id} className="d-flex align-items-center justify-content-between p-3 rounded mb-2"
              style={{ background: '#e8f0fe', borderLeft: '4px solid #0d6efd' }}>
              <div>
                <div className="fw-semibold">{fmt(a.startTime)}</div>
                {a.notes && <div className="text-muted small">{a.notes}</div>}
              </div>
              <div className="d-flex align-items-center gap-2">
                <StatusBadge status={a.status} />
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => handleCancel(a.id)}>
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="card p-3">
          <h6 className="fw-bold mb-3">Historial</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr><th>Fecha</th><th>Hora</th><th>Estado</th><th>Notas</th></tr>
              </thead>
              <tbody>
                {past.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.startTime).toLocaleDateString('es-CL')}</td>
                    <td>{new Date(a.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="card p-5 text-center">
          <div className="fs-1 mb-2">📅</div>
          <h5>No tienes horas reservadas</h5>
          <p className="text-muted">Reserva tu primera hora haciendo clic en el botón de arriba</p>
          <Link to="/client/book" className="btn btn-primary mx-auto" style={{ maxWidth: 200 }}>
            Reservar Hora
          </Link>
        </div>
      )}
    </div>
  )
}
