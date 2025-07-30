// Lista de conversaciones
import { useEffect } from 'react'
import { ConversationItem } from './ConversationItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { ConversationListProps } from '../types'

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
  onSelectConversation,
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

  // ✅ VALIDACIÓN DEFENSIVA ULTRA-ROBUSTA
  const safeConversations = Array.isArray(conversations) ? conversations : []
  const hasValidConversations = safeConversations.length > 0

  console.log('[VALIDATION] ConversationList validation:', {
    originalLength: conversations?.length,
    safeLength: safeConversations.length,
    hasValidConversations,
    isLoading,
    hasError: !!error
  })

  if (conversations && Array.isArray(conversations)) {
    console.log('[PROP] ConversationList.tsx: Detalle de conversaciones recibidas:')
    conversations.forEach((conv, index) => {
      console.log(`[PROP] Conversación ${index + 1}:`, {
        id: conv?.id,
        title: conv?.title,
        hasContact: !!conv?.contact,
        contactName: conv?.contact?.name,
        status: conv?.status,
        lastMessageContent: conv?.lastMessage?.content?.substring(0, 50)
      })
    })
  }

  // ✅ ESTADO DE CARGA
  if (isLoading) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado de carga')
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando conversaciones...</span>
      </div>
    )
  }

  // ✅ ESTADO DE ERROR
  if (error) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado de error:', error)
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">❌ Error al cargar conversaciones</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {typeof error === 'string' ? error : 'Error desconocido'}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Recargar
        </button>
      </div>
    )
  }

  // ✅ ESTADO SIN CONVERSACIONES
  if (!hasValidConversations) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado sin conversaciones')
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No hay conversaciones
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Las conversaciones aparecerán aquí cuando recibas mensajes de tus clientes.
        </p>
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left">
          <div className="font-semibold mb-1">Debug Info:</div>
          <div>Conversations type: {typeof conversations}</div>
          <div>Is array: {Array.isArray(conversations) ? 'Yes' : 'No'}</div>
          <div>Length: {conversations?.length || 0}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
        </div>
      </div>
    )
  }

  // ✅ RENDERIZADO PRINCIPAL
  console.log('[RENDER] ConversationList.tsx: Renderizando lista de conversaciones')
  console.log('[RENDER] - Total conversations to render:', safeConversations.length)

  return (
    <div className="h-full overflow-y-auto">
      {safeConversations.map((conversation, index) => {
        console.log(`[RENDER] Rendering conversation ${index + 1}:`, {
          id: conversation?.id,
          title: conversation?.title,
          isSelected: conversation?.id === selectedConversationId
        })

        // ✅ VALIDACIÓN POR CONVERSACIÓN
        if (!conversation || !conversation.id) {
          console.warn(`[RENDER] Skipping invalid conversation at index ${index}:`, conversation)
          return (
            <div key={`invalid-${index}`} className="p-4 border-b border-gray-200 bg-yellow-50">
              <div className="text-yellow-600 text-sm">
                ⚠️ Conversación inválida #{index + 1}
              </div>
            </div>
          )
        }

        try {
          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={onSelect}
              showAvatar={true}
            />
          )
        } catch (error) {
          console.error(`[RENDER] Error rendering conversation ${conversation.id}:`, error)
          return (
            <div key={`error-${conversation.id}`} className="p-4 border-b border-gray-200 bg-red-50">
              <div className="text-red-600 text-sm">
                ❌ Error renderizando conversación: {conversation.id}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </div>
            </div>
          )
        }
      })}
    </div>
  )
} 