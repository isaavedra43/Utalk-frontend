// Lista de conversaciones
import { useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

  // ✅ PASO 3: ÚNICO PUNTO DE FILTRADO - ConversationList
  // ResponsiveInbox ya NO filtra, solo ConversationList filtra por búsqueda
  const filteredConversations = useMemo(() => {
    console.log('[FILTER] ConversationList.tsx: ✅ ÚNICO PUNTO DE FILTRADO')
    console.log('[FILTER] - conversations entrada:', conversations)
    console.log('[FILTER] - searchQuery:', searchQuery)
    console.log('[FILTER] - conversations es array:', Array.isArray(conversations))
    console.log('[FILTER] - conversations length:', conversations?.length)
    
    if (!searchQuery) {
      console.log('[FILTER] - Sin searchQuery, retornando conversations original')
      console.log('[FILTER] - Resultado sin filtro:', conversations)
      return conversations || []
    }
    
    if (!Array.isArray(conversations)) {
      console.warn('[FILTER] - conversations no es array, retornando array vacío')
      return []
    }
    
    const lowercasedQuery = searchQuery.toLowerCase()
    console.log('[FILTER] - ✅ APLICANDO FILTRO ÚNICO con query:', lowercasedQuery)
    
    const filtered = conversations.filter((conversation) => {
      console.log(`[FILTER] - Evaluando conversación ${conversation?.id}:`)
      
      const hasContact = !!conversation?.contact
      const hasLastMessage = !!conversation?.lastMessage
      console.log(`[FILTER] - hasContact: ${hasContact}, hasLastMessage: ${hasLastMessage}`)
      
      const contactName = conversation?.contact?.name
      const contactPhone = conversation?.contact?.phone
      const lastMessageContent = conversation?.lastMessage?.content
      
      console.log(`[FILTER] - contactName: "${contactName}", contactPhone: "${contactPhone}", lastMessageContent: "${lastMessageContent?.substring(0, 30)}..."`)
      
      const nameMatch = contactName?.toLowerCase().includes(lowercasedQuery)
      const phoneMatch = contactPhone?.includes(searchQuery)
      const messageMatch = lastMessageContent?.toLowerCase().includes(lowercasedQuery)
      
      const matches = nameMatch || phoneMatch || messageMatch
      
      console.log(`[FILTER] - Conversación ${conversation?.id}:`, {
        contactName,
        contactPhone,
        lastMessageContent: lastMessageContent?.substring(0, 30),
        nameMatch,
        phoneMatch,
        messageMatch,
        matches
      })
      
      return matches
    })
    
    console.log('[FILTER] - ✅ FILTRO ÚNICO COMPLETADO')
    console.log('[FILTER] - Resultado filtrado:', filtered)
    console.log('[FILTER] - Longitud resultado:', filtered.length)
    console.log('[FILTER] - IDs filtrados:', filtered.map(c => c.id))
    
    return filtered
  }, [conversations, searchQuery])

  console.log('[RENDER] ConversationList.tsx: Preparando render final')
  console.log('[RENDER] - filteredConversations:', filteredConversations)
  console.log('[RENDER] - filteredConversations length:', filteredConversations?.length)
  console.log('[RENDER] - isLoading:', isLoading)
  console.log('[RENDER] - error:', error)

  if (isLoading) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado de carga')
    return (
      <div className="h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado de error')
    console.log('[ERROR] - error:', error)
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error al cargar conversaciones</p>
      </div>
    )
  }

  console.log('[RENDER] ConversationList.tsx: Renderizando lista normal')
  console.log('[RENDER] - Número de conversaciones a renderizar:', filteredConversations?.length)

  // Log para estado vacío o con datos
  if (filteredConversations?.length === 0) {
    console.log('[RENDER] ConversationList.tsx: Renderizando estado vacío')
  } else {
    console.log('[RENDER] ConversationList.tsx: Renderizando lista de conversaciones')
    console.log('[RENDER] - Conversaciones a mapear:', filteredConversations?.length)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => {
              console.log('[INPUT] ConversationList.tsx: onChange ejecutado')
              console.log('[INPUT] - Nuevo valor:', e.target.value)
              console.log('[INPUT] - onSearchChange:', typeof onSearchChange)
              
              if (onSearchChange) {
                onSearchChange(e.target.value)
                console.log('[INPUT] - onSearchChange ejecutado con:', e.target.value)
              } else {
                console.warn('[INPUT] - onSearchChange no está disponible')
              }
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No hay conversaciones</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations?.map((conversation, index) => {
              console.log(`[MAP] ConversationList.tsx: Renderizando conversación ${index + 1}/${filteredConversations.length}:`, {
                id: conversation?.id,
                contactName: conversation?.contact?.name,
                isSelected: conversation?.id === selectedConversationId,
                hasOnSelect: typeof onSelect
              })
              
              return (
                <ConversationItem
                  key={conversation?.id || `conv-${index}`}
                  conversation={conversation}
                  isSelected={conversation?.id === selectedConversationId}
                  onSelect={() => {
                    console.log('[HANDLER] ConversationList.tsx: ConversationItem onSelect llamado')
                    console.log('[HANDLER] - conversationId:', conversation?.id)
                    console.log('[HANDLER] - onSelect:', typeof onSelect)
                    
                    if (onSelect && conversation?.id) {
                      console.log('[HANDLER] - Ejecutando onSelect con ID:', conversation.id)
                      onSelect(conversation.id)
                    } else {
                      console.warn('[HANDLER] - No se puede ejecutar onSelect:', {
                        hasOnSelect: !!onSelect,
                        hasConversationId: !!conversation?.id
                      })
                    }
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Footer con count */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        {(() => {
          console.log('[RENDER] ConversationList.tsx: Renderizando footer con count:', filteredConversations?.length)
          return null
        })()}
        {filteredConversations?.length || 0} conversación{(filteredConversations?.length || 0) !== 1 ? 'es' : ''}
      </div>
    </div>
  )
} 