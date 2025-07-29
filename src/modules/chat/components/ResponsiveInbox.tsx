// Inbox responsivo con adaptación móvil/desktop
// ✅ REFACTORIZADO: Sin lógica de filtrado, solo renderizado
import { useState, useMemo, useEffect } from 'react'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useMessages'
import type { ResponsiveInboxProps, SendMessageData } from '../types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// Hook simple para media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [query])
  
  return matches
}

export function ResponsiveInbox({ 
  conversations,
  initialConversationId, 
  onSendMessage: onSendMessageProp,
  onSelectConversation: onSelectConversationProp,
}: ResponsiveInboxProps) {
  console.log('[COMPONENT] ResponsiveInbox.tsx: Componente renderizado')
  console.log('[PROP] ResponsiveInbox.tsx: Props recibidas:')
  console.log('[PROP] - conversations:', conversations)
  console.log('[PROP] - Tipo de conversations:', typeof conversations)
  console.log('[PROP] - Es array:', Array.isArray(conversations))
  console.log('[PROP] - Longitud:', conversations?.length)
  console.log('[PROP] - initialConversationId:', initialConversationId, 'Type:', typeof initialConversationId)
  console.log('[PROP] - onSendMessage:', typeof onSendMessageProp)
  console.log('[PROP] - onSelectConversation:', typeof onSelectConversationProp)

  if (conversations && Array.isArray(conversations)) {
    console.log('[PROP] ResponsiveInbox.tsx: Detalle de conversaciones recibidas:')
    conversations.forEach((conv, index) => {
      console.log(`[PROP] Conversación ${index + 1}:`, {
        id: conv?.id,
        hasContact: !!conv?.contact,
        contactName: conv?.contact?.name,
        hasLastMessage: !!conv?.lastMessage,
        status: conv?.status
      })
    })
  } else {
    console.warn('[PROP] ResponsiveInbox.tsx: conversations no es un array válido:', conversations)
  }

  const { user } = useAuth()
  console.log('[AUTH] ResponsiveInbox.tsx: Usuario autenticado:', {
    hasUser: !!user,
    email: user?.email,
    isActive: user?.isActive
  })

  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(initialConversationId)
  const [searchQuery, setSearchQuery] = useState('')
  
  console.log('[STATE] ResponsiveInbox.tsx: Estados iniciales:')
  console.log('[STATE] - selectedConversationId:', selectedConversationId)
  console.log('[STATE] - searchQuery:', searchQuery)

  useEffect(() => {
    console.log('[EFFECT] ResponsiveInbox.tsx: useEffect para initialConversationId')
    console.log('[EFFECT] - initialConversationId:', initialConversationId)
    console.log('[EFFECT] - selectedConversationId actual:', selectedConversationId)
    
    if (initialConversationId && initialConversationId !== selectedConversationId) {
      console.log('[EFFECT] ResponsiveInbox.tsx: Actualizando selectedConversationId')
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])
  
  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useMessages(selectedConversationId)

  console.log('[HOOK-RESULT] ResponsiveInbox.tsx: useMessages resultado:')
  console.log('[HOOK-RESULT] - messages:', messages)
  console.log('[HOOK-RESULT] - Tipo de messages:', typeof messages)
  console.log('[HOOK-RESULT] - Es array:', Array.isArray(messages))
  console.log('[HOOK-RESULT] - Longitud:', messages?.length)
  console.log('[HOOK-RESULT] - messagesLoading:', messagesLoading)
  console.log('[HOOK-RESULT] - selectedConversationId usado:', selectedConversationId)

  // ✅ LOGS CRÍTICOS: Verificar que selectedConversationId sea válido
  console.log('[CRITICAL] ResponsiveInbox.tsx: selectedConversationId para mensajes:', selectedConversationId)
  console.log('[CRITICAL] ResponsiveInbox.tsx: Tipo de selectedConversationId:', typeof selectedConversationId)
  console.log('[CRITICAL] ResponsiveInbox.tsx: selectedConversationId es truthy:', !!selectedConversationId)

  const sendMessageMutation = useSendMessage()
  
  const handleSendMessage = (messageData: SendMessageData) => {
    console.log('[HANDLER] ResponsiveInbox.tsx: handleSendMessage llamado')
    console.log('[HANDLER] - messageData:', messageData)
    console.log('[HANDLER] - Tipo de messageData:', typeof messageData)
    
    try {
      sendMessageMutation.mutate(messageData)
      console.log('[HANDLER] - sendMessageMutation.mutate ejecutado')
      
      if (onSendMessageProp) {
        console.log('[HANDLER] - Llamando callback onSendMessageProp')
        onSendMessageProp(messageData)
      } else {
        console.log('[HANDLER] - No hay callback onSendMessageProp')
      }
    } catch (error) {
      console.error('[ERROR] ResponsiveInbox.tsx: Error en handleSendMessage:', error)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    console.log('[HANDLER] ResponsiveInbox.tsx: handleSelectConversation llamado')
    console.log('[HANDLER] - conversationId:', conversationId, 'Type:', typeof conversationId)
    
    setSelectedConversationId(conversationId)
    console.log('[HANDLER] - selectedConversationId actualizado a:', conversationId)
    
    if (onSelectConversationProp) {
      console.log('[HANDLER] - Llamando callback onSelectConversationProp')
      onSelectConversationProp(conversationId)
    } else {
      console.log('[HANDLER] - No hay callback onSelectConversationProp')
    }
  }

  // ✅ PASO 3: ELIMINAR DOBLE FILTRADO
  // ResponsiveInbox ya NO filtra - solo pasa las conversaciones directamente
  // El filtrado se hace ÚNICAMENTE en ConversationList
  console.log('[FILTER] ResponsiveInbox.tsx: NO FILTERING - Pasando conversaciones directamente')
  console.log('[FILTER] - conversations originales:', conversations)
  console.log('[FILTER] - conversations length:', conversations?.length)
  console.log('[FILTER] - searchQuery (ignorado aquí):', searchQuery)

  const selectedConversation = useMemo(() => {
    console.log('[MEMO] ResponsiveInbox.tsx: Calculando selectedConversation')
    console.log('[MEMO] - conversations:', conversations)
    console.log('[MEMO] - selectedConversationId:', selectedConversationId)
    console.log('[MEMO] - conversations es array:', Array.isArray(conversations))
    
    if (!selectedConversationId || !Array.isArray(conversations)) {
      console.log('[MEMO] - No hay selectedConversationId o conversations no es array')
      return undefined
    }
    
    const found = conversations.find(c => c.id === selectedConversationId)
    console.log('[MEMO] - Conversación encontrada:', found)
    console.log('[MEMO] - ID buscado:', selectedConversationId)
    
    if (found) {
      console.log('[MEMO] - Conversación seleccionada:', {
        id: found.id,
        contactName: found.contact?.name,
        hasMessages: !!found.lastMessage
      })
    } else {
      console.log('[MEMO] - No se encontró conversación con ID:', selectedConversationId)
    }
    
    return found
  }, [conversations, selectedConversationId])

  console.log('[RENDER] ResponsiveInbox.tsx: Preparando render final')
  console.log('[RENDER] - conversations (SIN FILTRAR):', conversations)
  console.log('[RENDER] - conversations length:', conversations?.length)
  console.log('[RENDER] - selectedConversation:', selectedConversation)
  console.log('[RENDER] - selectedConversationId:', selectedConversationId)
  console.log('[RENDER] - messages:', messages)
  console.log('[RENDER] - messagesLoading:', messagesLoading)

  // Logs adicionales para el renderizado
  console.log('[RENDER] ResponsiveInbox.tsx: Renderizando ConversationList con props:', {
    conversations: conversations, // ✅ CORREGIDO: Pasa conversations SIN filtrar
    conversationsLength: conversations?.length,
    selectedConversationId,
    onSelect: typeof handleSelectConversation,
    isLoading: false,
    searchQuery,
    onSearchChange: typeof setSearchQuery
  })

  if (selectedConversation) {
    console.log('[RENDER] ResponsiveInbox.tsx: Renderizando ChatWindow con props:', {
      conversation: selectedConversation,
      conversationId: selectedConversation.id,
      messages,
      messagesLength: messages?.length,
      isLoading: messagesLoading,
      onSendMessage: typeof handleSendMessage,
      currentUserEmail: user?.email,
      typingUsers: []
    })
  } else {
    console.log('[RENDER] ResponsiveInbox.tsx: Renderizando placeholder (no hay conversación seleccionada)')
  }

  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Layout principal mejorado */}
      <div className="flex h-full w-full">
        
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className={`
          flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isMobile && selectedConversationId ? 'hidden' : ''}
          ${isMobile ? 'w-full' : 'w-80 min-w-80'}
        `}>
          {/* Header del panel */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Conversaciones
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {conversations.length}
                </span>
                <Button variant="ghost" size="sm" className="p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {/* Barra de búsqueda mejorada */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 
                          rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                          placeholder-gray-500 dark:placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList 
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelect={handleSelectConversation}
              isLoading={false}
              error={undefined}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Panel derecho - Chat principal */}
        <div className={`
          flex-1 flex flex-col bg-white dark:bg-gray-900
          ${isMobile && !selectedConversationId ? 'hidden' : ''}
          min-w-0
        `}>
          {selectedConversationId ? (
            <>
              {/* Botón volver en móvil */}
              {isMobile && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedConversationId(undefined)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </Button>
                </div>
              )}
              
              {/* Ventana de chat mejorada */}
              <div className="flex-1 flex flex-col min-h-0">
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  isLoading={messagesLoading}
                  onSendMessage={handleSendMessage}
                  currentUserEmail={user?.email || ''}
                  typingUsers={[]}
                />
              </div>
            </>
          ) : (
            /* Estado vacío mejorado */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Elige una conversación de la lista para empezar a chatear con tus clientes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 