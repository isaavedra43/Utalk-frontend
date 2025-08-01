// Tipos para el módulo Knowledge
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