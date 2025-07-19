// 🛠️ SERVICIO DE CENTRO DE CONOCIMIENTO - UTalk Frontend
// Abstrae las llamadas a la API del backend para documentos, FAQs y cursos

import { apiClient } from '@/services/apiClient'
import type { 
  KnowledgeDocument,
  KnowledgeFAQ,
  KnowledgeCourse,
  KnowledgeCategory,
  KnowledgeFilters,
  KnowledgeDocumentsResponse,
  KnowledgeDocumentResponse,
  KnowledgeFAQsResponse,
  KnowledgeCoursesResponse,
  KnowledgeCategoriesResponse,
  KnowledgeStatsResponse,
  CourseProgress
} from '../types'

/**
 * 🎯 SERVICIO PRINCIPAL DE CENTRO DE CONOCIMIENTO
 */
class KnowledgeService {
  
  /**
   * ✅ OBTENER DOCUMENTOS
   */
  async getDocuments(filters: KnowledgeFilters = {}): Promise<KnowledgeDocumentsResponse> {
    try {
      console.log('🔍 KnowledgeService.getDocuments called:', filters)
      
      // Construir query string desde filtros
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
      if (filters.search) queryParams.append('search', filters.search)
      
      if (filters.type?.length) {
        filters.type.forEach(type => queryParams.append('type', type))
      }
      
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status))
      }
      
      if (filters.categories?.length) {
        filters.categories.forEach(category => queryParams.append('categories', category))
      }
      
      if (filters.tags?.length) {
        filters.tags.forEach(tag => queryParams.append('tags', tag))
      }
      
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString())
      if (filters.onlyFavorites) queryParams.append('onlyFavorites', 'true')
      if (filters.onlyRecent) queryParams.append('onlyRecent', 'true')
      if (filters.minViews) queryParams.append('minViews', filters.minViews.toString())
      
      const url = `/knowledge/documents?${queryParams.toString()}`
      console.log('📡 Making API call to:', url)
      
      const response = await apiClient.get(url)
      console.log('📥 Raw documents response:', response)
      
      return {
        success: true,
        documents: response.data || response.documents || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 12
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getDocuments error:', error)
      return {
        success: false,
        documents: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 12,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ OBTENER DOCUMENTO INDIVIDUAL
   */
  async getDocument(documentId: string): Promise<KnowledgeDocumentResponse> {
    try {
      console.log('🔍 KnowledgeService.getDocument called:', documentId)
      
      const response = await apiClient.get(`/knowledge/documents/${documentId}`)
      console.log('📥 Document response:', response)
      
      return {
        success: true,
        document: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ CREAR DOCUMENTO
   */
  async createDocument(documentData: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeDocumentResponse> {
    try {
      console.log('🔍 KnowledgeService.createDocument called:', documentData)
      
      const response = await apiClient.post('/knowledge/documents', documentData)
      console.log('📥 Create document response:', response)
      
      return {
        success: true,
        document: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.createDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear documento'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR DOCUMENTO
   */
  async updateDocument(documentId: string, updates: Partial<KnowledgeDocument>): Promise<KnowledgeDocumentResponse> {
    try {
      console.log('🔍 KnowledgeService.updateDocument called:', { documentId, updates })
      
      const response = await apiClient.put(`/knowledge/documents/${documentId}`, updates)
      console.log('📥 Update document response:', response)
      
      return {
        success: true,
        document: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.updateDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar documento'
      }
    }
  }
  
  /**
   * ✅ ELIMINAR DOCUMENTO
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.deleteDocument called:', documentId)
      
      await apiClient.delete(`/knowledge/documents/${documentId}`)
      console.log('✅ Document deleted successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.deleteDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar documento'
      }
    }
  }
  
  /**
   * ✅ MARCAR/DESMARCAR FAVORITO
   */
  async toggleFavorite(documentId: string, isFavorite: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.toggleFavorite called:', { documentId, isFavorite })
      
      await apiClient.post(`/knowledge/documents/${documentId}/favorite`, { isFavorite })
      console.log('✅ Favorite toggled successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.toggleFavorite error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar favorito'
      }
    }
  }
  
  /**
   * ✅ REGISTRAR VISTA DE DOCUMENTO
   */
  async viewDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.viewDocument called:', documentId)
      
      await apiClient.post(`/knowledge/documents/${documentId}/view`)
      console.log('✅ Document view registered')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.viewDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al registrar vista'
      }
    }
  }
  
  /**
   * ✅ DESCARGAR DOCUMENTO
   */
  async downloadDocument(documentId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.downloadDocument called:', documentId)
      
      const response = await apiClient.post(`/knowledge/documents/${documentId}/download`)
      console.log('📥 Download response:', response)
      
      return {
        success: true,
        url: response.data?.url || response.url
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.downloadDocument error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al descargar documento'
      }
    }
  }
  
  /**
   * ✅ OBTENER FAQs
   */
  async getFAQs(filters: KnowledgeFilters = {}): Promise<KnowledgeFAQsResponse> {
    try {
      console.log('🔍 KnowledgeService.getFAQs called:', filters)
      
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.categories?.length) {
        filters.categories.forEach(cat => queryParams.append('categories', cat))
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => queryParams.append('tags', tag))
      }
      
      const url = `/knowledge/faqs?${queryParams.toString()}`
      const response = await apiClient.get(url)
      console.log('📥 FAQs response:', response)
      
      return {
        success: true,
        faqs: response.data || response.faqs || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 10
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getFAQs error:', error)
      return {
        success: false,
        faqs: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        error: error instanceof Error ? error.message : 'Error al obtener FAQs'
      }
    }
  }
  
  /**
   * ✅ CREAR FAQ
   */
  async createFAQ(faqData: Omit<KnowledgeFAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; faq?: KnowledgeFAQ; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.createFAQ called:', faqData)
      
      const response = await apiClient.post('/knowledge/faqs', faqData)
      console.log('📥 Create FAQ response:', response)
      
      return {
        success: true,
        faq: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.createFAQ error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear FAQ'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR FAQ
   */
  async updateFAQ(faqId: string, updates: Partial<KnowledgeFAQ>): Promise<{ success: boolean; faq?: KnowledgeFAQ; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.updateFAQ called:', { faqId, updates })
      
      const response = await apiClient.put(`/knowledge/faqs/${faqId}`, updates)
      console.log('📥 Update FAQ response:', response)
      
      return {
        success: true,
        faq: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.updateFAQ error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar FAQ'
      }
    }
  }
  
  /**
   * ✅ MARCAR FAQ COMO ÚTIL
   */
  async markFAQHelpful(faqId: string, isHelpful: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.markFAQHelpful called:', { faqId, isHelpful })
      
      await apiClient.post(`/knowledge/faqs/${faqId}/helpful`, { isHelpful })
      console.log('✅ FAQ marked as helpful')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.markFAQHelpful error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar FAQ como útil'
      }
    }
  }
  
  /**
   * ✅ OBTENER CURSOS
   */
  async getCourses(filters: KnowledgeFilters = {}): Promise<KnowledgeCoursesResponse> {
    try {
      console.log('🔍 KnowledgeService.getCourses called:', filters)
      
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.categories?.length) {
        filters.categories.forEach(cat => queryParams.append('categories', cat))
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => queryParams.append('tags', tag))
      }
      
      const url = `/knowledge/courses?${queryParams.toString()}`
      const response = await apiClient.get(url)
      console.log('📥 Courses response:', response)
      
      return {
        success: true,
        courses: response.data || response.courses || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 12
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getCourses error:', error)
      return {
        success: false,
        courses: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 12,
        error: error instanceof Error ? error.message : 'Error al obtener cursos'
      }
    }
  }
  
  /**
   * ✅ INSCRIBIRSE EN CURSO
   */
  async enrollInCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.enrollInCourse called:', courseId)
      
      await apiClient.post(`/knowledge/courses/${courseId}/enroll`)
      console.log('✅ Enrolled in course successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.enrollInCourse error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al inscribirse en curso'
      }
    }
  }
  
  /**
   * ✅ COMPLETAR LECCIÓN
   */
  async completeLesson(courseId: string, lessonId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.completeLesson called:', { courseId, lessonId })
      
      await apiClient.post(`/knowledge/courses/${courseId}/lessons/${lessonId}/complete`)
      console.log('✅ Lesson completed successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ KnowledgeService.completeLesson error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al completar lección'
      }
    }
  }
  
  /**
   * ✅ OBTENER PROGRESO DE CURSO
   */
  async getCourseProgress(courseId: string): Promise<{ success: boolean; progress?: CourseProgress; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.getCourseProgress called:', courseId)
      
      const response = await apiClient.get(`/knowledge/courses/${courseId}/progress`)
      console.log('📥 Course progress response:', response)
      
      return {
        success: true,
        progress: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getCourseProgress error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener progreso'
      }
    }
  }
  
  /**
   * ✅ OBTENER CATEGORÍAS
   */
  async getCategories(): Promise<KnowledgeCategoriesResponse> {
    try {
      console.log('🔍 KnowledgeService.getCategories called')
      
      const response = await apiClient.get('/knowledge/categories')
      console.log('📥 Categories response:', response)
      
      return {
        success: true,
        categories: response.data || response.categories || []
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getCategories error:', error)
      return {
        success: false,
        categories: [],
        error: error instanceof Error ? error.message : 'Error al obtener categorías'
      }
    }
  }
  
  /**
   * ✅ OBTENER ESTADÍSTICAS
   */
  async getStats(): Promise<KnowledgeStatsResponse> {
    try {
      console.log('🔍 KnowledgeService.getStats called')
      
      const response = await apiClient.get('/knowledge/stats')
      console.log('📥 Stats response:', response)
      
      return {
        success: true,
        stats: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.getStats error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      }
    }
  }
  
  /**
   * ✅ BUSCAR CONTENIDO
   */
  async searchContent(query: string, filters?: Partial<KnowledgeFilters>): Promise<{
    success: boolean
    results?: {
      documents: KnowledgeDocument[]
      faqs: KnowledgeFAQ[]
      courses: KnowledgeCourse[]
    }
    error?: string
  }> {
    try {
      console.log('🔍 KnowledgeService.searchContent called:', { query, filters })
      
      const queryParams = new URLSearchParams()
      queryParams.append('q', query)
      
      if (filters?.type?.length) {
        filters.type.forEach(type => queryParams.append('type', type))
      }
      if (filters?.categories?.length) {
        filters.categories.forEach(cat => queryParams.append('categories', cat))
      }
      
      const url = `/knowledge/search?${queryParams.toString()}`
      const response = await apiClient.get(url)
      console.log('📥 Search response:', response)
      
      return {
        success: true,
        results: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.searchContent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al buscar contenido'
      }
    }
  }
  
  /**
   * ✅ SUBIR ARCHIVO
   */
  async uploadFile(file: File, metadata: {
    title: string
    description?: string
    categoryId: string
    tags: string[]
    visibility: 'public' | 'private' | 'restricted'
  }): Promise<{ success: boolean; document?: KnowledgeDocument; error?: string }> {
    try {
      console.log('🔍 KnowledgeService.uploadFile called:', { fileName: file.name, metadata })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))
      
      const response = await apiClient.post('/knowledge/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('📥 Upload response:', response)
      
      return {
        success: true,
        document: response.data || response
      }
      
    } catch (error) {
      console.error('❌ KnowledgeService.uploadFile error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al subir archivo'
      }
    }
  }
}

// ✅ INSTANCIA SINGLETON
export const knowledgeService = new KnowledgeService()
export default knowledgeService 