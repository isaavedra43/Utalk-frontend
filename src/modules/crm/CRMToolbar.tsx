// Barra de herramientas del CRM
// Contiene botones de acción, filtros, búsqueda y cambio de vista
import { useState } from 'react'
import { Search, Plus, Filter, Download, Table, Grid3X3, MoreHorizontal, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx'

export type CRMViewMode = 'table' | 'cards'

interface CRMToolbarProps {
  viewMode: CRMViewMode
  onViewModeChange: (mode: CRMViewMode) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewContact?: () => void
  onExportCSV?: () => void
  onShowFilters?: () => void
  selectedCount?: number
  totalCount?: number
  className?: string
}

export function CRMToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onNewContact,
  onExportCSV,
  onShowFilters,
  selectedCount = 0,
  totalCount = 0,
  className
}: CRMToolbarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)

  return (
    <div className={clsx('flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
      {/* Lado izquierdo - Título y acciones principales */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Gestión de Contactos
          </h1>
          {totalCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {totalCount} contactos
            </Badge>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onNewContact}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>

          <Button
            variant="outline"
            onClick={onShowFilters}
            className="hidden sm:flex"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>

          <Button
            variant="outline"
            onClick={onExportCSV}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>

          {/* Menú adicional para mobile */}
          <Button variant="outline" className="sm:hidden">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lado derecho - Búsqueda y controles de vista */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
        {/* Contador de seleccionados */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {selectedCount} seleccionados
            </Badge>
            <Button variant="outline" size="sm">
              Acciones masivas
            </Button>
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative flex-1 lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar contactos por nombre, email, teléfono..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          )}
        </div>

        {/* Controles de vista y ordenamiento */}
        <div className="flex items-center gap-2">
          {/* Ordenamiento */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="hidden sm:flex"
            >
              <SortDesc className="w-4 h-4 mr-2" />
              Ordenar
            </Button>

            {/* Menú de ordenamiento */}
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Nombre A-Z
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Última actividad
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Estado
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Valor del cliente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Toggle de vista tabla/tarjetas */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className={clsx(
                'px-3 py-1.5',
                viewMode === 'table'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:block ml-2">Tabla</span>
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className={clsx(
                'px-3 py-1.5',
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:block ml-2">Tarjetas</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros activos (se muestra debajo en mobile) */}
      {searchQuery && (
        <div className="flex items-center gap-2 w-full lg:hidden">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtrando por:</span>
          <Badge variant="outline" className="text-xs">
            &quot;{searchQuery}&quot;
          </Badge>
        </div>
      )}
    </div>
  )
}

export default CRMToolbar