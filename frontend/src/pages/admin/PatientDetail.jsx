import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Modal, Button, Form, Tab, Tabs } from 'react-bootstrap'
import * as patientService from '../../services/patientService'
import * as appointmentService from '../../services/appointmentService'
import * as recordService from '../../services/attentionRecordService'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'

export default function PatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [recordForm, setRecordForm] = useState({
    fecha: '', diagnostico: '', tratamiento: '', observaciones: '', appointmentId: ''
  })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const [p, appts, recs] = await Promise.all([
      patientService.getById(id),
      appointmentService.getByPatient(id),
      recordService.getByPatient(id)
    ])
    setPatient(p)
    setAppointments(appts)
    setRecords(recs)
  }

  useEffect(() => { load() }, [id])

  const openCreateRecord = () => {
    setEditingRecord(null)
    setRecordForm({ fecha: new Date().toISOString().slice(0, 10), diagnostico: '', tratamiento: '', observaciones: '', appointmentId: '' })
    setShowRecordModal(true)
  }

  const openEditRecord = (r) => {
    setEditingRecord(r)
    setRecordForm({
      fecha: r.fecha,
      diagnostico: r.diagnostico || '',
      tratamiento: r.tratamiento || '',
      observaciones: r.observaciones || '',
      appointmentId: r.appointmentId || ''
    })
    setShowRecordModal(true)
  }

  const handleSaveRecord = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...recordForm,
        patientId: Number(id),
        appointmentId: recordForm.appointmentId ? Number(recordForm.appointmentId) : null
      }
      if (editingRecord) {
        await recordService.update(editingRecord.id, data)
        toast.success('Ficha actualizada')
      } else {
        await recordService.create(data)
        toast.success('Ficha creada')
      }
      setShowRecordModal(false)
      load()
    } catch { toast.error('Error al guardar ficha') }
    finally { setLoading(false) }
  }

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('¿Eliminar esta ficha?')) return
    try {
      await recordService.remove(recordId)
      toast.success('Ficha eliminada')
      load()
    } catch { toast.error('Error al eliminar') }
  }

  const handleMarkUsed = async (appointmentId) => {
    try {
      await appointmentService.updateStatus(appointmentId, 'USED')
      toast.success('Hora marcada como atendida')
      load()
    } catch { toast.error('Error') }
  }

  const set = (f) => (e) => setRecordForm({ ...recordForm, [f]: e.target.value })
  const fmt = (dt) => new Date(dt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })

  if (!patient) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" /></div>

  return (
    <div>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link to="/admin/patients" className="btn btn-outline-secondary btn-sm">← Volver</Link>
        <h4 className="fw-bold mb-0">{patient.nombre} {patient.apellido}</h4>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3">
            <h6 className="fw-bold mb-3">Datos del Paciente</h6>
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3 mx-auto"
              style={{ width: 64, height: 64, fontSize: 24 }}>
              {patient.nombre[0]}{patient.apellido[0]}
            </div>
            <p className="mb-1"><strong>Nombre:</strong> {patient.nombre} {patient.apellido}</p>
            <p className="mb-1"><strong>RUT:</strong> {patient.rut}</p>
            <p className="mb-1"><strong>Teléfono:</strong> {patient.numeroContacto}</p>
            <p className="mb-0"><strong>Email:</strong> {patient.email || 'Sin cuenta web'}</p>
          </div>
        </div>

        <div className="col-md-8">
          <Tabs defaultActiveKey="appointments" className="mb-3">
            <Tab eventKey="appointments" title={`Horas (${appointments.length})`}>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan={4} className="text-center text-muted py-3">Sin horas</td></tr>
                    ) : appointments.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).map(a => (
                      <tr key={a.id}>
                        <td>{new Date(a.startTime).toLocaleDateString('es-CL')}</td>
                        <td>{new Date(a.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td><StatusBadge status={a.status} /></td>
                        <td>
                          {a.status === 'RESERVED' && (
                            <button className="btn btn-xs btn-sm btn-outline-secondary"
                              onClick={() => handleMarkUsed(a.id)}>
                              Marcar Atendida
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab>

            <Tab eventKey="records" title={`Fichas (${records.length})`}>
              <div className="d-flex justify-content-end mb-2">
                <Button size="sm" onClick={openCreateRecord}>+ Nueva Ficha</Button>
              </div>
              {records.length === 0 ? (
                <p className="text-muted text-center py-3">Sin fichas de atención</p>
              ) : records.map(r => (
                <div key={r.id} className="card mb-2 p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{new Date(r.fecha).toLocaleDateString('es-CL')}</strong>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditRecord(r)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRecord(r.id)}>Eliminar</button>
                    </div>
                  </div>
                  {r.diagnostico && <p className="mb-1 mt-2"><strong>Diagnóstico:</strong> {r.diagnostico}</p>}
                  {r.tratamiento && <p className="mb-1"><strong>Tratamiento:</strong> {r.tratamiento}</p>}
                  {r.observaciones && <p className="mb-0"><strong>Observaciones:</strong> {r.observaciones}</p>}
                </div>
              ))}
            </Tab>
          </Tabs>
        </div>
      </div>

      <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRecord ? 'Editar Ficha' : 'Nueva Ficha de Atención'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveRecord} id="recordForm">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label>Fecha *</Form.Label>
                <Form.Control type="date" required value={recordForm.fecha} onChange={set('fecha')} />
              </div>
              <div className="col-md-6">
                <Form.Label>Hora asociada (opcional)</Form.Label>
                <Form.Select value={recordForm.appointmentId} onChange={set('appointmentId')}>
                  <option value="">-- Sin hora asociada --</option>
                  {appointments.filter(a => a.status === 'USED' || a.status === 'RESERVED').map(a => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.startTime).toLocaleString('es-CL')}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Label>Diagnóstico</Form.Label>
                <Form.Control as="textarea" rows={2} value={recordForm.diagnostico} onChange={set('diagnostico')} />
              </div>
              <div className="col-12">
                <Form.Label>Tratamiento</Form.Label>
                <Form.Control as="textarea" rows={2} value={recordForm.tratamiento} onChange={set('tratamiento')} />
              </div>
              <div className="col-12">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control as="textarea" rows={2} value={recordForm.observaciones} onChange={set('observaciones')} />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecordModal(false)}>Cancelar</Button>
          <Button type="submit" form="recordForm" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
