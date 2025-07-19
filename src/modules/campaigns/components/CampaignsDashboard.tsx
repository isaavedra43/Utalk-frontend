// 📊 DASHBOARD PRINCIPAL DE CAMPAÑAS - UTalk Frontend
// Vista general con KPIs, filtros y gestión de campañas

import React, { useState, useMemo } from 'react'
import { Plus, Filter, Download, RefreshCw, Search, Calendar, Users, Send, TrendingUp } from 'lucide-react'
import { useCampaigns } from '../hooks/useCampaigns'
import { CampaignsList } from './CampaignsList'
import { CampaignsSidebar } from './CampaignsSidebar'
import type { CampaignFilters, CampaignStatus, CampaignType } from '../types'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * 🎯 DASHBOARD PRINCIPAL DE CAMPAÑAS
 */
export function CampaignsDashboard() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ✅ HOOK PRINCIPAL DE CAMPAÑAS
  const {
    campaigns,
    total,
    isLoading,
    filters,
    updateFilters,
    resetFilters,
    refresh,
    isMutating
  } = useCampaigns()

  // ✅ CALCULAR KPIs
  const kpis = useMemo(() => {
    if (!campaigns.length) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalRecipients: 0,
        averageDeliveryRate: 0,
        totalSent: 0,
        totalDelivered: 0
      }
    }

    const activeCampaigns = campaigns.filter(c => 
      ['sending', 'scheduled', 'sent'].includes(c.status)
    ).length

    const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalRecipients, 0)
    
    const campaignStats = campaigns
      .filter(c => c.stats.total > 0)
      .map(c => c.stats.deliveryRate)
    
    const averageDeliveryRate = campaignStats.length > 0
      ? campaignStats.reduce((sum, rate) => sum + rate, 0) / campaignStats.length
      : 0

    const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0)

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalRecipients,
      averageDeliveryRate,
      totalSent,
      totalDelivered
    }
  }, [campaigns])

  // ✅ MANEJAR BÚSQUEDA
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    updateFilters({ search: value || undefined, page: 1 })
  }

  // ✅ MANEJAR FILTROS RÁPIDOS
  const handleStatusFilter = (status: CampaignStatus | 'all') => {
    if (status === 'all') {
      updateFilters({ status: undefined, page: 1 })
    } else {
      updateFilters({ status: [status], page: 1 })
    }
  }

  const handleTypeFilter = (type: CampaignType | 'all') => {
    if (type === 'all') {
      updateFilters({ type: undefined, page: 1 })
    } else {
      updateFilters({ type: [type], page: 1 })
    }
  }

  // ✅ EXPORTAR DATOS
  const handleExport = () => {
    // TODO: Implementar exportación a CSV/Excel
    console.log('Exportando campañas...', campaigns)
  }

  // ✅ CREAR NUEVA CAMPAÑA
  const handleCreateCampaign = () => {
    // TODO: Abrir modal de creación o navegar al editor
    console.log('Crear nueva campaña')
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 📱 SIDEBAR */}
      {showSidebar && (
        <CampaignsSidebar 
          onClose={() => setShowSidebar(false)}
          filters={filters}
          onFiltersChange={updateFilters}
        />
      )}

      {/* 📋 CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🎯 HEADER */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Campañas
              </h1>
              
              {!showSidebar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!campaigns.length}
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>

              <Button
                onClick={handleCreateCampaign}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>
          </div>

          {/* 🔍 BARRA DE BÚSQUEDA */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar campañas por nombre, etiquetas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {Object.keys(filters).length > 2 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length - 2}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* 📊 KPIs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            {/* Total de Campañas */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Campañas
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.totalCampaigns.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Campañas Activas */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activas
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.activeCampaigns.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Destinatarios */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Destinatarios
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.totalRecipients.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mensajes Enviados */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Send className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enviados
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.totalSent.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mensajes Entregados */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Entregados
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.totalDelivered.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Tasa de Entrega Promedio */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tasa Entrega
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {kpis.averageDeliveryRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* 🎛️ FILTROS RÁPIDOS */}
        {showFilters && (
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-4">
              
              {/* Filtros por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!filters.status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusFilter('all')}
                  >
                    Todos
                  </Button>
                  {Object.entries(CAMPAIGN_STATUS_LABELS).map(([status, label]) => (
                    <Button
                      key={status}
                      variant={filters.status?.includes(status as CampaignStatus) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter(status as CampaignStatus)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtros por Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!filters.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeFilter('all')}
                  >
                    Todos
                  </Button>
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(([type, label]) => (
                    <Button
                      key={type}
                      variant={filters.type?.includes(type as CampaignType) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTypeFilter(type as CampaignType)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Botón Limpiar Filtros */}
              {Object.keys(filters).length > 2 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 📋 LISTA DE CAMPAÑAS */}
        <div className="flex-1 overflow-hidden">
          {isLoading && campaigns.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <CampaignsList 
              campaigns={campaigns}
              total={total}
              isLoading={isLoading}
              filters={filters}
              onFiltersChange={updateFilters}
              isMutating={isMutating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignsDashboard 