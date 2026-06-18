import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="sidebar d-flex flex-column">
      <div className="px-3 py-3 mb-2">
        <div className="fw-bold fs-5">🦷 Clínica Dental</div>
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
            <NavLink to="/admin" end className={({isActive}) => `nav-link${isActive?' active':''}`}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/admin/calendar" className={({isActive}) => `nav-link${isActive?' active':''}`}>
              📅 Calendario
            </NavLink>
            <NavLink to="/admin/patients" className={({isActive}) => `nav-link${isActive?' active':''}`}>
              👥 Pacientes
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/client" end className={({isActive}) => `nav-link${isActive?' active':''}`}>
              🏠 Mis Horas
            </NavLink>
            <NavLink to="/client/book" className={({isActive}) => `nav-link${isActive?' active':''}`}>
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
