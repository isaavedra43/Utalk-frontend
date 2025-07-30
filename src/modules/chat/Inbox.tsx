// Componente principal Inbox
import { useState, useEffect } from 'react'
import { ResponsiveInbox } from './components/ResponsiveInbox'
import { useConversations } from './hooks/useConversations'
import { useAuth } from '@/contexts/AuthContext'
import type { InboxProps } from './types'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export function Inbox({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: InboxProps) {
  console.log('[COMPONENT] Inbox.tsx: Componente renderizado')
  console.log('[PROP] Inbox.tsx: Props recibidas:', {
    initialConversationId,
    onSendMessage: typeof onSendMessage,
    onSelectConversation: typeof onSelectConversation
  })

  // ✅ VERIFICAR ESTADO DE AUTH
  const { isAuthReady, isAuthenticated, user, error } = useAuth()
  
  // ✅ CORREGIDO: Validación defensiva para evitar TypeError
  const currentUser = user || {}
  const userEmail = (currentUser as any)?.email || 'unknown@email.com'
  const userName = (currentUser as any)?.name || 'Usuario'
  const userRole = (currentUser as any)?.role || 'user'
  
  console.log('[AUTH] Inbox.tsx: Estado de autenticación:', {
    isAuthReady,
    isAuthenticated,
    hasUser: !!user,
    error,
    userEmail,
    userName,
    userRole
  })

  // ✅ MOSTRAR ESTADO MIENTRAS CARGA AUTH
  if (!isAuthReady) {
    console.log('[RENDER] Inbox.tsx: Auth no lista, mostrando loading')
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2">Inicializando autenticación...</span>
      </div>
    )
  }

  // ✅ MOSTRAR MENSAJE SI NO ESTÁ AUTENTICADO
  if (!isAuthenticated || !user) {
    console.log('[RENDER] Inbox.tsx: Usuario no autenticado')
    return (
      <div className="flex h-full w-full items-center justify-center flex-col">
        <div className="text-gray-500 mb-4">⚠️ No autenticado</div>
        <div className="text-sm text-gray-400">
          {error || 'Necesitas iniciar sesión para ver las conversaciones'}
        </div>
      </div>
    )
  }

  // ✅ RENDERIZAR CONTENIDO AUTENTICADO
  console.log('[RENDER] Inbox.tsx: Usuario autenticado, renderizando InboxContent')
  return (
    <InboxContent 
      initialConversationId={initialConversationId}
      onSendMessage={onSendMessage}
      onSelectConversation={onSelectConversation}
    />
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
  
  console.log('[STATE] InboxContent: selectedConversationId inicial:', selectedConversationId)

  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError,
  } = useConversations()

  console.log('[HOOK-RESULT] InboxContent: Resultado de useConversations:', {
    conversations,
    isArray: Array.isArray(conversations),
    length: conversations?.length,
    isLoading: conversationsLoading,
    error: conversationsError
  })

  useEffect(() => {
    console.log('[EFFECT] InboxContent: useEffect ejecutado por cambio en initialConversationId')
    if (initialConversationId && initialConversationId !== selectedConversationId) {
      console.log('[EFFECT] InboxContent: Actualizando selectedConversationId')
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])
  
  const handleSelectConversation = (conversationId: string) => {
    console.log('[HANDLER] InboxContent: handleSelectConversation llamado:', conversationId)
    setSelectedConversationId(conversationId)
    onSelectConversation?.(conversationId)
  }

  if (conversationsLoading) {
    console.log('[RENDER] InboxContent: Renderizando estado de carga')
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2">Cargando conversaciones...</span>
      </div>
    )
  }

  if (conversationsError) {
    console.log('[RENDER] InboxContent: Renderizando estado de error:', conversationsError)
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500 flex-col">
        <div>❌ Error al cargar las conversaciones</div>
        <div className="text-sm mt-2 text-gray-600">
          {conversationsError instanceof Error ? conversationsError.message : 'Error desconocido'}
        </div>
      </div>
    )
  }

  console.log('[RENDER] InboxContent: Renderizando ResponsiveInbox')
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