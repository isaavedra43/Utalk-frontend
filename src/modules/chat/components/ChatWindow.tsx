// Ventana de chat principal con WebSockets y scroll automático
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { InfoPanel } from './InfoPanel'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '../hooks/useSocket'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { CanonicalMessage } from '@/types/canonical'
import type { SendMessageData, MessageType } from '../types'

// ✅ CORREGIR: Error Boundary para componentes críticos
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR-BOUNDARY] Chat error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">
              Error en el chat
            </div>
            <p className="text-muted-foreground max-w-md">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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

export function ChatWindow({
  conversation,
  onSendMessage
}: {
  conversation?: any
  onSendMessage?: (data: SendMessageData) => void
}) {
  const { user } = useAuth()
  const { isConnected, joinConversation, leaveConversation } = useSocket()
  
  // ✅ CORREGIR: Error boundary local para prevenir pantallas en blanco
  const [error, setError] = useState<string | null>(null)

  // ✅ CORREGIR: Validación defensiva del usuario
  const currentUser = user || {}
  const userEmail = (currentUser as any)?.email || 'unknown@email.com'
  const userName = (currentUser as any)?.name || 'Usuario'

  // ✅ CORREGIR: Error boundary para cada componente
  useEffect(() => {
    const handleError = (errorEvent: ErrorEvent) => {
      console.error('[CHAT-WINDOW] Component error:', errorEvent)
      setError(errorEvent.message || 'Error desconocido en el chat')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[CHAT-WINDOW] Unhandled promise rejection:', event.reason)
      setError('Error en operación asíncrona del chat')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // ✅ CORREGIR: Mostrar error en lugar de pantalla en blanco
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Error en la aplicación
          </div>
          <p className="text-muted-foreground max-w-md">
            {error}
          </p>
          <button 
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  // ✅ CORREGIR: Validar datos antes de renderizar
  if (!user || !user.email) {
    console.warn('[CHAT-WINDOW] User not properly loaded:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      userKeys: user ? Object.keys(user) : []
    })
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Cargando usuario...
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Selecciona una conversación para comenzar
        </div>
      </div>
    )
  }

  // ✅ RESTO DEL COMPONENTE CON VALIDACIÓN DEFENSIVA
  const conversationId = conversation.id
  const contact = conversation.contact || { name: 'Cliente Sin Nombre', phone: 'N/A', email: 'unknown@email.com' }

  console.log('[CHAT-WINDOW] Rendering with:', {
    conversationId,
    userEmail,
    userName,
    contactName: contact.name,
    isConnected
  })

  // ✅ CORREGIR: Handler para envío de mensajes compatible con MessageInput
  const handleMessageInput = useCallback((data: SendMessageData) => {
    // El MessageInput ya envía datos en formato SendMessageData
    if (onSendMessage) {
      onSendMessage(data)
    }
  }, [onSendMessage])

  // ✅ CORREGIR: Handler alternativo para envío simplificado
  const handleSendMessage = useCallback((data: { content: string; type?: MessageType; attachments?: File[] }) => {
    const messageData: SendMessageData = {
      content: data.content,
      type: data.type || 'text',
      conversationId,
      senderEmail: userEmail,
      recipientEmail: contact.email || contact.phone || 'unknown',
      attachments: data.attachments,
      metadata: {
        userEmail: userEmail
      }
    }

    if (onSendMessage) {
      onSendMessage(messageData)
    }
  }, [conversationId, userEmail, contact.email, contact.phone, onSendMessage])

  return (
    <ChatErrorBoundary>
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {contact.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <MessageList conversationId={conversationId} />

        {/* Input */}
        <div className="border-t bg-background p-4">
          <MessageInput
            conversationId={conversationId}
            onSendMessage={handleMessageInput}
            disabled={!isConnected}
            placeholder="Escribe un mensaje..."
          />
        </div>
      </div>
    </ChatErrorBoundary>
  )
} 