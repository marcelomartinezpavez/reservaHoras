const labels = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservada',
  FULL: 'Completo',
  USED: 'Atendida',
  CANCELLED: 'Cancelada'
}

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {labels[status] || status}
    </span>
  )
}
