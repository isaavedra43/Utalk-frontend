import React from 'react'
import type { ClientInfo } from '../services/types'

interface ClientInfoPanelProps {
  client: ClientInfo
}

/**
 * Panel de información del cliente asociado a la conversación.
 * Mantener este panel separado permite desacoplar la UI de la lógica de negocio,
 * facilitando la reutilización y el testeo independiente.
 */
export function ClientInfoPanel(client: ClientInfo) {
  if (!client) return null
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="client-info-panel">
      {/* Avatar con iniciales */}
      <div className="avatar">{initials}</div>
      <h2>{client.name}</h2>
      <p>{client.company}</p>
      {/* Badge de estado */}
      <span className={`status status-${client.status}`}>{client.status}</span>
      <div className="info-row">
        <span role="img" aria-label="Teléfono">📞</span> {client.phone}
                      </div>
      <div className="info-row">
        <span role="img" aria-label="Email">✉️</span> {client.email}
                        </div>
      <div className="info-row">
        <span role="img" aria-label="Cliente desde">🕒</span> {client.since}
      </div>
    </div>
  )
}
