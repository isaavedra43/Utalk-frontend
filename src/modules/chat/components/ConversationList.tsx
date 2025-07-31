// Lista de conversaciones
import { useEffect } from 'react'
import { ConversationItem } from './ConversationItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { ConversationListProps } from '../types'

export function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelect, 
  isLoading = false, 
  error = null, 
  searchQuery = '', 
  onSearchChange,
}: ConversationListProps) {
  
  // ✅ VALIDACIÓN DEFENSIVA ULTRA-ROBUSTA - SIN LOGS PROBLEMÁTICOS
  const safeConversations = Array.isArray(conversations) ? conversations : []

  // ✅ ESTADOS DE CARGA Y ERROR - SIMPLIFICADOS
  if (isLoading) {
    return (
      <div className="conversation-list p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="conversation-list p-4 text-center">
        <p className="text-red-600 mb-2">Error cargando conversaciones</p>
        <p className="text-gray-500 text-sm">{String(error)}</p>
      </div>
    )
  }

  // ✅ ESTADO VACÍO - SIMPLIFICADO
  if (safeConversations.length === 0) {
    return (
      <div className="conversation-list p-8 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No hay conversaciones</p>
        <p className="text-gray-500 text-sm">Las conversaciones aparecerán aquí cuando lleguen nuevos mensajes.</p>
      </div>
    )
  }

  // ✅ FILTRADO SEGURO - SIN LOGS
  const filteredConversations = safeConversations.filter(conversation => {
    if (!searchQuery.trim()) return true
    
    const contactName = conversation?.contact?.name || ''
    const lastMessageContent = conversation?.lastMessage?.content || ''
    
    const searchLower = searchQuery.toLowerCase()
    return contactName.toLowerCase().includes(searchLower) ||
           lastMessageContent.toLowerCase().includes(searchLower)
  })

  return (
    <div className="conversation-list h-full flex flex-col bg-white">
      
      {/* ✅ BÚSQUEDA SIMPLE */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No se encontraron conversaciones que coincidan con "{searchQuery}"</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation?.id || `conv-${Math.random()}`}
                conversation={conversation}
                isSelected={selectedConversationId === conversation?.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 