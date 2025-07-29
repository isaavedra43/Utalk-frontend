// Lista de conversaciones
import { useMemo } from 'react'
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
  // Filtrar conversaciones por búsqueda local
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations
    const lowercasedQuery = searchQuery.toLowerCase()
    return conversations.filter((conversation) => {
      const matchesSearch = !searchQuery ||
        conversation.contact?.name?.toLowerCase().includes(lowercasedQuery) ||
        conversation.contact?.phone?.includes(searchQuery) ||
        conversation.lastMessage?.content?.toLowerCase().includes(lowercasedQuery)

      return matchesSearch
    })
  }, [conversations, searchQuery])

  if (isLoading) {
    return (
      <div className="h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error al cargar conversaciones</p>
      </div>
    )
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No hay conversaciones</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer con count */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        {filteredConversations.length} conversación{filteredConversations.length !== 1 ? 'es' : ''}
      </div>
    </div>
  )
} 