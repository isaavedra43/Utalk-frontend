// Sidebar izquierdo del CRM con filtros avanzados
// Incluye filtros por estado, canal, owner, fechas y búsqueda avanzada
import { useState } from 'react'
import { Search, Filter, Users, Calendar, Tag, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  contactStatusOptions, 
  contactChannelOptions,
  type ContactStatus,
  type ContactChannel
} from './mockContacts'
import clsx from 'clsx'

interface CRMLeftSidebarProps {
  onFilterChange: (filters: CRMFilters) => void
  className?: string
}

export interface CRMFilters {
  search?: string
  status?: ContactStatus | 'all'
  channel?: ContactChannel | 'all'
  owner?: string
  dateRange?: {
    from: Date
    to: Date
  }
  tags?: string[]
}

export function CRMLeftSidebar({ onFilterChange, className }: CRMLeftSidebarProps) {
  const [filters, setFilters] = useState<CRMFilters>({
    status: 'all',
    channel: 'all'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Tags disponibles (mock)
  const availableTags = [
    'premium', 'interesado', 'precio', 'evaluando', 'reunión', 'urgente',
    'nuevo', 'anuncio', 'inactivo', 'seguimiento', 'empresarial', 'confirmado',
    'educación', 'gobierno', 'volumen', 'freelancer', 'descuento'
  ]

  // Owners disponibles (mock)
  const availableOwners = [
    'Ana Martínez', 'Luis Hernández', 'Pedro Silva', 'Carmen López'
  ]

  const updateFilters = (newFilters: Partial<CRMFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleStatusFilter = (status: ContactStatus | 'all') => {
    updateFilters({ status })
  }

  const handleChannelFilter = (channel: ContactChannel | 'all') => {
    updateFilters({ channel })
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    updateFilters({ search })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    updateFilters({ tags: newTags })
  }

  const clearAllFilters = () => {
    const clearedFilters: CRMFilters = {
      status: 'all',
      channel: 'all'
    }
    setFilters(clearedFilters)
    setSearchQuery('')
    setSelectedTags([])
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.channel !== 'all' || 
                          searchQuery || 
                          selectedTags.length > 0

  return (
    <div className={clsx('w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto', className)}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h2>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Búsqueda avanzada */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Búsqueda
          </h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, teléfono..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Filtro por Estado */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Estado del Contacto
          </h3>
          <div className="space-y-2">
            {contactStatusOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.status === option.value ? 'default' : 'ghost'}
                className={clsx(
                  'w-full justify-between',
                  filters.status === option.value 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                onClick={() => handleStatusFilter(option.value as ContactStatus | 'all')}
              >
                <span>{option.label}</span>
                <Badge variant="outline" className="text-xs">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </Card>

        {/* Filtro por Canal */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Canal de Comunicación
          </h3>
          <div className="space-y-2">
            {contactChannelOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.channel === option.value ? 'default' : 'ghost'}
                className={clsx(
                  'w-full justify-between',
                  filters.channel === option.value 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                onClick={() => handleChannelFilter(option.value as ContactChannel | 'all')}
              >
                <span>{option.label}</span>
                <Badge variant="outline" className="text-xs">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        </Card>

        {/* Filtro por Owner */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Responsable (Owner)
          </h3>
          <div className="space-y-2">
            <Button
              variant={!filters.owner ? 'default' : 'ghost'}
              className={clsx(
                'w-full justify-start',
                !filters.owner 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              onClick={() => updateFilters({ owner: undefined })}
            >
              Todos los responsables
            </Button>
            {availableOwners.map((owner) => (
              <Button
                key={owner}
                variant={filters.owner === owner ? 'default' : 'ghost'}
                className={clsx(
                  'w-full justify-start',
                  filters.owner === owner 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                onClick={() => updateFilters({ owner })}
              >
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {owner.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {owner}
              </Button>
            ))}
          </div>
        </Card>

        {/* Filtro por Tags */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Etiquetas
          </h3>
          
          {/* Tags seleccionados */}
          {selectedTags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Seleccionados:</div>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="bg-blue-500 hover:bg-blue-600 text-xs cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lista de tags disponibles */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant="ghost"
                size="sm"
                className={clsx(
                  'w-full justify-start text-xs',
                  selectedTags.includes(tag)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                onClick={() => handleTagToggle(tag)}
              >
                <Tag className="w-3 h-3 mr-2" />
                {tag}
              </Button>
            ))}
          </div>
        </Card>

        {/* Filtro por Fechas */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Rango de Fechas
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Desde</label>
              <Input 
                type="date" 
                className="mt-1"
                onChange={(e) => {
                  if (e.target.value) {
                    updateFilters({
                      dateRange: {
                        from: new Date(e.target.value),
                        to: filters.dateRange?.to || new Date()
                      }
                    })
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Hasta</label>
              <Input 
                type="date" 
                className="mt-1"
                onChange={(e) => {
                  if (e.target.value) {
                    updateFilters({
                      dateRange: {
                        from: filters.dateRange?.from || new Date(),
                        to: new Date(e.target.value)
                      }
                    })
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Filtros Activos
            </h3>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              {filters.status !== 'all' && (
                <div>Estado: {contactStatusOptions.find(o => o.value === filters.status)?.label}</div>
              )}
              {filters.channel !== 'all' && (
                <div>Canal: {contactChannelOptions.find(o => o.value === filters.channel)?.label}</div>
              )}
              {filters.owner && (
                <div>Owner: {filters.owner}</div>
              )}
              {searchQuery && (
                <div>Búsqueda: &quot;{searchQuery}&quot;</div>
              )}
              {selectedTags.length > 0 && (
                <div>Tags: {selectedTags.join(', ')}</div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CRMLeftSidebar 