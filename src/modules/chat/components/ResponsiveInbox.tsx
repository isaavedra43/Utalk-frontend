// Inbox responsivo con adaptación móvil/desktop
// ✅ REFACTORIZADO: Sin lógica de filtrado, solo renderizado
import { useState, useMemo } from 'react'
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
  const { user } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(initialConversationId)
  const [searchQuery, setSearchQuery] = useState('')
  
  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useMessages(selectedConversationId)

  const sendMessageMutation = useSendMessage()
  
  const handleSendMessage = (messageData: SendMessageData) => {
    sendMessageMutation.mutate(messageData)
    onSendMessageProp?.(messageData)
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    onSelectConversationProp?.(conversationId)
  }

  // Búsqueda local sobre las conversaciones recibidas
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    const lowercasedQuery = searchQuery.toLowerCase()
    return conversations.filter((conv) => 
      conv.contact?.name?.toLowerCase().includes(lowercasedQuery) ||
      conv.lastMessage?.content?.toLowerCase().includes(lowercasedQuery)
    )
  }, [conversations, searchQuery])

  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId)
  }, [conversations, selectedConversationId])

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