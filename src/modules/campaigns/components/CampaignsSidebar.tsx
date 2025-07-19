// 🗂️ SIDEBAR DE CAMPAÑAS - UTalk Frontend
// Panel lateral con filtros avanzados y navegación

import React, { useState } from 'react'
import { X, Calendar, Filter, Tag, User, Search, ChevronDown, ChevronUp } from 'lucide-react'
import type { CampaignFilters } from '../types'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS, CHANNEL_LABELS } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface CampaignsSidebarProps {
  onClose: () => void
  filters: CampaignFilters
  onFiltersChange: (filters: Partial<CampaignFilters>) => void
}

/**
 * 🎯 SIDEBAR DE FILTROS Y NAVEGACIÓN
 */
export function CampaignsSidebar({ onClose, filters, onFiltersChange }: CampaignsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    type: true,
    channels: true,
    dates: false,
    advanced: false
  })

  // ✅ TOGGLE SECCIÓN
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // ✅ MANEJAR FILTROS DE ESTADO
  const handleStatusFilter = (status: string, checked: boolean) => {
    const currentStatus = filters.status || []
    if (checked) {
      onFiltersChange({ 
        status: [...currentStatus, status as any],
        page: 1 
      })
    } else {
      onFiltersChange({ 
        status: currentStatus.filter(s => s !== status),
        page: 1 
      })
    }
  }

  // ✅ MANEJAR FILTROS DE TIPO
  const handleTypeFilter = (type: string, checked: boolean) => {
    const currentType = filters.type || []
    if (checked) {
      onFiltersChange({ 
        type: [...currentType, type as any],
        page: 1 
      })
    } else {
      onFiltersChange({ 
        type: currentType.filter(t => t !== type),
        page: 1 
      })
    }
  }

  // ✅ MANEJAR FILTROS DE CANAL
  const handleChannelFilter = (channel: string, checked: boolean) => {
    const currentChannels = filters.channels || []
    if (checked) {
      onFiltersChange({ 
        channels: [...currentChannels, channel as any],
        page: 1 
      })
    } else {
      onFiltersChange({ 
        channels: currentChannels.filter(c => c !== channel),
        page: 1 
      })
    }
  }

  // ✅ MANEJAR FILTROS DE FECHA
  const handleDateFilter = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({
      [field]: value ? new Date(value) : undefined,
      page: 1
    })
  }

  // ✅ MANEJAR FILTROS AVANZADOS
  const handleAdvancedFilter = (field: string, value: any) => {
    onFiltersChange({
      [field]: value || undefined,
      page: 1
    })
  }

  // ✅ LIMPIAR TODOS LOS FILTROS
  const clearAllFilters = () => {
    onFiltersChange({
      status: undefined,
      type: undefined,
      channels: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      tags: undefined,
      createdBy: undefined,
      minRecipients: undefined,
      maxRecipients: undefined,
      hasErrors: undefined,
      page: 1
    })
  }

  // ✅ CONTAR FILTROS ACTIVOS
  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'page' && 
    key !== 'limit' && 
    key !== 'sortBy' && 
    key !== 'sortOrder' &&
    filters[key as keyof CampaignFilters] !== undefined
  ).length

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      
      {/* 🎯 HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros
          </h2>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full mt-3"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* 📋 CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 🎛️ FILTROS POR ESTADO */}
        <Card className="p-4">
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Estado
              </span>
            </div>
            {expandedSections.status ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.status && (
            <div className="mt-3 space-y-2">
              {Object.entries(CAMPAIGN_STATUS_LABELS).map(([status, label]) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status as any) || false}
                    onChange={(e) => handleStatusFilter(status, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* 🎨 FILTROS POR TIPO */}
        <Card className="p-4">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Tipo de Campaña
              </span>
            </div>
            {expandedSections.type ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.type && (
            <div className="mt-3 space-y-2">
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([type, label]) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.type?.includes(type as any) || false}
                    onChange={(e) => handleTypeFilter(type, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* 📱 FILTROS POR CANAL */}
        <Card className="p-4">
          <button
            onClick={() => toggleSection('channels')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Canales
              </span>
            </div>
            {expandedSections.channels ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.channels && (
            <div className="mt-3 space-y-2">
              {Object.entries(CHANNEL_LABELS).map(([channel, label]) => (
                <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.channels?.includes(channel as any) || false}
                    onChange={(e) => handleChannelFilter(channel, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* 📅 FILTROS POR FECHA */}
        <Card className="p-4">
          <button
            onClick={() => toggleSection('dates')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Fechas
              </span>
            </div>
            {expandedSections.dates ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.dates && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateFilter('dateFrom', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <Input
                  type="date"
                  value={filters.dateTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleDateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* ⚙️ FILTROS AVANZADOS */}
        <Card className="p-4">
          <button
            onClick={() => toggleSection('advanced')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Filtros Avanzados
              </span>
            </div>
            {expandedSections.advanced ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expandedSections.advanced && (
            <div className="mt-3 space-y-3">
              
              {/* Rango de Destinatarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mínimo Destinatarios
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minRecipients || ''}
                  onChange={(e) => handleAdvancedFilter('minRecipients', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Máximo Destinatarios
                </label>
                <Input
                  type="number"
                  placeholder="Sin límite"
                  value={filters.maxRecipients || ''}
                  onChange={(e) => handleAdvancedFilter('maxRecipients', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              {/* Campañas con Errores */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasErrors || false}
                  onChange={(e) => handleAdvancedFilter('hasErrors', e.target.checked || undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Solo campañas con errores
                </span>
              </label>

              {/* Etiquetas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiquetas
                </label>
                <Input
                  placeholder="Separar con comas"
                  value={filters.tags?.join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0)
                    handleAdvancedFilter('tags', tags.length > 0 ? tags : undefined)
                  }}
                />
              </div>

            </div>
          )}
        </Card>

      </div>

      {/* 📊 RESUMEN DE FILTROS */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Filtros aplicados:
          </div>
          <div className="flex flex-wrap gap-1">
            
            {filters.status && filters.status.map(status => (
              <Badge 
                key={`status-${status}`} 
                variant="secondary" 
                className="text-xs"
              >
                {CAMPAIGN_STATUS_LABELS[status]}
              </Badge>
            ))}
            
            {filters.type && filters.type.map(type => (
              <Badge 
                key={`type-${type}`} 
                variant="secondary" 
                className="text-xs"
              >
                {CAMPAIGN_TYPE_LABELS[type]}
              </Badge>
            ))}
            
            {filters.channels && filters.channels.map(channel => (
              <Badge 
                key={`channel-${channel}`} 
                variant="secondary" 
                className="text-xs"
              >
                {CHANNEL_LABELS[channel]}
              </Badge>
            ))}
            
            {filters.dateFrom && (
              <Badge variant="secondary" className="text-xs">
                Desde: {filters.dateFrom.toLocaleDateString()}
              </Badge>
            )}
            
            {filters.dateTo && (
              <Badge variant="secondary" className="text-xs">
                Hasta: {filters.dateTo.toLocaleDateString()}
              </Badge>
            )}
            
            {filters.tags && filters.tags.map(tag => (
              <Badge 
                key={`tag-${tag}`} 
                variant="outline" 
                className="text-xs"
              >
                #{tag}
              </Badge>
            ))}
            
            {filters.minRecipients && (
              <Badge variant="secondary" className="text-xs">
                Min: {filters.minRecipients}
              </Badge>
            )}
            
            {filters.maxRecipients && (
              <Badge variant="secondary" className="text-xs">
                Max: {filters.maxRecipients}
              </Badge>
            )}
            
            {filters.hasErrors && (
              <Badge variant="destructive" className="text-xs">
                Con errores
              </Badge>
            )}
            
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignsSidebar 