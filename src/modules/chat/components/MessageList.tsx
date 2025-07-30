// Lista de mensajes de una conversación
// Renderiza mensajes con scroll virtual, estados de lectura y tiempo real
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMessages } from '../hooks/useMessages'
import { useTypingIndicators } from '../hooks/useSocket'
import { MessageBubble } from './MessageBubble'
import { useAuth } from '@/contexts/AuthContext'
import type { CanonicalMessage } from '@/types/canonical'
import { useRef, useEffect, useCallback, useMemo } from 'react'

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

  // ✅ CORREGIDO: Validación defensiva robusta para evitar TypeError
  const currentUser = user || {}
  const userEmail = (currentUser as any)?.email || 'unknown@email.com'
  const userName = (currentUser as any)?.name || 'Usuario'
  const userRole = (currentUser as any)?.role || 'user'

  console.log('[MESSAGE-LIST] Rendering with:', {
    conversationId,
    messagesCount: messages?.length,
    messages: messages?.slice(-3), // Últimos 3 mensajes
    isLoading: isLoading,
    error: error,
    hasValidMessages: messages && messages.length > 0,
    userEmail,
    userName,
    userRole,
    userObject: {
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : [],
      userType: typeof user
    }
  })

  // ✅ CORREGIDO: Validación antes de renderizar
  if (!user || !user.email) {
    console.warn('[MESSAGE-LIST] User not properly loaded:', { user })
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          Cargando usuario...
        </div>
      </div>
    )
  }

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

  // ✅ CORREGIDO: Ordenar mensajes por timestamp para mostrar orden correcto
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      // ✅ AGREGAR: Múltiples campos de timestamp para robustez
      const timestampA = new Date(a.timestamp || a.createdAt || a.sentAt || 0).getTime()
      const timestampB = new Date(b.timestamp || b.createdAt || b.sentAt || 0).getTime()
      
      // ✅ AGREGAR: Logging para debugging
      if (!a.timestamp && !a.createdAt && !a.sentAt) {
        console.warn('[MESSAGES] Message without timestamp:', a.id)
      }
      if (!b.timestamp && !b.createdAt && !b.sentAt) {
        console.warn('[MESSAGES] Message without timestamp:', b.id)
      }
      
      return timestampA - timestampB
    })
  }, [messages])

  let lastSenderId: string | null = null
  let lastMessageTime: Date | null = null

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {sortedMessages.map((message, index) => {
        // ✅ CORREGIDO: Validación defensiva para determinar si es mensaje propio
        const messageSenderEmail = message.sender?.email || 
                                  (message as any).senderIdentifier || 
                                  'unknown'
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

        console.log('[MESSAGE-LIST] Rendering message:', {
          messageId: message.id,
          messageSenderEmail,
          userEmail,
          isOwnMessage,
          timestamp: message.timestamp
        })

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