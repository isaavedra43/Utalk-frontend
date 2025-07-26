// Componente principal Inbox
// ✅ EMAIL-FIRST: Bandeja de entrada con gestión completa de conversaciones
import { useState, useEffect } from 'react'
import { ResponsiveInbox } from './components/ResponsiveInbox'
import { useConversations } from './hooks/useConversations'
import { useSendMessage } from './hooks/useMessages'
import type { InboxProps, SendMessageData } from './types'

export function Inbox({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: InboxProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  )

  // ✅ Hooks corregidos - usar datos directamente
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError,
    refetch: refetchConversations
  } = useConversations()
  
  const sendMessageMutation = useSendMessage()

  // Sincronizar con prop inicial
  useEffect(() => {
    if (initialConversationId && initialConversationId !== selectedConversationId) {
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])

  const handleSelectConversation = (conversationId: string) => {
    console.log('📱 Inbox: Selecting conversation:', conversationId)
    setSelectedConversationId(conversationId)
    onSelectConversation?.(conversationId)
  }

  const handleSendMessage = (messageData: SendMessageData) => {
    console.log('💬 Inbox: Sending message:', {
      conversationId: messageData.conversationId,
      content: messageData.content?.substring(0, 50),
      senderEmail: messageData.senderEmail
    })
    
    // Enviar a través de la mutación
    sendMessageMutation.mutate(messageData)
    
    // Callback externo si existe
    onSendMessage?.(messageData)
  }

  const handleRefreshConversations = () => {
    console.log('🔄 Inbox: Refreshing conversations...')
    refetchConversations()
  }

  // Estado de carga inicial
  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando conversaciones...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error al cargar conversaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {String(conversationsError)}
          </p>
          <button
            onClick={handleRefreshConversations}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  // Sin conversaciones
  if (!conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay conversaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Las nuevas conversaciones aparecerán aquí cuando lleguen mensajes
          </p>
        </div>
      </div>
    )
  }

  // Render principal
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <ResponsiveInbox
        initialConversationId={selectedConversationId}
        onSendMessage={handleSendMessage}
        onSelectConversation={handleSelectConversation}
      />
    </div>
  )
} 