// Inbox responsivo con adaptación móvil/desktop
// ✅ REFACTORIZADO: Sin lógica de filtrado, solo renderizado
import { useState, useMemo, useEffect } from 'react'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import type { 
  ResponsiveInboxProps, 
  SendMessageData, 
} from '../types'

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

  // Búsqueda local sobre las conversaciones recibidas
  const filteredConversations = useMemo(() => {
    console.log('[FILTER] ResponsiveInbox.tsx: Calculando filteredConversations')
    console.log('[FILTER] - conversations entrada:', conversations)
    console.log('[FILTER] - searchQuery:', searchQuery)
    console.log('[FILTER] - conversations es array:', Array.isArray(conversations))
    console.log('[FILTER] - conversations length:', conversations?.length)
    
    if (!searchQuery) {
      console.log('[FILTER] - Sin searchQuery, retornando conversations original')
      console.log('[FILTER] - Resultado sin filtro:', conversations)
      return conversations
    }
    
    const lowercasedQuery = searchQuery.toLowerCase()
    console.log('[FILTER] - Aplicando filtro con query:', lowercasedQuery)
    
    if (!Array.isArray(conversations)) {
      console.warn('[FILTER] - conversations no es array, retornando array vacío')
      return []
    }
    
    const filtered = conversations.filter((conv) => {
      const contactNameMatch = conv.contact?.name?.toLowerCase().includes(lowercasedQuery)
      const lastMessageMatch = conv.lastMessage?.content?.toLowerCase().includes(lowercasedQuery)
      const matches = contactNameMatch || lastMessageMatch
      
      console.log(`[FILTER] - Conversación ${conv.id}:`, {
        contactName: conv.contact?.name,
        lastMessageContent: conv.lastMessage?.content,
        contactNameMatch,
        lastMessageMatch,
        matches
      })
      
      return matches
    })
    
    console.log('[FILTER] - Resultado filtrado:', filtered)
    console.log('[FILTER] - Longitud resultado:', filtered.length)
    
    return filtered
  }, [conversations, searchQuery])

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
  console.log('[RENDER] - filteredConversations:', filteredConversations)
  console.log('[RENDER] - filteredConversations length:', filteredConversations?.length)
  console.log('[RENDER] - selectedConversation:', selectedConversation)
  console.log('[RENDER] - selectedConversationId:', selectedConversationId)
  console.log('[RENDER] - messages:', messages)
  console.log('[RENDER] - messagesLoading:', messagesLoading)

  // Logs adicionales para el renderizado
  console.log('[RENDER] ResponsiveInbox.tsx: Renderizando ConversationList con props:', {
    conversations: filteredConversations,
    conversationsLength: filteredConversations?.length,
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

  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-800">
      <aside className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
          isLoading={false}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </aside>
      
      <main className={`w-full md:w-2/3 lg:w-3/4 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            isLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            currentUserEmail={user?.email || ''}
            typingUsers={[]} // Placeholder for typing users
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <h2 className="text-xl font-medium">Selecciona una conversación</h2>
            <p>Elige una conversación de la lista para ver los mensajes.</p>
          </div>
        )}
      </main>
    </div>
  )
} 