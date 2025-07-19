// 📚 DASHBOARD PRINCIPAL - Centro de Conocimiento UTalk
// Vista principal con búsqueda global, estadísticas y acceso a contenido

import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Upload, 
  Plus, 
  BookOpen, 
  HelpCircle, 
  GraduationCap, 
  FileText, 
  Video, 
  Image, 
  File,
  TrendingUp,
  Users,
  Eye,
  Download,
  Star,
  Filter,
  Grid,
  List,
  RefreshCw
} from 'lucide-react'
import { useKnowledgeDocuments, useKnowledgeFAQs, useKnowledgeCourses, useKnowledgeStats } from '../hooks/useKnowledge'
import { KnowledgeSidebar } from './KnowledgeSidebar'
import { KnowledgeSearchBar } from './KnowledgeSearchBar'
import { KnowledgeList } from './KnowledgeList'
import { KnowledgeStatsPanel } from './KnowledgeStatsPanel'
import { KnowledgeActivityFeed } from './KnowledgeActivityFeed'
import { KnowledgeUploadModal } from './KnowledgeUploadModal'
import type { KnowledgeFilters, DocumentType } from '../types'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * 🎯 DASHBOARD PRINCIPAL DEL CENTRO DE CONOCIMIENTO
 */
export function KnowledgeDashboard() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState<'documents' | 'faqs' | 'courses'>('documents')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showStats, setShowStats] = useState(true)

  // ✅ HOOKS PRINCIPALES
  const {
    documents,
    total: totalDocuments,
    isLoading: isLoadingDocuments,
    filters: documentFilters,
    updateFilters: updateDocumentFilters,
    refresh: refreshDocuments
  } = useKnowledgeDocuments()

  const {
    faqs,
    total: totalFAQs,
    isLoading: isLoadingFAQs,
    filters: faqFilters,
    updateFilters: updateFAQFilters,
    refresh: refreshFAQs
  } = useKnowledgeFAQs()

  const {
    courses,
    total: totalCourses,
    isLoading: isLoadingCourses,
    filters: courseFilters,
    updateFilters: updateCourseFilters,
    refresh: refreshCourses
  } = useKnowledgeCourses()

  const { stats, isLoading: isLoadingStats } = useKnowledgeStats()

  // ✅ CALCULAR ESTADÍSTICAS RÁPIDAS
  const quickStats = useMemo(() => {
    if (!stats) {
      return {
        totalContent: 0,
        totalViews: 0,
        totalDownloads: 0,
        activeCourses: 0
      }
    }

    return {
      totalContent: stats.totalDocuments + stats.totalFAQs + stats.totalCourses,
      totalViews: stats.totalViews,
      totalDownloads: stats.totalDownloads,
      activeCourses: stats.totalCourses
    }
  }, [stats])

  // ✅ FILTROS RÁPIDOS POR TIPO
  const quickTypeFilters: { type: DocumentType; label: string; icon: string; count: number }[] = useMemo(() => {
    const documentsByType = stats?.documentsByType || {}
    
    return [
      { type: 'pdf', label: 'PDFs', icon: '📄', count: documentsByType['pdf'] || 0 },
      { type: 'video', label: 'Videos', icon: '🎥', count: documentsByType['video'] || 0 },
      { type: 'image', label: 'Imágenes', icon: '🖼️', count: documentsByType['image'] || 0 },
      { type: 'word', label: 'Word', icon: '📝', count: documentsByType['word'] || 0 },
      { type: 'excel', label: 'Excel', icon: '📊', count: documentsByType['excel'] || 0 },
      { type: 'blog', label: 'Blogs', icon: '✏️', count: documentsByType['blog'] || 0 }
    ]
  }, [stats])

  // ✅ MANEJAR BÚSQUEDA
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // Aplicar búsqueda según el tab activo
    switch (activeTab) {
      case 'documents':
        updateDocumentFilters({ search: query || undefined, page: 1 })
        break
      case 'faqs':
        updateFAQFilters({ search: query || undefined, page: 1 })
        break
      case 'courses':
        updateCourseFilters({ search: query || undefined, page: 1 })
        break
    }
  }

  // ✅ MANEJAR FILTRO RÁPIDO POR TIPO
  const handleQuickTypeFilter = (type: DocumentType) => {
    if (activeTab === 'documents') {
      const currentTypes = documentFilters.type || []
      const isSelected = currentTypes.includes(type)
      
      updateDocumentFilters({
        type: isSelected 
          ? currentTypes.filter(t => t !== type)
          : [...currentTypes, type],
        page: 1
      })
    }
  }

  // ✅ CAMBIAR TAB ACTIVO
  const handleTabChange = (tab: 'documents' | 'faqs' | 'courses') => {
    setActiveTab(tab)
    // Limpiar búsqueda al cambiar tab
    setSearchQuery('')
  }

  // ✅ REFRESCAR CONTENIDO
  const handleRefresh = () => {
    switch (activeTab) {
      case 'documents':
        refreshDocuments()
        break
      case 'faqs':
        refreshFAQs()
        break
      case 'courses':
        refreshCourses()
        break
    }
  }

  // ✅ OBTENER ESTADO DE LOADING ACTUAL
  const isLoading = useMemo(() => {
    switch (activeTab) {
      case 'documents':
        return isLoadingDocuments
      case 'faqs':
        return isLoadingFAQs
      case 'courses':
        return isLoadingCourses
      default:
        return false
    }
  }, [activeTab, isLoadingDocuments, isLoadingFAQs, isLoadingCourses])

  // ✅ OBTENER TOTAL ACTUAL
  const currentTotal = useMemo(() => {
    switch (activeTab) {
      case 'documents':
        return totalDocuments
      case 'faqs':
        return totalFAQs
      case 'courses':
        return totalCourses
      default:
        return 0
    }
  }, [activeTab, totalDocuments, totalFAQs, totalCourses])

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      
      {/* 📱 SIDEBAR */}
      {showSidebar && (
        <KnowledgeSidebar 
          onClose={() => setShowSidebar(false)}
          activeTab={activeTab}
          documentFilters={documentFilters}
          faqFilters={faqFilters}
          courseFilters={courseFilters}
          onDocumentFiltersChange={updateDocumentFilters}
          onFAQFiltersChange={updateFAQFilters}
          onCourseFiltersChange={updateCourseFilters}
        />
      )}

      {/* 📋 CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🎯 HEADER */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          
          {/* Primera fila: Título y acciones */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Centro de Conocimiento
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
                onClick={() => setShowStats(!showStats)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Estadísticas
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
                variant="outline"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Documento
              </Button>

              <Button
                onClick={() => console.log('Crear FAQ')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear FAQ
              </Button>
            </div>
          </div>

          {/* Segunda fila: Búsqueda */}
          <KnowledgeSearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder={`Buscar ${activeTab === 'documents' ? 'documentos' : activeTab === 'faqs' ? 'preguntas' : 'cursos'}...`}
            isLoading={isLoading}
          />
        </div>

        {/* 📊 ESTADÍSTICAS RÁPIDAS */}
        {showStats && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              
              {/* Total de Contenido */}
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Contenido
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {quickStats.totalContent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Total de Visualizaciones */}
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visualizaciones
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {quickStats.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Total de Descargas */}
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Descargas
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {quickStats.totalDownloads.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Cursos Activos */}
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cursos Activos
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {quickStats.activeCourses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

            </div>

            {/* Filtros rápidos por tipo (solo para documentos) */}
            {activeTab === 'documents' && (
              <div className="flex flex-wrap gap-2">
                {quickTypeFilters.map((filter) => (
                  <Button
                    key={filter.type}
                    variant={documentFilters.type?.includes(filter.type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickTypeFilter(filter.type)}
                    className="flex items-center space-x-2"
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {filter.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🎛️ NAVEGACIÓN DE TABS */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-center justify-between">
            
            {/* Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange('documents')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Documentos</span>
                  <Badge variant="secondary">{totalDocuments}</Badge>
                </div>
              </button>

              <button
                onClick={() => handleTabChange('faqs')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'faqs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQs</span>
                  <Badge variant="secondary">{totalFAQs}</Badge>
                </div>
              </button>

              <button
                onClick={() => handleTabChange('courses')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'courses'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Cursos</span>
                  <Badge variant="secondary">{totalCourses}</Badge>
                </div>
              </button>
            </div>

            {/* Controles de vista */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTotal.toLocaleString()} elementos
              </span>
              
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
          </div>
        </div>

        {/* 📋 CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden">
          <KnowledgeList
            activeTab={activeTab}
            viewMode={viewMode}
            documents={documents}
            faqs={faqs}
            courses={courses}
            isLoading={isLoading}
            documentFilters={documentFilters}
            faqFilters={faqFilters}
            courseFilters={courseFilters}
            onDocumentFiltersChange={updateDocumentFilters}
            onFAQFiltersChange={updateFAQFilters}
            onCourseFiltersChange={updateCourseFilters}
          />
        </div>
      </div>

      {/* 📤 MODAL DE SUBIDA */}
      {showUploadModal && (
        <KnowledgeUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={() => {
            setShowUploadModal(false)
            refreshDocuments()
          }}
        />
      )}
    </div>
  )
}

export default KnowledgeDashboard 