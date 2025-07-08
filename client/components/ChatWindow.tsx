/**
 * ChatWindow
 * Este componente se suscribe en tiempo real a la colección de mensajes de Firestore usando onSnapshot
 * para reflejar automáticamente cualquier cambio, ya sea desde la UI o desde Twilio.
 */
import React, { useEffect, useState, useRef } from 'react'
import { db } from '../lib/firebaseAdmin' // Ajusta la ruta si tu inicialización cliente está en otro archivo
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { sendMessage } from '../services/messagesService'
import type { Message } from '../services/types'

interface ChatWindowProps {
  cid: string
  currentUserId: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ cid, currentUserId }) => {
  // Estado para los mensajes, el texto del input y el indicador de carga
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // a) Mostrar indicador de carga inicial
    setLoading(true)
    // b) Definir la query ordenada cronológicamente
    const messagesQuery = query(
      collection(db, 'conversations', cid, 'messages'),
      orderBy('timestamp', 'asc')
    )
    // c) Suscribirse en tiempo real a los mensajes
    const unsubscribe = onSnapshot(
      messagesQuery,
      snapshot => {
        // Mapear los documentos a tu tipo Message
        const msgs: Message[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message))
        setMessages(msgs)
        setLoading(false)
        // Hacer scroll al final al recibir nuevos mensajes
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      },
      error => {
        console.error('Error en la suscripción de mensajes:', error)
        setLoading(false)
      }
    )
    // d) Limpiar la suscripción al desmontar o cambiar de conversación
    return () => unsubscribe()
  }, [cid])

  // Manejo del envío de mensajes
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await sendMessage(cid, text)
    setText('') // Limpiar el campo solo después de enviar
    // No agregamos manualmente el mensaje: onSnapshot lo hará automáticamente, evitando duplicados
  }

  return (
    <div className="chat-window">
      {loading ? (
        <div className="loading">Cargando mensajes…</div>
      ) : (
        <div className="messages-list">
          {messages.map(m => (
            <div
              key={m.id}
              className={`message-bubble ${m.sender === currentUserId ? 'message-own' : 'message-other'}`}
              /* Distingue mensajes propios y ajenos por el sender */
            >
              <div className="message-text">{m.text}</div>
              <div className="message-meta">
                <span className="message-channel">{m.channel}</span>
                <span className="message-time">{typeof m.timestamp === 'string' ? m.timestamp : ''}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="chat-input"
          aria-label="Escribe un mensaje"
        />
        <button type="submit" className="send-btn" disabled={!text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  )
}

export default ChatWindow

// TODO: Optimizar paginación y limitar la suscripción a los N mensajes más recientes para ahorrar ancho de banda. 