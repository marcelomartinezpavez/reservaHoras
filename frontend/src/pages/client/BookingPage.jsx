import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { Modal, Button, Form } from 'react-bootstrap'
import * as appointmentService from '../../services/appointmentService'
import { toast } from 'react-toastify'

export default function BookingPage() {
  const [available, setAvailable] = useState([])
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    appointmentService.getAvailable().then(setAvailable)
  }, [])

  const events = available.map(a => ({
    id: String(a.id),
    title: a.group
      ? `${a.title || 'Clase grupal'} · ${a.maxParticipants - a.currentParticipants} cupos`
      : (a.title || 'Hora disponible'),
    start: a.startTime,
    end: a.endTime,
    backgroundColor: '#198754',
    borderColor: '#198754',
    extendedProps: a
  }))

  const handleEventClick = ({ event }) => {
    setSelected(event.extendedProps)
    setNotes('')
    setShowModal(true)
  }

  const handleBook = async () => {
    setLoading(true)
    try {
      await appointmentService.book(selected.id, { notes })
      toast.success('¡Hora reservada correctamente!')
      setShowModal(false)
      navigate('/client')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reservar')
    } finally { setLoading(false) }
  }

  const fmt = (dt) => new Date(dt).toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })

  return (
    <div>
      <h4 className="fw-bold mb-2">Reservar Hora</h4>
      <p className="text-muted mb-4">Haz clic en una hora disponible para reservarla.</p>

      <div className="card p-3">
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="rounded px-2 py-1 text-white" style={{ background: '#198754', fontSize: 13 }}>
            Disponible
          </span>
          <span className="text-muted small">= Puedes reservar</span>
        </div>

        {available.length === 0 ? (
          <div className="text-center py-5">
            <div className="fs-1 mb-2">🗓️</div>
            <h5>No hay horas disponibles</h5>
            <p className="text-muted">Por favor contacta al administrador para más información.</p>
          </div>
        ) : (
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
            eventClick={handleEventClick}
            height="auto"
          />
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <div className="alert alert-success">
                {selected.title && <div className="fw-bold mb-1">{selected.title}</div>}
                <strong>📅 {fmt(selected.startTime)}</strong>
                <br />
                <small>Hasta: {fmt(selected.endTime)}</small>
              </div>
              {selected.group && (
                <div className="alert alert-info py-2">
                  <strong>Clase grupal</strong> · {selected.currentParticipants}/{selected.maxParticipants} inscritos
                  · <span className="text-success fw-semibold">{selected.maxParticipants - selected.currentParticipants} cupos disponibles</span>
                </div>
              )}
              <Form.Group>
                <Form.Label>Motivo de consulta (opcional)</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  placeholder="Describe brevemente el motivo de tu visita..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleBook} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Confirmar Reserva
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
