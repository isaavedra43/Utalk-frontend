// Módulo de Conocimiento - Exportaciones principales
export { useKnowledge } from './hooks/useKnowledge'
export { knowledgeService } from './services/knowledgeService'

// Tipos
export type {
  KnowledgeDocument,
  KnowledgeCategory,
  KnowledgeFAQ,
  KnowledgeCourse,
  CourseLesson,
  QuizQuestion,
  QuizAttempt,
  KnowledgeFeedback,
  KnowledgeSearchHistory,
  KnowledgeSearchResult,
  KnowledgeAnalytics,
  KnowledgeStats,
  KnowledgeActivity,
  ActivityType,
  KnowledgeDocumentsResponse,
  KnowledgeDocumentResponse,
  KnowledgeFAQsResponse,
  KnowledgeCategoriesResponse,
  KnowledgeCoursesResponse,
  KnowledgeAnalyticsResponse,
  KnowledgeStatsResponse,
  DocumentSortBy
} from './types'

// Datos mock
export {
  mockDocuments,
  mockCategories,
  mockFAQs,
  mockCourses,
  mockActivities,
  mockStats
} from './data/mockKnowledge'
