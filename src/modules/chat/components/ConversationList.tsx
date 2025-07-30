// Lista de conversaciones
import { useEffect } from 'react'
import { ConversationItem } from './ConversationItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { ConversationListProps } from '../types'

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  console.log('[COMPONENT] ConversationList.tsx: Componente renderizado')
  console.log('[PROP] ConversationList.tsx: Props recibidas:')
  console.log('[PROP] - conversations:', conversations)
  console.log('[PROP] - Tipo de conversations:', typeof conversations)
  console.log('[PROP] - Es array:', Array.isArray(conversations))
  console.log('[PROP] - Longitud:', conversations?.length)
  console.log('[PROP] - selectedConversationId:', selectedConversationId, 'Type:', typeof selectedConversationId)
  console.log('[PROP] - onSelect:', typeof onSelect)
  console.log('[PROP] - isLoading:', isLoading, 'Type:', typeof isLoading)
  console.log('[PROP] - error:', error, 'Type:', typeof error)
  console.log('[PROP] - searchQuery:', searchQuery, 'Type:', typeof searchQuery)
  console.log('[PROP] - onSearchChange:', typeof onSearchChange)

  if (conversations && Array.isArray(conversations)) {
    console.log('[PROP] ConversationList.tsx: Detalle de conversaciones recibidas:')
    conversations.forEach((conv, index) => {
      console.log(`[PROP] Conversación ${index + 1}:`, {
        id: conv?.id,
        hasContact: !!conv?.contact,
        contactName: conv?.contact?.name,
        hasLastMessage: !!conv?.lastMessage,
        lastMessageContent: conv?.lastMessage?.content?.substring(0, 50),
        status: conv?.status,
        channel: conv?.channel
      })
    })
  } else {
    console.warn('[PROP] ConversationList.tsx: conversations no es un array válido:', conversations)
  }

  useEffect(() => {
    console.log('[EFFECT] ConversationList.tsx: useEffect ejecutado por cambios en props')
    console.log('[EFFECT] - conversations length:', conversations?.length)
    console.log('[EFFECT] - searchQuery:', searchQuery)
    console.log('[EFFECT] - selectedConversationId:', selectedConversationId)
  }, [conversations, searchQuery, selectedConversationId])

  // ✅ Renderizado condicional mejorado
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error al cargar conversaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery 
              ? `No se encontraron conversaciones que coincidan con "${searchQuery}"`
              : 'Aún no tienes conversaciones activas'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto conversation-list-container">
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
            onSelect={onSelect}
            showAvatar={true}
          />
        ))}
      </div>
      
      {/* Footer con contador */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
        </p>
      </div>
    </div>
  )
} 