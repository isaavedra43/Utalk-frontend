// Servicio para manejo de knowledge base
import { apiClient } from '@/services/apiClient'

export interface KnowledgeDocument {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: string
  updatedAt: string
  views: number
  helpful: number
  notHelpful: number
}

export interface KnowledgeFAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  helpful: number
  notHelpful: number
  createdAt: string
}

export interface KnowledgeCourse {
  id: string
  title: string
  description: string
  lessons: CourseLesson[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
}

export interface CourseLesson {
  id: string
  title: string
  content: string
  duration: number
  order: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: number[]
  score: number
  completedAt: string
}

export interface KnowledgeFeedback {
  id: string
  documentId: string
  userId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface KnowledgeSearchHistory {
  id: string
  userId: string
  query: string
  results: number
  createdAt: string
}

export interface KnowledgeStats {
  totalDocuments: number
  totalFAQs: number
  totalCourses: number
  totalViews: number
  averageRating: number
  searchQueries: number
}

export interface KnowledgeActivity {
  id: string
  type: 'view' | 'search' | 'feedback' | 'course_completed'
  userId: string
  documentId?: string
  data: any
  createdAt: string
}

export type ActivityType = KnowledgeActivity['type']

export interface KnowledgeDocumentsResponse {
  success: boolean
  data: KnowledgeDocument[]
  total: number
  page: number
  limit: number
}

export interface KnowledgeDocumentResponse {
  success: boolean
  data: KnowledgeDocument
}

export interface KnowledgeFAQsResponse {
  success: boolean
  data: KnowledgeFAQ[]
  total: number
}

export interface KnowledgeCategoriesResponse {
  success: boolean
  data: string[]
}

export interface KnowledgeCoursesResponse {
  success: boolean
  data: KnowledgeCourse[]
  total: number
}

export interface KnowledgeAnalyticsResponse {
  success: boolean
  data: {
    stats: KnowledgeStats
    recentActivity: KnowledgeActivity[]
  }
}

export interface KnowledgeStatsResponse {
  success: boolean
  data: KnowledgeStats
}

export type DocumentSortBy = 'relevance' | 'date' | 'views' | 'rating'

class KnowledgeService {
  private baseUrl = '/knowledge'

  // Buscar documentos
  async searchDocuments(query: string, category?: string, sortBy: DocumentSortBy = 'relevance', page = 1, limit = 20): Promise<KnowledgeDocumentsResponse> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      if (category) {params.append('category', category)}
      params.append('sortBy', sortBy)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await apiClient.get(`${this.baseUrl}/documents/search?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error searching documents:', error)
      throw new Error('Failed to search documents')
    }
  }

  // Obtener documento por ID
  async getDocument(id: string): Promise<KnowledgeDocumentResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/documents/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching document:', error)
      throw new Error('Failed to fetch document')
    }
  }

  // Obtener FAQs
  async getFAQs(category?: string): Promise<KnowledgeFAQsResponse> {
    try {
      const params = new URLSearchParams()
      if (category) {params.append('category', category)}

      const response = await apiClient.get(`${this.baseUrl}/faqs?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      throw new Error('Failed to fetch FAQs')
    }
  }

  // Obtener categorías
  async getCategories(): Promise<KnowledgeCategoriesResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categories`)
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories')
    }
  }

  // Obtener cursos
  async getCourses(difficulty?: string): Promise<KnowledgeCoursesResponse> {
    try {
      const params = new URLSearchParams()
      if (difficulty) {params.append('difficulty', difficulty)}

      const response = await apiClient.get(`${this.baseUrl}/courses?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw new Error('Failed to fetch courses')
    }
  }

  // Obtener curso por ID
  async getCourse(id: string): Promise<{ success: boolean; data: KnowledgeCourse }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/courses/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching course:', error)
      throw new Error('Failed to fetch course')
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<KnowledgeStatsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching knowledge stats:', error)
      throw new Error('Failed to fetch knowledge stats')
    }
  }

  // Obtener analíticas
  async getAnalytics(): Promise<KnowledgeAnalyticsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics`)
      return response.data
    } catch (error) {
      console.error('Error fetching knowledge analytics:', error)
      throw new Error('Failed to fetch knowledge analytics')
    }
  }

  // Marcar documento como útil/no útil
  async markDocumentHelpful(documentId: string, helpful: boolean): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/documents/${documentId}/feedback`, {
        helpful
      })
    } catch (error) {
      console.error('Error marking document helpful:', error)
      throw new Error('Failed to mark document helpful')
    }
  }

  // Registrar búsqueda
  async logSearch(query: string, results: number): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/search/log`, {
        query,
        results
      })
    } catch (error) {
      console.error('Error logging search:', error)
      // No lanzar error para no interrumpir la funcionalidad
    }
  }
}

export const knowledgeService = new KnowledgeService()