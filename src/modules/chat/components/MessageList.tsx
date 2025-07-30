// Lista de mensajes de una conversación
// Renderiza mensajes con scroll virtual, estados de lectura y tiempo real
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMessages } from '../hooks/useMessages'
import { useTypingIndicators } from '../hooks/useSocket'
import { MessageBubble } from './MessageBubble'
import { useAuth } from '@/contexts/AuthContext'
import type { CanonicalMessage } from '@/types/canonical'
import { useRef, useEffect, useCallback } from 'react'

interface MessageListProps {
  conversationId: string
}

export function MessageList({ conversationId }: MessageListProps) {
  const { user } = useAuth()
  const { data: messages = [], isLoading, error } = useMessages(conversationId, true) // Enable pagination

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ✅ CORREGIDO: Validación defensiva para evitar TypeError
  const currentUser = user || {}
  const userEmail = (currentUser as any)?.email || 'unknown@email.com'
  const userName = (currentUser as any)?.name || 'Usuario'

  console.log('[MESSAGE-LIST] Rendering with:', {
    conversationId,
    messagesCount: messages?.length,
    messages: messages?.slice(-3), // Últimos 3 mensajes
    isLoading: isLoading,
    error: error,
    hasValidMessages: messages && messages.length > 0,
    userEmail,
    userName
  })

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          Cargando mensajes...
        </div>
      </div>
    )
  }

  if (error) {
    console.error('[MESSAGE-LIST] Error loading messages:', error)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-red-500 py-4">
          Error al cargar mensajes: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    console.log('[MESSAGE-LIST] No messages found for conversation:', conversationId)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          No hay mensajes en esta conversación
        </div>
      </div>
    )
  }

  let lastSenderId: string | null = null
  let lastMessageTime: Date | null = null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        // ✅ CORREGIDO: Validación defensiva para determinar si es mensaje propio
        const messageSenderEmail = message.sender?.email || (message as any).senderIdentifier || 'unknown'
        const isOwnMessage = messageSenderEmail === userEmail
        
        // ✅ CORREGIDO: Validación defensiva para timestamp
        const currentMessageTime = message.timestamp ? new Date(message.timestamp) : new Date()
        const showAvatar = !isOwnMessage && (
          messageSenderEmail !== lastSenderId ||
          !lastMessageTime ||
          (currentMessageTime.getTime() - lastMessageTime.getTime() > 5 * 60 * 1000) // 5 minutes
        )
        
        lastSenderId = messageSenderEmail
        lastMessageTime = currentMessageTime

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
          />
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
} 