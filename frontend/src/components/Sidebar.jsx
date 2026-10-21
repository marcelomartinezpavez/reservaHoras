import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth()

  const handleNav = () => {
    if (window.innerWidth <= 768) onClose()
  }

  return (
    <div className={`sidebar d-flex flex-column${isOpen ? ' sidebar-open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">✕</button>

      <div className="px-3 py-3 mb-2">
        <div className="fw-bold fs-5">📅 AgendaApp</div>
        <small className="opacity-75">{user?.email}</small>
        <div>
          <span className={`badge ${isAdmin ? 'bg-warning text-dark' : 'bg-info'} mt-1`}>
            {isAdmin ? 'ADMIN' : 'CLIENTE'}
          </span>
        </div>
      </div>

      <nav className="nav flex-column flex-grow-1">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end onClick={handleNav}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/admin/calendar" onClick={handleNav}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              📅 Calendario
            </NavLink>
            <NavLink to="/admin/patients" onClick={handleNav}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              👥 Clientes
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/client" end onClick={handleNav}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              🏠 Mis Horas
            </NavLink>
            <NavLink to="/client/book" onClick={handleNav}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              📅 Reservar Hora
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-3">
        <button className="btn btn-outline-light btn-sm w-100" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
