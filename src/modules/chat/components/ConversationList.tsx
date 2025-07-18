// Lista de conversaciones con filtros, búsqueda y tabs
// Panel central que muestra todas las conversaciones filtradas
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MoreVertical, Filter, SortDesc } from 'lucide-react'
import { ConversationListProps } from '../types'
import ConversationItem from './ConversationItem'
import { ConversationListSkeleton } from './LoaderSkeleton'

const filterTabs = [
  { key: 'all', label: 'Todas', icon: '💬' },
  { key: 'open', label: 'Abiertas', icon: '🟢' },
  { key: 'pending', label: 'Pendientes', icon: '🟡' },
  { key: 'closed', label: 'Cerradas', icon: '⚫' }
]

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  filter,
  onFilterChange
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState(filter.search || '')
  const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    const newFilter = { ...filter }
    
    if (tab === 'all') {
      delete newFilter.status
    } else {
      newFilter.status = tab as any
    }
    
    onFilterChange(newFilter)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange({ ...filter, search: value })
  }

  const handleSortChange = () => {
    const nextSort = sortBy === 'recent' ? 'unread' : sortBy === 'unread' ? 'name' : 'recent'
    setSortBy(nextSort)
    // TODO: Implementar ordenamiento en el servicio
  }

  // Contar conversaciones por estado
  const getTabCount = (status: string) => {
    if (status === 'all') return conversations.length
    return conversations.filter(conv => conv.status === status).length
  }

  const getSortLabel = () => {
    switch (sortBy) {
      case 'recent': return 'Recientes'
      case 'unread': return 'No leídos'
      case 'name': return 'Nombre'
      default: return 'Recientes'
    }
  }

  if (isLoading) {
    return <ConversationListSkeleton />
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversaciones
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSortChange}
              className="text-gray-500 hover:text-gray-700"
              title={`Ordenar por: ${getSortLabel()}`}
            >
              <SortDesc className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs de filtros */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {filterTabs.map((tab) => {
            const count = getTabCount(tab.key)
            const isActive = activeTab === tab.key
            
            return (
              <Button
                key={tab.key}
                variant="ghost"
                onClick={() => handleTabChange(tab.key)}
                className={`
                  flex-1 rounded-none border-b-2 transition-all
                  ${isActive 
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant={isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {count}
                    </Badge>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Filtros activos */}
      {(filter.search || filter.assignedTo || filter.tags?.length) && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Filtros activos:
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange({})}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {filter.search && (
                             <Badge variant="outline" className="text-xs">
                 Búsqueda: &quot;{filter.search}&quot;
               </Badge>
            )}
            {filter.assignedTo && (
              <Badge variant="outline" className="text-xs">
                Asignado: {filter.assignedTo}
              </Badge>
            )}
            {filter.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-sm font-medium mb-1">No hay conversaciones</h3>
            <p className="text-xs text-center">
              {filter.search 
                ? 'No se encontraron resultados para tu búsqueda'
                : 'Las nuevas conversaciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
          </span>
          <span>
            Ordenado por: {getSortLabel()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ConversationList 