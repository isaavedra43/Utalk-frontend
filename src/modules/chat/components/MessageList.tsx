// Lista de mensajes de una conversación
// Renderiza mensajes con scroll virtual, estados de lectura y tiempo real
import React from 'react'
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

// ✅ Error Boundary específico para MessageList
class MessageListErrorBoundary extends React.Component<
  { children: React.ReactNode; conversationId?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; conversationId?: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ERROR-BOUNDARY] MessageList error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR-BOUNDARY] MessageList componentDidCatch:', {
      error,
      errorInfo,
      conversationId: this.props.conversationId
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded">
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">
              ❌ Error cargando mensajes
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {this.state.error?.message || 'Error desconocido al cargar mensajes'}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function MessageList({ conversationId }: MessageListProps) {
  // ✅ VALIDACIÓN INICIAL CRÍTICA
  if (!conversationId || typeof conversationId !== 'string' || !conversationId.trim()) {
    console.warn('[MESSAGE-LIST] Invalid conversationId:', conversationId)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-yellow-600 py-4 bg-yellow-50 rounded">
          ⚠️ ID de conversación no válido
        </div>
      </div>
    )
  }

  const { user } = useAuth()
  
  // ✅ VALIDACIÓN DE USUARIO CRÍTICA
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

  const { data: messages = [], isLoading, error } = useMessages(conversationId, false) // Usar simple query por defecto
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ✅ VALIDACIÓN DEFENSIVA ROBUSTA PARA EVITAR TYPEOF
  const currentUser = user || {}
  const userEmail = (currentUser as any)?.email || 'unknown@email.com'
  const userName = (currentUser as any)?.name || 'Usuario'
  const userRole = (currentUser as any)?.role || 'user'

  const scrollToBottom = useCallback(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.warn('[MESSAGE-LIST] Error scrolling to bottom:', error)
    }
  }, [])

  useEffect(() => {
    if (messages && messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, scrollToBottom])

  console.log('[MESSAGE-LIST] Rendering with:', {
    conversationId,
    messagesCount: messages?.length || 0,
    isLoading: isLoading,
    error: error ? (error as any).message : null,
    hasValidMessages: Array.isArray(messages) && messages.length > 0,
    userEmail,
    userName,
    userRole
  })

  // ✅ ESTADO DE CARGA
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          Cargando mensajes...
        </div>
      </div>
    )
  }

  // ✅ ESTADO DE ERROR
  if (error) {
    console.error('[MESSAGE-LIST] Error loading messages:', error)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded">
          <div className="text-red-600 dark:text-red-400 font-medium mb-2">
            ❌ Error al cargar mensajes
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        </div>
      </div>
    )
  }

  // ✅ VALIDACIÓN DE MENSAJES SEGURA
  const safeMessages = Array.isArray(messages) ? messages : []
  
  if (safeMessages.length === 0) {
    console.log('[MESSAGE-LIST] No messages found for conversation:', conversationId)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          💬 No hay mensajes en esta conversación
        </div>
        <div className="text-center text-xs text-gray-400">
          Envía el primer mensaje para comenzar la conversación
        </div>
      </div>
    )
  }

  // ✅ ORDENAR MENSAJES DE FORMA ULTRA-SEGURA
  const sortedMessages = useMemo(() => {
    try {
      return [...safeMessages].sort((a, b) => {
        try {
          // ✅ MÚLTIPLES CAMPOS DE TIMESTAMP PARA ROBUSTEZ
          const timestampA = new Date(a.timestamp || a.createdAt || a.sentAt || 0).getTime()
          const timestampB = new Date(b.timestamp || b.createdAt || b.sentAt || 0).getTime()
          
          // ✅ VALIDACIÓN DE TIMESTAMPS
          if (isNaN(timestampA) || isNaN(timestampB)) {
            console.warn('[MESSAGE-LIST] Invalid timestamps:', { 
              a: { id: a.id, timestamp: a.timestamp }, 
              b: { id: b.id, timestamp: b.timestamp } 
            })
            return 0
          }
          
          return timestampA - timestampB
        } catch (error) {
          console.error('[MESSAGE-LIST] Error comparing messages:', error, { a, b })
          return 0
        }
      }).filter(msg => {
        // ✅ FILTRAR MENSAJES VÁLIDOS
        const isValid = msg && msg.id && typeof msg.id === 'string'
        if (!isValid) {
          console.warn('[MESSAGE-LIST] Filtering out invalid message:', msg)
        }
        return isValid
      })
    } catch (error) {
      console.error('[MESSAGE-LIST] Error sorting messages:', error)
      return safeMessages
    }
  }, [safeMessages])

  return (
    <MessageListErrorBoundary conversationId={conversationId}>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedMessages.map((message, index) => {
          try {
            // ✅ VALIDACIÓN INDIVIDUAL POR MENSAJE
            if (!message || !message.id) {
              console.warn('[MESSAGE-LIST] Skipping invalid message at index:', index, message)
              return (
                <div key={`invalid_${index}`} className="text-xs text-red-500 p-2 border border-red-200 rounded">
                  ⚠️ Mensaje inválido #{index + 1}
                </div>
              )
            }

            // ✅ VALIDACIÓN DEFENSIVA PARA DETERMINAR SI ES MENSAJE PROPIO
            const messageSenderEmail = message.sender?.email || 
                                      (message as any).senderIdentifier || 
                                      'unknown'
            const isOwnMessage = messageSenderEmail === userEmail

            console.log('[MESSAGE-LIST] Rendering message:', {
              messageId: message.id,
              messageSenderEmail,
              userEmail,
              isOwnMessage,
              timestamp: message.timestamp,
              hasContent: !!message.content
            })

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            )
          } catch (error) {
            console.error('[MESSAGE-LIST] Error rendering message:', error, { message, index })
            return (
              <div key={`error_${message?.id || index}`} className="text-xs text-red-500 p-2 border border-red-200 rounded">
                ❌ Error renderizando mensaje: {message?.id || `#${index + 1}`}
                <div className="text-xs mt-1">
                  {(error as any)?.message || 'Error desconocido'}
                </div>
              </div>
            )
          }
        })}
        <div ref={messagesEndRef} />
      </div>
    </MessageListErrorBoundary>
  )
} 