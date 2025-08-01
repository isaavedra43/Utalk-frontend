// 📚 DASHBOARD PRINCIPAL - Centro de Conocimiento UTalk
// Vista principal con búsqueda global, estadísticas y acceso a contenido

import { useState } from 'react'
import {
  Search,
  Upload,
  // Plus,
  BookOpen,
  HelpCircle,
  GraduationCap,
  FileText,
  TrendingUp,
  Users,
  Download,
  Star,
  Filter,
  Grid,
  List,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

/**
 * 🎯 DASHBOARD PRINCIPAL DEL CENTRO DE CONOCIMIENTO
 */
export function KnowledgeDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'faqs' | 'courses'>('documents')
  const [showFilters, setShowFilters] = useState(false)

  // ✅ DATOS TEMPORALES (simulando hooks)
  const isLoading = false
  // const documents = []
  // const faqs = []
  // const courses = []

  // ✅ ESTADÍSTICAS RÁPIDAS
  const quickStats = {
    totalDocuments: 0,
    totalFAQs: 0,
    totalCourses: 0,
    totalViews: 0,
    avgRating: 0,
    activeUsers: 0
  }

  // ✅ MANEJAR UPLOAD
  const handleUpload = () => {
    console.log('🎯 Abrir modal de upload')
    setShowUploadModal(true)
  }

  // ✅ REFRESCAR DATOS
  const handleRefresh = () => {
    console.log('🔄 Refrescar datos')
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">

      {/* 📋 CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">

        {/* 🎯 HEADER */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">

          {/* Título y acciones */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Centro de Conocimiento
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Acceso rápido e intuitivo a documentos, FAQs y capacitación
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
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
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Contenido
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda global */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar documentos, FAQs, cursos..."
                className="pl-10 pr-4 py-3 text-base w-full"
              />
            </div>
          </div>

          {/* Pestañas principales */}
          <div className="flex space-x-1 mb-6">
            {[
              { key: 'documents', label: 'Documentos', icon: FileText, count: quickStats.totalDocuments },
              { key: 'faqs', label: 'FAQs', icon: HelpCircle, count: quickStats.totalFAQs },
              { key: 'courses', label: 'Cursos', icon: GraduationCap, count: quickStats.totalCourses }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

            {/* Total Documentos */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Documentos
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.totalDocuments}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total FAQs */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    FAQs
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.totalFAQs}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Cursos */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cursos
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.totalCourses}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Vistas */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vistas
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Rating Promedio */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rating
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.avgRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Usuarios Activos */}
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usuarios
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {quickStats.activeUsers}
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* 📋 CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">

              {/* Barra de herramientas */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
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

              {/* Contenido de la pestaña activa */}
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'documents' && 'Documentos'}
                  {activeTab === 'faqs' && 'Preguntas Frecuentes'}
                  {activeTab === 'courses' && 'Cursos de Capacitación'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vista {viewMode} en desarrollo...
                </p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'documents' && `${quickStats.totalDocuments} documentos disponibles`}
                  {activeTab === 'faqs' && `${quickStats.totalFAQs} preguntas frecuentes`}
                  {activeTab === 'courses' && `${quickStats.totalCourses} cursos de capacitación`}
                </p>
              </Card>

            </div>
          )}
        </div>
      </div>

      {/* 📤 MODAL DE UPLOAD */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Subir Contenido</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Formulario de upload en desarrollo...
            </p>
            <button
              onClick={() => setShowUploadModal(false)}
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

export default KnowledgeDashboard