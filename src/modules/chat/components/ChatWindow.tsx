// ✅ VERSIÓN ULTRA-SIMPLIFICADA DE CHATWINDOW QUE NO PUEDE FALLAR
import React, { useState, useEffect } from 'react'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages } from '../hooks/useMessages'

interface ChatWindowProps {
  conversation: any
  onSendMessage?: (data: any) => void
}

// ✅ ERROR BOUNDARY ULTRA-SIMPLE
class SimpleChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[CHAT-ERROR]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Error en el chat</h3>
            <p className="text-gray-600 mb-4">Ha ocurrido un error inesperado</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function ChatWindow({ conversation, onSendMessage }: ChatWindowProps) {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // ✅ VALIDACIÓN ULTRA-DEFENSIVA
  const safeConversation = conversation || {}
  const conversationId = safeConversation.id || ''
  const conversationTitle = safeConversation.title || 'Conversación'
  const contactName = safeConversation.contact?.name || 'Usuario'

  console.log('[CHAT-WINDOW] Renderizando con:', {
    conversationId,
    hasConversation: !!conversation,
    contactName
  })

  // ✅ OBTENER MENSAJES DE FORMA SEGURA
  const { 
    messages = [], 
    isLoading = false, 
    error: messagesError = null 
  } = useMessages(conversationId)

  // ✅ MANEJO DE ERRORES GLOBAL
  useEffect(() => {
    const handleError = (event: any) => {
      console.error('[CHAT-WINDOW] Error capturado:', event)
      setError('Error en el chat')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // ✅ VALIDACIÓN BÁSICA
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
          <p className="text-gray-600">Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (messagesError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error cargando mensajes</h3>
          <p className="text-gray-600">No se pudieron cargar los mensajes de esta conversación</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner text="Cargando conversación..." />
      </div>
    )
  }

  // ✅ FUNCIÓN SIMPLE PARA ENVIAR MENSAJES
  const handleSendMessage = (data: any) => {
    try {
      console.log('[CHAT-WINDOW] Enviando mensaje:', data)
      
      if (onSendMessage) {
        onSendMessage(data)
      }
    } catch (error) {
      console.error('[CHAT-WINDOW] Error enviando mensaje:', error)
      setError('Error enviando mensaje')
    }
  }

  // ✅ RENDER PRINCIPAL ULTRA-SIMPLIFICADO
  return (
    <SimpleChatErrorBoundary>
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* ✅ HEADER SIMPLE */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{contactName}</h2>
              <p className="text-sm text-gray-500">{conversationTitle}</p>
            </div>
          </div>
        </div>

        {/* ✅ LISTA DE MENSAJES */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            conversationId={conversationId}
          />
        </div>

        {/* ✅ INPUT DE MENSAJES */}
        <div className="border-t p-4 bg-white">
          <MessageInput
            conversationId={conversationId}
            onSendMessage={handleSendMessage}
            disabled={false}
          />
        </div>
      </div>
    </SimpleChatErrorBoundary>
  )
} 