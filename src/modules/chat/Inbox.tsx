// Componente principal Inbox
import { useState } from 'react'
import { ResponsiveInbox } from './components/ResponsiveInbox'
import { useConversations } from './hooks/useConversations'
import type { InboxProps } from './types'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function Inbox({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: InboxProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  )

  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError,
  } = useConversations()
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    onSelectConversation?.(conversationId)
  }

  if (conversationsLoading) {
    return <div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>
  }

  if (conversationsError) {
    return <div className="flex h-full w-full items-center justify-center text-red-500">Error al cargar las conversaciones.</div>
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <ResponsiveInbox
        conversations={conversations}
        initialConversationId={selectedConversationId}
        onSendMessage={onSendMessage}
        onSelectConversation={handleSelectConversation}
      />
    </div>
  )
} 