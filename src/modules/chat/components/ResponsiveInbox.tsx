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
  onSendMessage,
  onSelectConversation
}: ResponsiveInboxProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(initialConversationId)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // ✅ LOGS CRÍTICOS PARA DEBUG
  console.log('[COMPONENT] ResponsiveInbox render:', {
    conversationsCount: conversations?.length,
    selectedConversationId,
    searchQuery,
    isMobile,
    userEmail: user?.email
  })

  // ✅ Filtrar conversaciones por búsqueda
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations

    const query = searchQuery.toLowerCase()
    return conversations.filter(conversation => {
      const contactName = conversation?.contact?.name?.toLowerCase() || ''
      const contactPhone = conversation?.contact?.phone?.toLowerCase() || ''
      const lastMessage = conversation?.lastMessage?.content?.toLowerCase() || ''
      const title = conversation?.title?.toLowerCase() || ''

      return contactName.includes(query) || 
             contactPhone.includes(query) || 
             lastMessage.includes(query) || 
             title.includes(query)
    })
  }, [conversations, searchQuery])

  // ✅ Obtener conversación seleccionada
  const selectedConversation = useMemo(() => {
    return conversations.find(conv => conv.id === selectedConversationId)
  }, [conversations, selectedConversationId])

  // ✅ Hook para mensajes de la conversación seleccionada
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

  // ✅ Hook para enviar mensajes
  const sendMessageMutation = useSendMessage()

  const handleSelectConversation = (conversationId: string) => {
    console.log('[EVENT] Seleccionando conversación:', conversationId)
    setSelectedConversationId(conversationId)
    onSelectConversation?.(conversationId)
  }

  const handleSendMessage = (messageData: SendMessageData) => {
    console.log('[EVENT] Enviando mensaje:', messageData)
    sendMessageMutation.mutate(messageData)
    onSendMessage?.(messageData)
  }

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Layout principal - PANTALLA COMPLETA CORREGIDA */}
      <div className="flex h-full w-full flex-1">
        
        {/* Panel izquierdo - Lista de conversaciones */}
        <div className={`
          flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobile && selectedConversationId ? 'hidden' : ''}
          ${isMobile ? 'w-full' : 'w-80 min-w-80'}
        `}>
          {/* Header del panel */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
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
            
            {/* Barra de búsqueda única */}
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <ConversationList 
              conversations={filteredConversations}
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
          min-w-0 h-full
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
              <div className="flex-1 flex flex-col h-full min-h-0">
                <ChatWindow
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
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