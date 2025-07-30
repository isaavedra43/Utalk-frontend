// Componente principal Inbox
import { useState, useEffect } from 'react'
import { ResponsiveInbox } from './components/ResponsiveInbox'
import { useConversations } from './hooks/useConversations'
import { AuthWrapper } from '@/components/common/AuthWrapper'
import type { InboxProps } from './types'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function Inbox({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: InboxProps) {
  console.log('[COMPONENT] Inbox.tsx: Componente renderizado')
  console.log('[PROP] Inbox.tsx: Props recibidas:')
  console.log('[PROP] - initialConversationId:', initialConversationId, 'Type:', typeof initialConversationId)
  console.log('[PROP] - onSendMessage:', typeof onSendMessage)
  console.log('[PROP] - onSelectConversation:', typeof onSelectConversation)

  return (
    <AuthWrapper fallback={<div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>}>
      <InboxContent 
        initialConversationId={initialConversationId}
        onSendMessage={onSendMessage}
        onSelectConversation={onSelectConversation}
      />
    </AuthWrapper>
  )
}

function InboxContent({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: InboxProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  )
  
  console.log('[STATE] Inbox.tsx: selectedConversationId inicial:', selectedConversationId)

  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError,
  } = useConversations()

  console.log('[HOOK-RESULT] Inbox.tsx: Resultado de useConversations:')
  console.log('[HOOK-RESULT] - conversations:', conversations)
  console.log('[HOOK-RESULT] - Tipo de conversations:', typeof conversations)
  console.log('[HOOK-RESULT] - Es array:', Array.isArray(conversations))
  console.log('[HOOK-RESULT] - Longitud:', conversations?.length)
  console.log('[HOOK-RESULT] - isLoading:', conversationsLoading)
  console.log('[HOOK-RESULT] - error:', conversationsError)
  
  if (conversations && Array.isArray(conversations)) {
    console.log('[HOOK-RESULT] Inbox.tsx: Detalle de conversaciones recibidas:')
    conversations.forEach((conv, index) => {
      console.log(`[HOOK-RESULT] Conversación ${index + 1}:`, {
        id: conv?.id,
        hasContact: !!conv?.contact,
        contactName: conv?.contact?.name,
        hasLastMessage: !!conv?.lastMessage,
        status: conv?.status
      })
    })
  } else {
    console.warn('[HOOK-RESULT] Inbox.tsx: conversations no es un array válido:', conversations)
  }

  useEffect(() => {
    console.log('[EFFECT] Inbox.tsx: useEffect ejecutado por cambio en initialConversationId')
    console.log('[EFFECT] - initialConversationId:', initialConversationId)
    console.log('[EFFECT] - selectedConversationId actual:', selectedConversationId)
    
    if (initialConversationId && initialConversationId !== selectedConversationId) {
      console.log('[EFFECT] Inbox.tsx: Actualizando selectedConversationId')
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])
  
  const handleSelectConversation = (conversationId: string) => {
    console.log('[HANDLER] Inbox.tsx: handleSelectConversation llamado')
    console.log('[HANDLER] - conversationId:', conversationId, 'Type:', typeof conversationId)
    
    setSelectedConversationId(conversationId)
    console.log('[HANDLER] - selectedConversationId actualizado a:', conversationId)
    
    if (onSelectConversation) {
      console.log('[HANDLER] - Llamando callback onSelectConversation')
      onSelectConversation(conversationId)
    } else {
      console.log('[HANDLER] - No hay callback onSelectConversation')
    }
  }

  if (conversationsLoading) {
    console.log('[RENDER] Inbox.tsx: Renderizando estado de carga')
    return <div className="flex h-full w-full items-center justify-center"><LoadingSpinner /></div>
  }

  if (conversationsError) {
    console.log('[RENDER] Inbox.tsx: Renderizando estado de error')
    console.log('[ERROR] - conversationsError:', conversationsError)
    return <div className="flex h-full w-full items-center justify-center text-red-500">Error al cargar las conversaciones.</div>
  }

  console.log('[RENDER] Inbox.tsx: Renderizando ResponsiveInbox con props:')
  console.log('[RENDER] - conversations:', conversations)
  console.log('[RENDER] - conversations length:', conversations?.length)
  console.log('[RENDER] - selectedConversationId:', selectedConversationId)
  console.log('[RENDER] - onSendMessage:', typeof onSendMessage)
  console.log('[RENDER] - handleSelectConversation:', typeof handleSelectConversation)

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