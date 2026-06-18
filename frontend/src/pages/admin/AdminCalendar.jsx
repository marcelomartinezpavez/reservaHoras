import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Modal, Button, Form } from 'react-bootstrap'
import * as appointmentService from '../../services/appointmentService'
import * as patientService from '../../services/patientService'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'

const statusColors = {
  AVAILABLE: '#198754',
  RESERVED: '#0d6efd',
  USED: '#6c757d',
  CANCELLED: '#dc3545'
}

export default function AdminCalendar() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' })
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const [appts, pts] = await Promise.all([appointmentService.getAll(), patientService.getAll()])
    setAppointments(appts)
    setPatients(pts)
  }

  useEffect(() => { load() }, [])

  const events = appointments.map(a => ({
    id: String(a.id),
    title: a.patientNombre
      ? `${a.patientNombre} ${a.patientApellido}`
      : 'Disponible',
    start: a.startTime,
    end: a.endTime,
    backgroundColor: statusColors[a.status],
    borderColor: statusColors[a.status],
    extendedProps: a
  }))

  const handleEventClick = ({ event }) => {
    setSelected(event.extendedProps)
    setShowDetail(true)
  }

  const handleDateSelect = (info) => {
    setNewSlot({ startTime: info.startStr.slice(0, 16), endTime: info.endStr.slice(0, 16) })
    setShowCreate(true)
  }

  const handleCreateSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return
    setLoading(true)
    try {
      await appointmentService.createSlot(newSlot)
      toast.success('Hora creada correctamente')
      setShowCreate(false)
      load()
    } catch { toast.error('Error al crear hora') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status)
      toast.success('Estado actualizado')
      setShowDetail(false)
      load()
    } catch { toast.error('Error al actualizar') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta hora?')) return
    try {
      await appointmentService.remove(id)
      toast.success('Hora eliminada')
      setShowDetail(false)
      load()
    } catch { toast.error('Error al eliminar') }
  }

  const fmt = (dt) => new Date(dt).toLocaleString('es-CL', {
    dateStyle: 'medium', timeStyle: 'short'
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Calendario de Horas</h4>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Nueva Hora</Button>
      </div>

      <div className="card p-3">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="es"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          events={events}
          selectable
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* Modal crear hora */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>Nueva Hora Disponible</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Inicio</Form.Label>
            <Form.Control type="datetime-local" value={newSlot.startTime}
              onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Fin</Form.Label>
            <Form.Control type="datetime-local" value={newSlot.endTime}
              onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreateSlot} disabled={loading}>Crear Hora</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal detalle cita */}
      {selected && (
        <Modal show={showDetail} onHide={() => setShowDetail(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Detalle de Hora</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <StatusBadge status={selected.status} />
            </div>
            <p><strong>Inicio:</strong> {fmt(selected.startTime)}</p>
            <p><strong>Fin:</strong> {fmt(selected.endTime)}</p>
            {selected.patientNombre && (
              <>
                <p><strong>Paciente:</strong> {selected.patientNombre} {selected.patientApellido}</p>
                <p><strong>RUT:</strong> {selected.patientRut}</p>
              </>
            )}
            {selected.notes && <p><strong>Notas:</strong> {selected.notes}</p>}

            <hr />
            <p className="fw-semibold mb-2">Cambiar estado:</p>
            <div className="d-flex gap-2 flex-wrap">
              {selected.status !== 'AVAILABLE' && (
                <Button size="sm" variant="success"
                  onClick={() => handleStatusChange(selected.id, 'AVAILABLE')}>
                  Disponible
                </Button>
              )}
              {selected.status === 'RESERVED' && (
                <Button size="sm" variant="secondary"
                  onClick={() => handleStatusChange(selected.id, 'USED')}>
                  Marcar Atendida
                </Button>
              )}
              {['AVAILABLE', 'RESERVED'].includes(selected.status) && (
                <Button size="sm" variant="danger"
                  onClick={() => handleStatusChange(selected.id, 'CANCELLED')}>
                  Cancelar
                </Button>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(selected.id)}>
              Eliminar
            </Button>
            <Button variant="secondary" onClick={() => setShowDetail(false)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
