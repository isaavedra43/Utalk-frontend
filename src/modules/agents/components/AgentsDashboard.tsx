// 👥 DASHBOARD PRINCIPAL - Módulo de Agentes y Performance UTalk
// Sistema ultra moderno para gestión de equipos y análisis de performance

import React, { useState, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Star,
  Activity,
  MessageSquare,
  DollarSign,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Grid,
  List,
  Settings,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Mail,
  Phone,
  Crown,
  Shield,
  Zap
} from 'lucide-react'
import { useAgents, useAgentStats, useAgentRealTime } from '../hooks/useAgents'
// TODO: Importar componentes cuando estén implementados
// import { AgentsList, AgentsFilters, AgentDetailPanel, AgentCreateModal, AgentStatsPanel } from './components'
import type { Agent, AgentFilters, AgentStatus } from '../types'
import { AGENT_STATUS_LABELS, AGENT_STATUS_COLORS } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * 🎯 DASHBOARD PRINCIPAL DE AGENTES Y PERFORMANCE
 */
export function AgentsDashboard() {
  const [showFilters, setShowFilters] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<'all' | 'active' | 'inactive' | 'online'>('all')

  // ✅ HOOKS PRINCIPALES
  const {
    agents,
    total,
    isLoading,
    selectedAgent,
    filters,
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    updateFilters,
    selectAgent,
    refresh
  } = useAgents()

  const { stats, isLoading: isLoadingStats } = useAgentStats()
  const { isConnected } = useAgentRealTime()

  // ✅ ESTADÍSTICAS RÁPIDAS
  const quickStats = useMemo(() => {
    if (!stats) {
      return {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.isActive).length,
        onlineAgents: agents.filter(a => a.isOnline).length,
        avgCSAT: 0,
        totalRevenue: 0,
        avgResponseTime: 0
      }
    }

    return {
      totalAgents: stats.totalAgents || agents.length,
      activeAgents: stats.activeAgents || agents.filter(a => a.isActive).length,
      onlineAgents: stats.onlineAgents || agents.filter(a => a.isOnline).length,
      avgCSAT: stats.avgCSAT || 0,
      totalRevenue: stats.totalRevenue || 0,
      avgResponseTime: stats.avgResponseTime || 0
    }
  }, [stats, agents])

  // ✅ FILTROS RÁPIDOS
  const filteredAgents = useMemo(() => {
    let filtered = agents

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.fullName?.toLowerCase().includes(query) ||
        agent.firstName.toLowerCase().includes(query) ||
        agent.lastName.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.role.displayName.toLowerCase().includes(query) ||
        agent.department.toLowerCase().includes(query)
      )
    }

    // Aplicar filtro rápido
    switch (quickFilter) {
      case 'active':
        filtered = filtered.filter(agent => agent.isActive)
        break
      case 'inactive':
        filtered = filtered.filter(agent => !agent.isActive)
        break
      case 'online':
        filtered = filtered.filter(agent => agent.isOnline)
        break
    }

    return filtered
  }, [agents, searchQuery, quickFilter])

  // ✅ MANEJAR BÚSQUEDA
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // ✅ MANEJAR FILTRO RÁPIDO
  const handleQuickFilter = (filter: 'all' | 'active' | 'inactive' | 'online') => {
    setQuickFilter(filter)
  }

  // ✅ MANEJAR CREACIÓN DE AGENTE
  const handleCreateAgent = async (agentData: any) => {
    try {
      await createAgent(agentData)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  // ✅ EXPORTAR DATOS
  const handleExport = () => {
    console.log('🔍 Exportar datos de agentes')
    // TODO: Implementar exportación
  }

  // ✅ REFRESCAR DATOS
  const handleRefresh = () => {
    refresh()
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      
      {/* 📱 SIDEBAR DE FILTROS */}
      {showFilters && (
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filtros Avanzados</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Panel de filtros en desarrollo...
            </p>
          </div>
        </div>
      )}

      {/* 📋 CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🎯 HEADER */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          
          {/* Primera fila: Título y acciones */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Equipo & Performance
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona tu equipo de ventas y analiza su rendimiento
                </p>
              </div>
              
              {/* Indicador de conexión en tiempo real */}
              {isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-300">En vivo</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Agente
              </Button>
            </div>
          </div>

          {/* Segunda fila: Búsqueda y filtros rápidos */}
          <div className="flex items-center space-x-4 mb-6">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o rol..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>

            {/* Filtros rápidos */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todos', count: agents.length },
                { key: 'active', label: 'Activos', count: quickStats.activeAgents },
                { key: 'inactive', label: 'Inactivos', count: quickStats.totalAgents - quickStats.activeAgents },
                { key: 'online', label: 'En línea', count: quickStats.onlineAgents }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={quickFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter(filter.key as any)}
                  className="flex items-center space-x-2"
                >
                  <span>{filter.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Toggle vista */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tercera fila: KPIs rápidos */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            {/* Total de Agentes */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Agentes
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.totalAgents}
                  </p>
                </div>
              </div>
            </Card>

            {/* Agentes Activos */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activos
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.activeAgents}
                  </p>
                </div>
              </div>
            </Card>

            {/* Agentes En Línea */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    En Línea
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.onlineAgents}
                  </p>
                </div>
              </div>
            </Card>

            {/* CSAT Promedio */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CSAT Promedio
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.avgCSAT.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Ingresos Totales */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ingresos
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${quickStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Tiempo de Respuesta */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tiempo Respuesta
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(quickStats.avgResponseTime)}s
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* 📋 CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            
            {/* Lista de agentes */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                {isLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">Lista de Agentes</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vista {viewMode} en desarrollo...
                    </p>
                    <p className="text-sm text-gray-500">
                      {filteredAgents.length} agentes encontrados
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Panel de detalle */}
            {selectedAgent && (
              <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Detalle del Agente</h3>
                    <button onClick={() => selectAgent(null)} className="text-gray-400 hover:text-gray-600">
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Panel de detalle en desarrollo...
                  </p>
                  <p className="text-sm text-gray-500">
                    Agente: {selectedAgent.firstName} {selectedAgent.lastName}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 📤 MODAL DE CREACIÓN */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Agente</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Formulario de creación en desarrollo...
            </p>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AgentsDashboard 