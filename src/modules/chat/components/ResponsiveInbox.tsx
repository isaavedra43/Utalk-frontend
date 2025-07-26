// Componente Inbox responsivo mejorado
// Optimizado para móviles con touch feedback y swipe
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  ChevronLeft
} from 'lucide-react'
import { ResponsiveInboxProps } from '../types'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import { LazyIAPanel, LazyInfoPanel } from './LazyPanels'
import { useConversations } from '../hooks/useConversations'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useSocket } from '../hooks/useSocket'
import { useConversationFilters } from '../hooks/useConversationFilters'
import { logger } from '@/lib/logger'

// Estados de la aplicación
interface ResponsiveInboxState {
  selectedConversationId: string | undefined
  activePanel: 'ia' | 'info' | null
  isMobileMenuOpen: boolean
  isMobileChatOpen: boolean
}

export function ResponsiveInbox({ initialConversationId }: ResponsiveInboxProps = {}) {
  const { conversationId: urlConversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const effectiveConversationId = urlConversationId || initialConversationId

  // Estados locales
  const [state, setState] = useState<ResponsiveInboxState>({
    selectedConversationId: effectiveConversationId,
    activePanel: null,
    isMobileMenuOpen: false,
    isMobileChatOpen: false
  })

  // Hook para filtros sincronizados con URL
  const { updateFilters } = useConversationFilters()

  // Hooks para datos
  const {
    data: conversationsData,
    refetch: conversationsRefetch,
  } = useConversations({})

  const { 
    data: messagesData, 
    isLoading: messagesLoading, 
    error: messagesError 
  } = useMessages(state.selectedConversationId || '', 1, 50)

  const { mutate: sendMessage } = useSendMessage()

  // Socket.IO para tiempo real
  const { isConnected, typingUsers } = useSocket({ 
    conversationId: state.selectedConversationId,
    enableTyping: true,
    enablePresence: true 
  })

  // Datos procesados
  const conversations = conversationsData?.conversations || []
  const messages = messagesData || []
  
  // ✅ Obtener conversación seleccionada
  const selectedConversation = conversations.find(c => c.id === state.selectedConversationId)

  // Handlers para interacción
  const handleSelectConversation = (conversationId: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedConversationId: conversationId,
      activePanel: null,
      isMobileChatOpen: true // Abrir chat en móvil
    }))
    
    // Actualizar URL
    navigate(`/chat/${conversationId}`)
  }

  // Lógica para enviar mensaje
  const handleSendMessage = (content: string, type: any = 'text') => {
    if (!state.selectedConversationId || !content.trim()) return

    sendMessage({
      conversationId: state.selectedConversationId,
      content: content.trim(),
      recipientEmail: selectedConversation?.contact?.email || '',
      type
    })
  }

  const handleTogglePanel = (panel: 'ia' | 'info') => {
    setState(prev => ({ 
      ...prev, 
      activePanel: prev.activePanel === panel ? null : panel 
    }))
  }

  const handleMobileMenuToggle = () => {
    setState(prev => ({ 
      ...prev, 
      isMobileMenuOpen: !prev.isMobileMenuOpen 
    }))
  }

  const handleMobileChatClose = () => {
    setState(prev => ({ 
      ...prev, 
      isMobileChatOpen: false 
    }))
    navigate('/chat')
  }

  // Log de mount
  useEffect(() => {
    logger.component('ResponsiveInbox', 'mount', {
      initialConversationId,
      urlConversationId,
      effectiveConversationId,
      isMobile: window.innerWidth < 768
    })
  }, [initialConversationId, urlConversationId, effectiveConversationId])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Lista de conversaciones - Responsivo */}
      <div className={`
        ${state.isMobileChatOpen ? 'hidden' : 'flex'}
        ${state.isMobileMenuOpen ? 'flex' : 'hidden'}
        md:flex
        w-full md:w-80 lg:w-96 
        border-r border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800
        flex-col
      `}>
        {/* Header móvil */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversaciones
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileMenuToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedConversationId={state.selectedConversationId}
          onSelectConversation={handleSelectConversation}
          filter={{}}
          onFilterChange={updateFilters}
          onRefresh={() => conversationsRefetch()}
        />
      </div>

      {/* Área principal de chat - Responsivo */}
      <div className={`
        ${!state.isMobileChatOpen && !state.selectedConversationId ? 'hidden' : 'flex'}
        md:flex
        flex-1 flex-col
      `}>
        {/* Header móvil para chat */}
        {state.selectedConversationId && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileChatClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Chat
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTogglePanel('ia')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  state.activePanel === 'ia' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🤖
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTogglePanel('info')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  state.activePanel === 'info' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👤
              </Button>
            </div>
          </div>
        )}

        {/* Chat window */}
        <div className={`flex-1 ${state.activePanel ? 'mr-80' : ''} transition-all duration-200`}>
          {state.selectedConversationId ? (
            <>
              {/* Header desktop con botones de panel */}
              <div className="hidden md:flex border-b border-gray-200 bg-white px-4 py-2 justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePanel('ia')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    state.activePanel === 'ia' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🤖 IA
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePanel('info')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    state.activePanel === 'info' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👤 Info
                </Button>
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
                <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
                
                {/* Botón para abrir menú en móvil */}
                <Button
                  onClick={handleMobileMenuToggle}
                  className="mt-4 md:hidden"
                  variant="outline"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Ver conversaciones
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral derecho - Responsivo */}
        {state.activePanel && state.selectedConversationId && (
          <div className={`
            ${state.isMobileChatOpen ? 'flex' : 'hidden'}
            md:flex
            w-full md:w-80 lg:w-96 
            border-l border-gray-200 bg-white
            flex-col
          `}>
            {state.activePanel === 'ia' && (
              <LazyIAPanel
                conversationId={state.selectedConversationId}
                onSendSuggestion={(suggestion: any) => handleSendMessage(suggestion.content)}
                onAskAssistant={(query: string) => {
                  console.log('Consulta IA:', query)
                }}
              />
            )}
            
            {state.activePanel === 'info' && (
              <LazyInfoPanel
                conversationId={state.selectedConversationId}
                onUpdateContact={(contactId: string, updates: any) => {
                  console.log('Actualizar contacto:', { contactId, updates })
                }}
                onUpdateConversation={(conversationId: string, updates: any) => {
                  console.log('Actualizar conversación:', { conversationId, updates })
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Botón flotante para menú en móvil */}
      {!state.isMobileChatOpen && (
        <Button
          onClick={handleMobileMenuToggle}
          className="fixed bottom-4 right-4 md:hidden z-50 rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}

      {/* Indicador de conexión Socket.IO */}
      {!isConnected && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow z-50">
          🔄 Reconectando chat en tiempo real...
        </div>
      )}
    </div>
  )
}

export default ResponsiveInbox 