import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Button, Form } from 'react-bootstrap'
import * as patientService from '../../services/patientService'
import * as authService from '../../services/authService'
import { toast } from 'react-toastify'

const emptyCreate = { nombre: '', apellido: '', rut: '', numeroContacto: '', email: '', password: '' }
const emptyEdit = { nombre: '', apellido: '', rut: '', numeroContacto: '' }

export default function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyCreate)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await patientService.getAll()
    setPatients(data)
    setFiltered(data)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(patients.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      p.rut.toLowerCase().includes(q) ||
      p.numeroContacto.includes(q)
    ))
  }, [search, patients])

  const openCreate = () => { setEditing(null); setForm(emptyCreate); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ nombre: p.nombre, apellido: p.apellido, rut: p.rut, numeroContacto: p.numeroContacto })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await patientService.update(editing.id, form)
        toast.success('Cliente actualizado')
      } else {
        await authService.register(form)
        toast.success('Cliente creado con cuenta de acceso')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar cliente? Se eliminarán sus horas y fichas.')) return
    try {
      await patientService.remove(id)
      toast.success('Cliente eliminado')
      load()
    } catch { toast.error('Error al eliminar') }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Clientes</h4>
        <Button onClick={openCreate}>+ Nuevo Cliente</Button>
      </div>

      <div className="card p-3 mb-3">
        <input
          className="form-control"
          placeholder="Buscar por nombre, apellido, RUT o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">Sin resultados</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.nombre} {p.apellido}</td>
                  <td>{p.rut}</td>
                  <td>{p.numeroContacto}</td>
                  <td>{p.email || '-'}</td>
                  <td>
                    <Link to={`/admin/patients/${p.id}`} className="btn btn-sm btn-outline-primary me-1">
                      Ver información
                    </Link>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} id="patientForm">
            <div className="row g-3">
              <div className="col-6">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control required value={form.nombre} onChange={set('nombre')} />
              </div>
              <div className="col-6">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control required value={form.apellido} onChange={set('apellido')} />
              </div>
              <div className="col-6">
                <Form.Label>RUT *</Form.Label>
                <Form.Control required value={form.rut} onChange={set('rut')} placeholder="12345678-9" />
              </div>
              <div className="col-6">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control required value={form.numeroContacto} onChange={set('numeroContacto')} />
              </div>
              {!editing && (
                <>
                  <div className="col-12">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email" required
                      value={form.email}
                      onChange={set('email')}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="col-12">
                    <Form.Label>Contraseña *</Form.Label>
                    <Form.Control
                      type="password" required minLength={6}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button type="submit" form="patientForm" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            {editing ? 'Guardar' : 'Crear'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}