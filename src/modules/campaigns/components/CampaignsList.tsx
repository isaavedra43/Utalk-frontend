// 📋 LISTA DE CAMPAÑAS - UTalk Frontend
// Tabla con campañas, acciones rápidas y gestión de estados

import React, { useState } from 'react'
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Edit, 
  BarChart3, 
  Calendar,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { Campaign, CampaignFilters } from '../types'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS, CHANNEL_LABELS } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface CampaignsListProps {
  campaigns: Campaign[]
  total: number
  isLoading: boolean
  filters: CampaignFilters
  onFiltersChange: (filters: Partial<CampaignFilters>) => void
  isMutating: boolean
}

/**
 * 🎯 LISTA DE CAMPAÑAS
 */
export function CampaignsList({ 
  campaigns, 
  total, 
  isLoading, 
  filters,
  onFiltersChange,
  isMutating 
}: CampaignsListProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // ✅ MANEJAR SELECCIÓN
  const handleSelectCampaign = (campaignId: string, selected: boolean) => {
    if (selected) {
      setSelectedCampaigns(prev => [...prev, campaignId])
    } else {
      setSelectedCampaigns(prev => prev.filter(id => id !== campaignId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCampaigns(campaigns.map(c => c.id))
    } else {
      setSelectedCampaigns([])
    }
  }

  // ✅ ACCIONES DE CAMPAÑA
  const handleCampaignAction = (campaignId: string, action: string) => {
    console.log(`Ejecutando acción ${action} en campaña ${campaignId}`)
    // TODO: Implementar acciones reales
  }

  // ✅ PAGINACIÓN
  const handlePageChange = (page: number) => {
    onFiltersChange({ page })
  }

  // ✅ OBTENER ÍCONO DE ESTADO
  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-400" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'sending':
        return <Send className="w-4 h-4 text-orange-500 animate-pulse" />
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />
    }
  }

  // ✅ OBTENER COLOR DE BADGE DE ESTADO
  const getStatusBadgeVariant = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'scheduled':
        return 'default'
      case 'sending':
        return 'destructive'
      case 'sent':
      case 'completed':
        return 'default'
      case 'paused':
        return 'secondary'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // ✅ RENDERIZAR VISTA DE ESTADO VACÍO
  if (!isLoading && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay campañas
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          {Object.keys(filters).length > 2 
            ? 'No se encontraron campañas con los filtros aplicados'
            : 'Comienza creando tu primera campaña de WhatsApp o SMS'
          }
        </p>
        <Button onClick={() => handleCampaignAction('', 'create')}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Crear Primera Campaña
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* 🎛️ TOOLBAR */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          
          {/* Información y Selección */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCampaigns.length > 0 
                  ? `${selectedCampaigns.length} seleccionadas`
                  : `${total.toLocaleString()} campañas`
                }
              </span>
            </div>

            {/* Acciones en Lote */}
            {selectedCampaigns.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Pausar seleccionadas')}
                  disabled={isMutating}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Eliminar seleccionadas')}
                  disabled={isMutating}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>

          {/* Controles de Vista */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabla
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Tarjetas
            </Button>
          </div>
        </div>
      </div>

      {/* 📋 CONTENIDO */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          
          /* 📊 VISTA DE TABLA */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Destinatarios
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => (
                  <tr 
                    key={campaign.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={(e) => handleSelectCampaign(campaign.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>

                    {/* Información de la Campaña */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        {campaign.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {campaign.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{campaign.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(campaign.status)}
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {CAMPAIGN_STATUS_LABELS[campaign.status]}
                        </Badge>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {campaign.channels.map(channel => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {CHANNEL_LABELS[channel]}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    {/* Destinatarios */}
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {campaign.totalRecipients.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Progreso */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {campaign.stats.sent}/{campaign.stats.total}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {campaign.stats.progress.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${campaign.stats.progress.percentage}%` }}
                          />
                        </div>
                        {campaign.stats.deliveryRate > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {campaign.stats.deliveryRate.toFixed(1)}% entregado
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {campaign.scheduledAt 
                          ? campaign.scheduledAt.toLocaleDateString()
                          : campaign.createdAt.toLocaleDateString()
                        }
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {campaign.scheduledAt ? 'Programada' : 'Creada'}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, 'send')}
                            disabled={isMutating}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {campaign.status === 'sending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                            disabled={isMutating}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignAction(campaign.id, 'clone')}
                          disabled={isMutating}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignAction(campaign.id, 'analytics')}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignAction(campaign.id, 'more')}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          
          /* 🎴 VISTA DE TARJETAS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-4 hover:shadow-lg transition-shadow">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {campaign.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(campaign.status)}
                      <Badge variant={getStatusBadgeVariant(campaign.status)} className="text-xs">
                        {CAMPAIGN_STATUS_LABELS[campaign.status]}
                      </Badge>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={(e) => handleSelectCampaign(campaign.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>

                {/* Estadísticas */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Destinatarios:</span>
                    <span className="font-medium">{campaign.totalRecipients.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Enviados:</span>
                    <span className="font-medium">{campaign.stats.sent.toLocaleString()}</span>
                  </div>

                  {campaign.stats.deliveryRate > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Entrega:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {campaign.stats.deliveryRate.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Barra de Progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Progreso</span>
                      <span>{campaign.stats.progress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${campaign.stats.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Etiquetas */}
                {campaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {campaign.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {campaign.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{campaign.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center space-x-1">
                  {campaign.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'send')}
                      disabled={isMutating}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCampaignAction(campaign.id, 'clone')}
                    disabled={isMutating}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCampaignAction(campaign.id, 'analytics')}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>

              </Card>
            ))}
          </div>
        )}

        {/* 📄 PAGINACIÓN */}
        {total > (filters.limit || 10) && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {campaigns.length} de {total.toLocaleString()} campañas
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={!filters.page || filters.page <= 1}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Página {filters.page || 1}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={campaigns.length < (filters.limit || 10)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔄 LOADING OVERLAY */}
      {isLoading && campaigns.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}

export default CampaignsList 