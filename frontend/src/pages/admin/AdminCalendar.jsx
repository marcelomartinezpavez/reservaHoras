import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { Modal, Button, Form, Badge } from 'react-bootstrap'
import * as appointmentService from '../../services/appointmentService'
import * as patientService from '../../services/patientService'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'

const statusColors = {
  AVAILABLE: '#198754',
  RESERVED: '#0d6efd',
  FULL: '#6f42c1',
  USED: '#6c757d',
  CANCELLED: '#dc3545'
}

const EMPTY_SLOT = { startTime: '', endTime: '', title: '', type: 'individual', maxParticipants: 2 }
const EMPTY_BOOK = { type: 'patient', patientId: '', guestName: '', notes: '' }

export default function AdminCalendar() {
  const [appointments, setAppointments] = useState([])
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showBook, setShowBook] = useState(false)
  const [newSlot, setNewSlot] = useState(EMPTY_SLOT)
  const [bookForm, setBookForm] = useState(EMPTY_BOOK)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const appts = await appointmentService.getAll()
    setAppointments(appts)
  }

  useEffect(() => { load() }, [])

  const events = appointments.map(a => ({
    id: String(a.id),
    title: a.group
      ? `${a.title || 'Grupo'} (${a.currentParticipants}/${a.maxParticipants})`
      : (a.patientNombre ? `${a.patientNombre} ${a.patientApellido || ''}`.trim() : (a.title || 'Disponible')),
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
    setNewSlot({ ...EMPTY_SLOT, startTime: info.startStr.slice(0, 16), endTime: info.endStr.slice(0, 16) })
    setShowCreate(true)
  }

  const handleCreateSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return
    setLoading(true)
    try {
      await appointmentService.createSlot({
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        maxParticipants: newSlot.type === 'group' ? Number(newSlot.maxParticipants) : 1,
        title: newSlot.title || null
      })
      toast.success('Hora creada correctamente')
      setShowCreate(false)
      load()
    } catch { toast.error('Error al crear hora') }
    finally { setLoading(false) }
  }

  const openBookModal = async () => {
    setBookForm(EMPTY_BOOK)
    if (patients.length === 0) {
      const pts = await patientService.getAll()
      setPatients(pts)
    }
    setShowBook(true)
  }

  const handleSubmitBook = async () => {
    if (bookForm.type === 'patient' && !bookForm.patientId) {
      toast.warning('Selecciona un cliente')
      return
    }
    if (bookForm.type === 'guest' && !bookForm.guestName.trim()) {
      toast.warning('Ingresa el nombre del invitado')
      return
    }
    setLoading(true)
    try {
      const body = { notes: bookForm.notes || null }
      if (bookForm.type === 'patient') {
        body.patientId = Number(bookForm.patientId)
      } else {
        body.guestName = bookForm.guestName.trim()
      }
      const updated = await appointmentService.book(selected.id, body)
      toast.success('Hora reservada')
      setShowBook(false)
      setSelected(updated)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reservar')
    } finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status)
      toast.success('Estado actualizado')
      setShowDetail(false)
      load()
    } catch { toast.error('Error al actualizar') }
  }

  const handleRemoveParticipant = async (appointmentId, participantId) => {
    if (!confirm('¿Eliminar este participante?')) return
    try {
      const updated = await appointmentService.removeParticipantEntry(appointmentId, participantId)
      toast.success('Participante eliminado')
      setSelected(updated)
      load()
    } catch { toast.error('Error al eliminar participante') }
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

  const fmt = (dt) => new Date(dt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
  const set = (f) => (e) => setNewSlot(prev => ({ ...prev, [f]: e.target.value }))
  const setBook = (f) => (e) => setBookForm(prev => ({ ...prev, [f]: e.target.value }))

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Calendario de Horas</h4>
        <Button size="sm" onClick={() => { setNewSlot(EMPTY_SLOT); setShowCreate(true) }}>+ Nueva Hora</Button>
      </div>

      <div className="card p-3">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: window.innerWidth < 768 ? 'timeGridDay,timeGridWeek' : 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={esLocale}
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
        <Modal.Header closeButton><Modal.Title>Nueva Hora</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Título (opcional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Consulta, Clase de yoga..."
              value={newSlot.title}
              onChange={set('title')}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Inicio</Form.Label>
            <Form.Control type="datetime-local" value={newSlot.startTime} onChange={set('startTime')} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fin</Form.Label>
            <Form.Control type="datetime-local" value={newSlot.endTime} onChange={set('endTime')} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de hora</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio" id="type-individual" name="type" label="Individual (1 persona)"
                checked={newSlot.type === 'individual'}
                onChange={() => setNewSlot(prev => ({ ...prev, type: 'individual' }))}
              />
              <Form.Check
                type="radio" id="type-group" name="type" label="Grupal (clase)"
                checked={newSlot.type === 'group'}
                onChange={() => setNewSlot(prev => ({ ...prev, type: 'group' }))}
              />
            </div>
          </Form.Group>
          {newSlot.type === 'group' && (
            <Form.Group>
              <Form.Label>Máximo de participantes</Form.Label>
              <Form.Control
                type="number" min={2} max={100}
                value={newSlot.maxParticipants}
                onChange={set('maxParticipants')}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreateSlot} disabled={loading}>Crear Hora</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal detalle */}
      {selected && (
        <Modal show={showDetail} onHide={() => setShowDetail(false)} size={selected.group ? 'lg' : undefined}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selected.title || (selected.group ? 'Clase Grupal' : 'Detalle de Hora')}
              {selected.group && (
                <Badge bg="purple" className="ms-2" style={{ background: '#6f42c1' }}>
                  Grupal {selected.currentParticipants}/{selected.maxParticipants}
                </Badge>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <StatusBadge status={selected.status} />
            </div>
            <p><strong>Inicio:</strong> {fmt(selected.startTime)}</p>
            <p><strong>Fin:</strong> {fmt(selected.endTime)}</p>

            {/* Participante individual */}
            {!selected.group && selected.patientNombre && (
              <>
                <p><strong>Cliente:</strong> {selected.patientNombre} {selected.patientApellido || ''}</p>
                {selected.patientRut && <p><strong>RUT:</strong> {selected.patientRut}</p>}
                {selected.notes && <p><strong>Notas:</strong> {selected.notes}</p>}
              </>
            )}

            {/* Lista de participantes para grupos */}
            {selected.group && (
              <div className="mt-3">
                <p className="fw-semibold mb-2">
                  Participantes ({selected.currentParticipants}/{selected.maxParticipants})
                  {selected.maxParticipants - selected.currentParticipants > 0 && (
                    <span className="text-success ms-2" style={{ fontSize: '0.85rem' }}>
                      · {selected.maxParticipants - selected.currentParticipants} cupos disponibles
                    </span>
                  )}
                </p>
                {selected.participants && selected.participants.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {selected.participants.map(p => (
                      <div key={p.participantId}
                        className="list-group-item d-flex align-items-center justify-content-between px-0 py-2">
                        <div>
                          <div className="fw-semibold">
                            {p.patientNombre} {p.patientApellido || ''}
                            {p.guest && <Badge bg="secondary" className="ms-1" style={{ fontSize: '0.7rem' }}>Invitado</Badge>}
                          </div>
                          <small className="text-muted">
                            {!p.guest && p.patientRut ? `RUT: ${p.patientRut}` : ''}
                            {p.notes ? ` · ${p.notes}` : ''}
                          </small>
                        </div>
                        <Button size="sm" variant="outline-danger"
                          onClick={() => handleRemoveParticipant(selected.id, p.participantId)}>
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small">Sin participantes aún</p>
                )}
              </div>
            )}

            <hr />

            {/* Botón reservar (solo si hay cupo) */}
            {selected.status === 'AVAILABLE' && (
              <div className="mb-3">
                <Button variant="primary" size="sm" onClick={openBookModal}>
                  + Reservar para cliente
                </Button>
              </div>
            )}

            <p className="fw-semibold mb-2">Cambiar estado:</p>
            <div className="d-flex gap-2 flex-wrap">
              {selected.status !== 'AVAILABLE' && selected.status !== 'CANCELLED' && (
                <Button size="sm" variant="success"
                  onClick={() => handleStatusChange(selected.id, 'AVAILABLE')}>
                  Disponible
                </Button>
              )}
              {(selected.status === 'FULL' || selected.status === 'RESERVED') && (
                <Button size="sm" variant="secondary"
                  onClick={() => handleStatusChange(selected.id, 'USED')}>
                  Marcar Atendida
                </Button>
              )}
              {['AVAILABLE', 'FULL', 'RESERVED'].includes(selected.status) && (
                <Button size="sm" variant="danger"
                  onClick={() => handleStatusChange(selected.id, 'CANCELLED')}>
                  Cancelar Hora
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

      {/* Modal reservar como admin */}
      <Modal show={showBook} onHide={() => setShowBook(false)}>
        <Modal.Header closeButton><Modal.Title>Reservar Hora</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de cliente</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio" id="book-registered" name="bookType" label="Cliente registrado"
                checked={bookForm.type === 'patient'}
                onChange={() => setBookForm(f => ({ ...f, type: 'patient', guestName: '' }))}
              />
              <Form.Check
                type="radio" id="book-guest" name="bookType" label="Invitado (sin cuenta)"
                checked={bookForm.type === 'guest'}
                onChange={() => setBookForm(f => ({ ...f, type: 'guest', patientId: '' }))}
              />
            </div>
          </Form.Group>

          {bookForm.type === 'patient' ? (
            <Form.Group className="mb-3">
              <Form.Label>Cliente *</Form.Label>
              <Form.Select value={bookForm.patientId} onChange={setBook('patientId')}>
                <option value="">-- Seleccionar cliente --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} · {p.rut}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Nombre del invitado *</Form.Label>
              <Form.Control
                value={bookForm.guestName}
                onChange={setBook('guestName')}
                placeholder="Nombre y apellido"
              />
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>Notas (opcional)</Form.Label>
            <Form.Control as="textarea" rows={2}
              value={bookForm.notes}
              onChange={setBook('notes')}
              placeholder="Observaciones adicionales..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBook(false)}>Cancelar</Button>
          <Button onClick={handleSubmitBook} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Confirmar Reserva
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}