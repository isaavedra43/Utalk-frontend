// 📚 MÓDULO DE CENTRO DE CONOCIMIENTO - UTalk Frontend
// Exportaciones principales del módulo

// ✅ COMPONENTES PRINCIPALES
export { default as KnowledgeDashboard } from './components/KnowledgeDashboard'
export { default as KnowledgeSearchBar } from './components/KnowledgeSearchBar'

// ✅ HOOKS
export { 
  useKnowledgeDocuments, 
  useKnowledgeDocument, 
  useKnowledgeFAQs, 
  useKnowledgeCourses, 
  useKnowledgeStats,
  useKnowledgeCategories 
} from './hooks/useKnowledge'

// ✅ SERVICIOS
export { knowledgeService } from './services/knowledgeService'

// ✅ TIPOS
export type {
  KnowledgeDocument,
  KnowledgeFAQ,
  KnowledgeCourse,
  KnowledgeCategory,
  DocumentType,
  DocumentStatus,
  KnowledgeFilters,
  KnowledgeStats,
  KnowledgeActivity,
  ActivityType,
  CourseProgress,
  CourseLesson,
  CourseQuiz,
  QuizQuestion,
  QuizResult,
  DocumentVersion,
  KnowledgeModuleConfig,
  KnowledgeDocumentsResponse,
  KnowledgeDocumentResponse,
  KnowledgeFAQsResponse,
  KnowledgeCoursesResponse,
  KnowledgeCategoriesResponse,
  KnowledgeStatsResponse,
  KnowledgeAction,
  KnowledgeEvent
} from './types'

// ✅ CONSTANTES
export {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_ICONS,
  DOCUMENT_STATUS_LABELS,
  DIFFICULTY_LABELS,
  MIME_TYPE_MAPPINGS
} from './types'

// TODO: Los siguientes componentes se implementarán como archivos separados:
// - KnowledgeSidebar
// - KnowledgeList  
// - KnowledgeCard
// - KnowledgeDocumentViewer
// - KnowledgeUploadModal
// - KnowledgeFAQPanel
// - KnowledgeStatsPanel
// - KnowledgeCourseList
// - KnowledgeCourseDetail
// - KnowledgeCourseProgress
// - KnowledgeActivityFeed 