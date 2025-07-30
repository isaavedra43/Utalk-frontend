// Inbox responsivo con adaptación móvil/desktop
// ✅ REFACTORIZADO: Sin lógica de filtrado, solo renderizado
import React, { useState, useMemo, useEffect } from 'react'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useMessages'
import type { ResponsiveInboxProps, SendMessageData } from '../types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// ✅ Error Boundary específico para ResponsiveInbox
class ResponsiveInboxErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ERROR-BOUNDARY] ResponsiveInbox error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR-BOUNDARY] ResponsiveInbox componentDidCatch:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">
              ❌ Error en las conversaciones
            </div>
            <p className="text-muted-foreground max-w-md">
              {this.state.error?.message || 'Ha ocurrido un error al cargar las conversaciones'}
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

  // ✅ VALIDACIÓN DEFENSIVA CRÍTICA: Asegurar que conversations sea un array válido
  const safeConversations = useMemo(() => {
    console.log('[VALIDATION] ResponsiveInbox conversations validation:', {
      conversations,
      type: typeof conversations,
      isArray: Array.isArray(conversations),
      length: conversations?.length,
      isNull: conversations === null,
      isUndefined: conversations === undefined
    })

    // ✅ Si conversations es undefined, null o no es array, devolver array vacío
    if (!conversations || !Array.isArray(conversations)) {
      console.warn('[VALIDATION] Invalid conversations data, using empty array:', conversations)
      return []
    }

    // ✅ Filtrar conversaciones válidas (con ID)
    const validConversations = conversations.filter(conv => {
      const isValid = conv && conv.id && typeof conv.id === 'string'
      if (!isValid) {
        console.warn('[VALIDATION] Filtering out invalid conversation:', conv)
      }
      return isValid
    })

    console.log('[VALIDATION] Valid conversations after filtering:', validConversations.length)
    return validConversations
  }, [conversations])

  // ✅ LOGS CRÍTICOS PARA DEBUG
  console.log('[COMPONENT] ResponsiveInbox render:', {
    originalConversationsCount: conversations?.length,
    safeConversationsCount: safeConversations.length,
    selectedConversationId,
    searchQuery,
    isMobile,
    userEmail: user?.email
  })

  // ✅ Filtrar conversaciones por búsqueda con validación defensiva
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return safeConversations

    const query = searchQuery.toLowerCase()
    
    return safeConversations.filter(conversation => {
      try {
        // ✅ Validación defensiva para cada campo
        const contactName = conversation?.contact?.name?.toLowerCase() || ''
        const contactPhone = conversation?.contact?.phone?.toLowerCase() || ''
        const lastMessage = conversation?.lastMessage?.content?.toLowerCase() || ''
        const title = conversation?.title?.toLowerCase() || ''

        return contactName.includes(query) || 
               contactPhone.includes(query) || 
               lastMessage.includes(query) || 
               title.includes(query)
      } catch (error) {
        console.error('[FILTER] Error filtering conversation:', conversation, error)
        return false
      }
    })
  }, [safeConversations, searchQuery])

  // ✅ Obtener conversación seleccionada con validación defensiva
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId || !safeConversations.length) {
      return undefined
    }
    
    const found = safeConversations.find(conv => conv.id === selectedConversationId)
    console.log('[SELECTION] Selected conversation:', {
      selectedConversationId,
      found: !!found,
      foundId: found?.id
    })
    return found
  }, [safeConversations, selectedConversationId])

  // ✅ Hook para mensajes de la conversación seleccionada (solo si hay ID válido)
  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useMessages(selectedConversationId || '', false) // Pasar string vacío si no hay ID

  console.log('[HOOK-RESULT] ResponsiveInbox.tsx: useMessages resultado:')
  console.log('[HOOK-RESULT] - messages:', messages)
  console.log('[HOOK-RESULT] - Tipo de messages:', typeof messages)
  console.log('[HOOK-RESULT] - Es array:', Array.isArray(messages))
  console.log('[HOOK-RESULT] - Longitud:', messages?.length)
  console.log('[HOOK-RESULT] - messagesLoading:', messagesLoading)
  console.log('[HOOK-RESULT] - selectedConversationId usado:', selectedConversationId)

  // ✅ Hook para enviar mensajes
  const sendMessageMutation = useSendMessage()

  const handleSelectConversation = (conversationId: string) => {
    console.log('[EVENT] Seleccionando conversación:', conversationId)
    setSelectedConversationId(conversationId)
    onSelectConversation?.(conversationId)
  }

  const handleSendMessage = (messageData: SendMessageData) => {
    console.log('[EVENT] Enviando mensaje:', messageData)
    
    try {
      if (onSendMessage) {
        onSendMessage(messageData)
      } else {
        // Fallback: usar mutation directamente
        sendMessageMutation.mutate(messageData)
      }
    } catch (error) {
      console.error('[EVENT] Error sending message:', error)
    }
  }

  // ✅ Verificar si hay conversaciones válidas
  if (safeConversations.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col space-y-4">
        <div className="text-gray-500 text-lg">📭 No hay conversaciones</div>
        <div className="text-sm text-gray-400 max-w-md text-center">
          No se encontraron conversaciones. Las conversaciones aparecerán aquí cuando recibas mensajes.
        </div>
      </div>
    )
  }

  return (
    <ResponsiveInboxErrorBoundary>
      <div className="flex h-full bg-white dark:bg-gray-900">
        {/* ✅ Lista de conversaciones - siempre visible en desktop, condicional en móvil */}
        <div className={`
          ${isMobile ? (selectedConversationId ? 'hidden' : 'w-full') : 'w-80 border-r border-gray-200 dark:border-gray-700'}
          flex flex-col
        `}>
          {/* ✅ Header de búsqueda */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* ✅ Lista de conversaciones filtradas */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations}
              selectedConversationId={selectedConversationId}
              onSelect={handleSelectConversation}
              onSelectConversation={handleSelectConversation}
              isLoading={false}
              error={null}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* ✅ Área de chat */}
        <div className={`
          ${isMobile ? (selectedConversationId ? 'w-full' : 'hidden') : 'flex-1'}
          flex flex-col
        `}>
          {selectedConversationId && selectedConversation ? (
            <>
              {/* ✅ Header móvil con botón volver */}
              {isMobile && (
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedConversationId(undefined)}
                    className="mr-3"
                  >
                    ← Volver
                  </Button>
                  <h3 className="font-semibold">
                    {selectedConversation.contact?.name || selectedConversation.title || 'Conversación'}
                  </h3>
                </div>
              )}

              {/* ✅ Ventana de chat */}
              <ChatWindow
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
              />
            </>
          ) : (
            /* ✅ Estado sin conversación seleccionada (solo desktop) */
            !isMobile && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                  <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </ResponsiveInboxErrorBoundary>
  )
} 