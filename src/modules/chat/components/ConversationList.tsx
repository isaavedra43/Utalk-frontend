// Lista de conversaciones con filtros y búsqueda
// Componente principal para mostrar conversaciones
import { useState } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConversationItem } from './ConversationItem'
import { ConversationListProps } from '../types'
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

  if (isLoading) {
    return <ConversationListSkeleton />
  }

  if (error) {
    return (
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversaciones
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center text-red-600 dark:text-red-400 py-8">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-medium mb-2">Error al cargar</h3>
            <p className="text-sm text-gray-500">
              No se pudieron cargar las conversaciones
            </p>
            <Button
              onClick={handleRefresh}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversaciones
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700"
            title="Actualizar conversaciones"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-sm ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtros
          </Button>
          
          {(filter?.status || filter?.channel) && (
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Filtros activos:</span>
                {filter?.status && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {filter.status}
                  </span>
                )}
                {filter?.channel && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    {filter.channel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Estado
              </label>
              <div className="flex flex-wrap gap-1">
                {['open', 'closed', 'pending'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filter?.status === status ? 'default' : 'outline'}
                    className="text-xs h-6"
                    onClick={() => onFilterChange?.({ ...filter, status: filter?.status === status ? undefined : status as any })}
                  >
                    {status === 'open' ? 'Abiertas' : 
                     status === 'closed' ? 'Cerradas' : 'Pendientes'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Canal
              </label>
              <div className="flex flex-wrap gap-1">
                {['whatsapp', 'email', 'web'].map((channel) => (
                  <Button
                    key={channel}
                    size="sm"
                    variant={filter?.channel === channel ? 'default' : 'outline'}
                    className="text-xs h-6"
                    onClick={() => onFilterChange?.({ ...filter, channel: filter?.channel === channel ? undefined : channel as any })}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-medium mb-1">No se encontraron conversaciones</h3>
                                 <p className="text-sm">
                   No hay conversaciones que coincidan con &quot;{searchQuery}&quot;
                 </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-lg font-medium mb-1">No hay conversaciones</h3>
                <p className="text-sm">
                  Las nuevas conversaciones aparecerán aquí
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={() => onSelectConversation(conversation.id)}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{filteredConversations.length} conversaciones</span>
          <span>
            {conversations.filter(c => c.unreadCount > 0).length} no leídas
          </span>
        </div>
      </div>
    </div>
  )
}

export default ConversationList 