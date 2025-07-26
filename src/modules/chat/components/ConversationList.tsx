// Lista de conversaciones con filtros y búsqueda
// Componente principal para mostrar conversaciones
import { useState } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConversationItem } from './ConversationItem'
import { ConversationListProps, ConversationStatus } from '../types'
import { ConversationListSkeleton } from './LoaderSkeleton'

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  error,
  filter,
  onFilterChange,
  onRefresh
}: ConversationListProps & { onRefresh?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar conversaciones
  const filteredConversations = conversations.filter((conversation: any) => {
    // Búsqueda por texto
    const matchesSearch = !searchQuery || 
      conversation.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.contact?.phone?.includes(searchQuery) ||
      conversation.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !filter?.status || conversation.status === filter.status
    const matchesChannel = !filter?.channel || conversation.channel === filter.channel
    const matchesAssigned = !filter?.assignedTo || conversation.assignedTo?.id === filter.assignedTo

    return matchesSearch && matchesStatus && matchesChannel && matchesAssigned
  })

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    onRefresh?.()
  }

  const handleStatusFilter = (status: ConversationStatus) => {
    const newStatus = filter?.status === status ? undefined : status
    onFilterChange?.({ ...filter, status: newStatus })
  }

  if (isLoading) {
    return <ConversationListSkeleton />
  }

  if (error) {
    return (
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="text-center text-red-600 dark:text-red-400">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="font-medium mb-1">Error al cargar conversaciones</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={handleRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Conversaciones
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filters */}
        {showFilters && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter?.status === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('open')}
              >
                Abiertas
              </Button>
              <Button
                variant={filter?.status === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('pending')}
              >
                Pendientes
              </Button>
              <Button
                variant={filter?.unreadOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange?.({ ...filter, unreadOnly: !filter?.unreadOnly })}
              >
                No leídas
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="font-medium mb-1">
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </h3>
            <p className="text-sm">
              {searchQuery 
                ? 'Intenta buscar con otros términos'
                : 'Las nuevas conversaciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredConversations.length} de {conversations.length} conversaciones
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="h-6 px-2 text-xs"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationList 