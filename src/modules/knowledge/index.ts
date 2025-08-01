// Módulo de Conocimiento - Exportaciones principales
export { useKnowledge } from './hooks/useKnowledge'
export { knowledgeService } from './services/knowledgeService'

// Tipos
export type {
  KnowledgeDocument,
  KnowledgeFAQ,
  KnowledgeCourse,
  CourseLesson,
  QuizQuestion,
  QuizAttempt,
  KnowledgeFeedback,
  KnowledgeSearchHistory,
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
  mockKnowledgeDocuments,
  mockKnowledgeFAQs,
  mockKnowledgeCourses,
  mockKnowledgeStats
} from './data/mockKnowledge'
