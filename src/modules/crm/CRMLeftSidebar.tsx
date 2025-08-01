// Sidebar izquierdo del CRM con filtros avanzados
// Incluye filtros por estado, canal, owner, fechas y búsqueda avanzada
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Tipos para los filtros
export interface CRMFilters {
  search: string
  status: string[]
  channel: string[]
  owner: string[]
  dateRange: string
  tags: string[]
}

// Opciones de filtros (mock data)
const contactStatusOptions = [
  { value: 'new', label: 'Nuevo', count: 12 },
  { value: 'contacted', label: 'Contactado', count: 8 },
  { value: 'qualified', label: 'Calificado', count: 15 },
  { value: 'proposal', label: 'Propuesta', count: 6 },
  { value: 'negotiation', label: 'Negociación', count: 4 },
  { value: 'closed', label: 'Cerrado', count: 22 }
]

const contactChannelOptions = [
  { value: 'email', label: 'Email', count: 25 },
  { value: 'phone', label: 'Teléfono', count: 18 },
  { value: 'linkedin', label: 'LinkedIn', count: 12 },
  { value: 'website', label: 'Website', count: 8 },
  { value: 'referral', label: 'Referido', count: 5 }
]

const contactOwnerOptions = [
  { value: 'me', label: 'Yo', count: 15 },
  { value: 'team', label: 'Equipo', count: 32 },
  { value: 'unassigned', label: 'Sin asignar', count: 8 }
]

const contactDateRangeOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' }
]

interface CRMLeftSidebarProps {
  filters: CRMFilters
  onFiltersChange: (filters: CRMFilters) => void
  onClearFilters: () => void
}

export default function CRMLeftSidebar({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: CRMLeftSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = (key: keyof CRMFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: keyof CRMFilters, value: string) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    updateFilter(key, newValues)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  )

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros CRM
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Filtros activos
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Búsqueda
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <div className="space-y-2">
              {contactStatusOptions.map((option) => (
                <label key={option.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => toggleArrayFilter('status', option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Canal
            </label>
            <div className="space-y-2">
              {contactChannelOptions.map((option) => (
                <label key={option.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.channel.includes(option.value)}
                      onChange={() => toggleArrayFilter('channel', option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Propietario
            </label>
            <div className="space-y-2">
              {contactOwnerOptions.map((option) => (
                <label key={option.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.owner.includes(option.value)}
                      onChange={() => toggleArrayFilter('owner', option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de fechas
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Todos los períodos</option>
              {contactDateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
} 