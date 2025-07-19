// Componente principal del módulo de chat/inbox
// Layout de tres columnas: Sidebar, ConversationList, ChatWindow + Panels
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { InboxProps, ConversationFilter, MessageType, SuggestedResponse, ConversationSummary } from './types'
import Sidebar from './components/Sidebar'
import ConversationList from './components/ConversationList'
import ChatWindow from './components/ChatWindow'
import IAPanel from './components/IAPanel'
import InfoPanel from './components/InfoPanel'

// Hooks reales para conectar con backend UTalk
import { useConversations } from './hooks/useConversations'
import { useMessages, useSendMessage } from './hooks/useMessages'
import { useSocket } from './hooks/useSocket'
import { logger } from '@/lib/logger'

// Estados de la aplicación que necesitamos manejar
interface InboxState {
  selectedConversationId: string | undefined
  activePanel: 'ia' | 'info' | null
  filter: ConversationFilter
}

export function Inbox({ initialConversationId }: InboxProps = {}) {
  // Obtener conversationId desde URL params
  const { conversationId: urlConversationId } = useParams<{ conversationId?: string }>()
  const effectiveConversationId = urlConversationId || initialConversationId
  const hasMounted = useRef(false)

  // Estados locales del inbox
  const [state, setState] = useState<InboxState>({
    selectedConversationId: effectiveConversationId,
    activePanel: null,
    filter: {}
  })

  // Log de mount del componente
  useEffect(() => {
    if (!hasMounted.current) {
      logger.component('Inbox', 'mount', {
        initialConversationId,
        urlConversationId,
        effectiveConversationId
      })
      hasMounted.current = true
    }

    return () => {
      logger.component('Inbox', 'unmount')
    }
  }, [initialConversationId, urlConversationId, effectiveConversationId])

  // Log cuando cambia la conversación seleccionada
  useEffect(() => {
    if (state.selectedConversationId) {
      logger.component('Inbox', 'update', {
        action: 'conversation_selected',
        conversationId: state.selectedConversationId,
        forceLog: true
      })
    }
  }, [state.selectedConversationId])

  // Hooks reales para conectar con backend
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useConversations(state.filter)

  const { 
    data: messagesData, 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useMessages(state.selectedConversationId || '', 1, 50)

  const { 
    mutate: sendMessage 
  } = useSendMessage()

  // Socket.IO para tiempo real
  const { 
    isConnected, 
    typingUsers 
  } = useSocket({ 
    conversationId: state.selectedConversationId,
    enableTyping: true,
    enablePresence: true 
  })

  // Datos procesados para los componentes
  const conversations = conversationsData?.conversations || []
  const messages = messagesData?.messages || []
  const selectedConversation = conversations.find(c => c.id === state.selectedConversationId)

  // Handlers para interacción del usuario
  const handleFilterChange = (newFilter: ConversationFilter) => {
    setState(prev => ({ ...prev, filter: newFilter }))
  }

  const handleSelectConversation = (conversationId: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedConversationId: conversationId,
      activePanel: null // Reset panel when switching conversations
    }))
  }

  const handleSendMessage = (content: string, type: MessageType = 'text') => {
    if (!state.selectedConversationId || !content.trim()) return

    sendMessage({
      conversationId: state.selectedConversationId,
      content: content.trim(),
      type
    })
  }

  const handleTogglePanel = (panel: 'ia' | 'info') => {
    setState(prev => ({ 
      ...prev, 
      activePanel: prev.activePanel === panel ? null : panel 
    }))
  }

  // Mock data para IA Panel (mantenemos temporalmente hasta implementar IA)
  const mockSuggestions: SuggestedResponse[] = [
    {
      id: '1',
      content: '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?',
      confidence: 90,
      category: 'greeting',
      isRelevant: true
    },
    {
      id: '2', 
      content: 'Te ayudo a revisar el estado de tu pedido. ¿Podrías proporcionarme tu número de orden?',
      confidence: 80,
      category: 'order_inquiry',
      isRelevant: true
    }
  ]

  const mockSummary: ConversationSummary = {
    totalMessages: 8,
    avgResponseTime: '2 min',
    sentiment: 'positive',
    topics: ['soporte', 'pedido'],
    lastActivity: new Date()
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Lista de conversaciones (Versión moderna unificada) */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ConversationList
          conversations={conversations}
          selectedConversationId={state.selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isLoading={conversationsLoading}
          filter={state.filter}
          onFilterChange={handleFilterChange}
        />

        {Boolean(conversationsError) && (
          <div className="p-4 text-center text-red-600">
            Error al cargar conversaciones
          </div>
        )}
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex">
        {/* Chat window */}
        <div className={`flex-1 ${state.activePanel ? 'mr-80' : ''} transition-all duration-200`}>
          {state.selectedConversationId ? (
            <>
              {/* Header con botones de panel */}
              <div className="border-b border-gray-200 bg-white px-4 py-2 flex justify-end gap-2">
                <button
                  onClick={() => handleTogglePanel('ia')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    state.activePanel === 'ia' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🤖 IA
                </button>
                <button
                  onClick={() => handleTogglePanel('info')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    state.activePanel === 'info' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👤 Info
                </button>
              </div>
              
              <ChatWindow
                conversationId={state.selectedConversationId}
                messages={messages}
                isLoading={messagesLoading}
                typingUsers={typingUsers}
                onSendMessage={handleSendMessage}
              />
              
              {Boolean(messagesError) && (
                <div className="p-4 text-center text-red-600">
                  Error al cargar mensajes
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-medium mb-2">Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral derecho */}
        {state.activePanel && state.selectedConversationId && (
          <div className="w-80 border-l border-gray-200 bg-white">
            {state.activePanel === 'ia' && (
              <IAPanel
                conversationId={state.selectedConversationId}
                suggestions={mockSuggestions}
                summary={mockSummary}
                onSendSuggestion={(suggestion) => handleSendMessage(suggestion.content)}
                onAskAssistant={(query) => {
                  // TODO: Implementar consulta real a IA
                  console.log('Consulta IA:', query)
                }}
              />
            )}
            
            {state.activePanel === 'info' && selectedConversation && (
              <InfoPanel
                contact={selectedConversation.contact}
                conversation={selectedConversation}
                onUpdateContact={(updates) => {
                  // TODO: Implementar actualización de contacto
                  console.log('Actualizar contacto:', updates)
                }}
                onUpdateConversation={(updates) => {
                  // TODO: Implementar actualización de conversación
                  console.log('Actualizar conversación:', updates)
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Indicador de conexión Socket.IO */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow">
          🔄 Reconectando chat en tiempo real...
        </div>
      )}
    </div>
  )
}

export default Inbox 