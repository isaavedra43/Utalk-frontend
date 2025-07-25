// Componente principal del módulo de chat/inbox
// Layout de dos columnas: ConversationList, ChatWindow + Panels
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { InboxProps, ConversationFilter, MessageType } from './types'
import ConversationList from './components/ConversationList'
import ChatWindow from './components/ChatWindow'
import { LazyIAPanel, LazyInfoPanel } from './components/LazyPanels'

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
    error: conversationsError,
    refetch: conversationsRefetch 
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
  const messages = messagesData || []

  // ✅ LOGS CRÍTICOS: Diagnosticar el flujo de datos en Inbox
  console.log('🏠 Inbox component data flow:', {
    selectedConversationId: state.selectedConversationId,
    conversationsData: {
      exists: !!conversationsData,
      conversationsCount: conversations.length,
      loading: conversationsLoading,
      error: conversationsError
    },
    messagesData: {
      exists: !!messagesData,
      messagesCount: messages.length,
      loading: messagesLoading,
      error: messagesError,
      rawData: messagesData
    }
  });

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
      recipientEmail: conversations.find((c: any) => c.id === state.selectedConversationId)?.contact?.email || '',
      type
    })
  }

  const handleTogglePanel = (panel: 'ia' | 'info') => {
    setState(prev => ({ 
      ...prev, 
      activePanel: prev.activePanel === panel ? null : panel 
    }))
  }

  // ✅ ELIMINADO: Datos mock reemplazados por hooks reales de IA

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Lista de conversaciones (Responsivo) */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ConversationList
          conversations={conversations}
          selectedConversationId={state.selectedConversationId}
          onSelectConversation={handleSelectConversation}
          filter={state.filter}
          onFilterChange={handleFilterChange}
          onRefresh={() => conversationsRefetch()}
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

        {/* Panel lateral derecho (Responsivo) */}
        {state.activePanel && state.selectedConversationId && (
          <div className="w-full md:w-80 lg:w-96 border-l border-gray-200 bg-white">
            {state.activePanel === 'ia' && (
              <LazyIAPanel
                conversationId={state.selectedConversationId}
                onSendSuggestion={(suggestion: any) => handleSendMessage(suggestion.content)}
                onAskAssistant={(query: string) => {
                  // TODO: Implementar consulta real a IA
                  console.log('Consulta IA:', query)
                }}
              />
            )}
            
            {state.activePanel === 'info' && (
              <LazyInfoPanel
                conversationId={state.selectedConversationId}
                onUpdateContact={(contactId: string, updates: any) => {
                  // TODO: Implementar actualización de contacto
                  console.log('Actualizar contacto:', { contactId, updates })
                }}
                onUpdateConversation={(conversationId: string, updates: any) => {
                  // TODO: Implementar actualización de conversación
                  console.log('Actualizar conversación:', { conversationId, updates })
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