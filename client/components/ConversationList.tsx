import React, { useEffect, useState } from 'react'
import { fetchConversations } from '../services/conversationsService'
import type { Conversation } from '../services/types'

interface ConversationListProps {
  onSelect: (cid: string) => void
}

/**
 * Muestra la lista de conversaciones del usuario.
 * Carga los datos al montar el componente y permite seleccionar una conversación.
 * Separa la lógica de selección para mantener la UI desacoplada.
 */
const ConversationList: React.FC<ConversationListProps> = ({ onSelect }) => {
  // Estado local para almacenar las conversaciones obtenidas del backend
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Al montar, carga las conversaciones usando el servicio API
  useEffect(() => {
    fetchConversations().then(res => {
      if (res?.data) setConversations(res.data)
    })
  }, [])

  return (
    <ul className="conversation-list">
      {conversations.map(c => (
        <li key={c.id} onClick={() => onSelect(c.id)} className="conversation-item">
          {/* Avatar con iniciales para visualización rápida */}
          <div className="avatar">{c.title?.charAt(0) || '?'}</div>
          {/* Nombre de la conversación */}
          <span className="name">{c.title}</span>
          {/* Canal visualizado como badge */}
          <span className={`badge badge-${c.channel}`}>{c.channel}</span>
          {/* Contador de mensajes no leídos */}
          {c.unreadCount > 0 && <span className="unread">{c.unreadCount}</span>}
        </li>
      ))}
    </ul>
  )
}

export default ConversationList
