// Lista de mensajes de una conversación
// Renderiza mensajes con scroll virtual, estados de lectura y tiempo real
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMessages } from '../hooks/useMessages'
import { useTypingIndicators } from '../hooks/useSocket'
import { MessageBubble } from './MessageBubble'
import { useAuth } from '@/contexts/AuthContext'
import type { CanonicalMessage } from '@/types/canonical'

interface MessageListProps {
  conversationId: string
}

export function MessageList({ conversationId }: MessageListProps) {
  const { user } = useAuth()
  
  // ✅ Obtener mensajes reales
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError
  } = useMessages(conversationId)
  
  // ✅ Obtener typing indicators
  const typingUsers = useTypingIndicators(conversationId)

  // ✅ DEBUG: Logging de debug mejorado
  console.log('[MESSAGE-LIST] Rendering with:', {
    conversationId,
    messagesCount: messages?.length,
    messages: messages?.slice(-3), // Últimos 3 mensajes
    isLoading: messagesLoading,
    error: messagesError,
    typingUsersCount: typingUsers.length,
    hasValidMessages: messages && messages.length > 0
  })

  if (messagesLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          Cargando mensajes...
        </div>
      </div>
    )
  }

  if (messagesError) {
    console.error('[MESSAGE-LIST] Error loading messages:', messagesError)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-red-500 py-4">
          Error al cargar mensajes: {messagesError instanceof Error ? messagesError.message : 'Error desconocido'}
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    console.log('[MESSAGE-LIST] No messages found for conversation:', conversationId)
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-sm text-muted-foreground py-4">
          No hay mensajes en esta conversación
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* ✅ Mensajes reales */}
      {messages.map((message: CanonicalMessage) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.sender.email === user?.email}
        />
      ))}
      
      {/* ✅ Typing indicators */}
      {typingUsers.map((typingUser) => (
        <div key={typingUser.userEmail} className="flex space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {typingUser.userName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-lg px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 