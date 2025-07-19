// 📚 TIPOS CANÓNICOS - Módulo de Centro de Conocimiento UTalk
// Sistema completo de gestión de documentos, FAQs y capacitación

// // import type { CanonicalUser } from '@/types/canonical'

/**
 * 🎯 DOCUMENTO DE CONOCIMIENTO
 */
export interface KnowledgeDocument {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  title: string
  type: DocumentType
  status: DocumentStatus
  
  // ✅ CONTENIDO
  description?: string
  content?: string              // Para contenido de texto/markdown
  fileUrl?: string             // URL del archivo
  fileName?: string            // Nombre original del archivo
  fileSize?: number            // Tamaño en bytes
  mimeType?: string           // Tipo MIME
  
  // ✅ CLASIFICACIÓN
  category: KnowledgeCategory
  tags: string[]
  
  // ✅ METADATOS
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
  
  // ✅ INTERACCIONES
  views: number
  downloads: number
  favorites: number
  isFavorite: boolean          // Para el usuario actual
  
  // ✅ VISIBILIDAD Y ACCESO
  visibility: 'public' | 'private' | 'restricted'
  allowedRoles?: string[]      // Roles que pueden acceder
  allowedUsers?: string[]      // Usuarios específicos
  
  // ✅ VERSIONADO
  version: string
  previousVersions?: DocumentVersion[]
  
  // ✅ METADATOS ADICIONALES
  metadata?: {
    language?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedReadTime?: number  // En minutos
    keywords?: string[]
    externalUrl?: string       // Para enlaces externos
    thumbnail?: string         // URL de miniatura
    transcription?: string     // Para videos
  }
}

/**
 * 🎯 TIPOS DE DOCUMENTO
 */
export type DocumentType = 
  | 'pdf'              // Documentos PDF
  | 'video'            // Videos MP4, AVI, etc.
  | 'image'            // Imágenes PNG, JPG, etc.
  | 'excel'            // Hojas de cálculo
  | 'word'             // Documentos Word
  | 'powerpoint'       // Presentaciones
  | 'text'             // Archivos de texto
  | 'markdown'         // Documentos Markdown
  | 'link'             // Enlaces externos
  | 'blog'             // Artículos/blogs
  | 'audio'            // Archivos de audio
  | 'zip'              // Archivos comprimidos
  | 'other'            // Otros tipos

/**
 * 🎯 ESTADOS DE DOCUMENTO
 */
export type DocumentStatus = 
  | 'draft'            // Borrador
  | 'published'        // Publicado
  | 'archived'         // Archivado
  | 'under_review'     // En revisión
  | 'outdated'         // Desactualizado

/**
 * 🎯 CATEGORÍAS DE CONOCIMIENTO
 */
export interface KnowledgeCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parentId?: string            // Para subcategorías
  path: string                 // Ruta completa (ej: "productos/telefonia/configuracion")
  documentCount: number
  isExpanded?: boolean         // Para UI del árbol
  order: number               // Orden de visualización
}

/**
 * 🎯 VERSIÓN DE DOCUMENTO
 */
export interface DocumentVersion {
  id: string
  version: string
  fileUrl: string
  createdBy: string
  createdAt: Date
  changes?: string            // Descripción de cambios
  fileSize: number
}

/**
 * 🎯 FAQ (PREGUNTAS FRECUENTES)
 */
export interface KnowledgeFAQ {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  question: string
  answer: string
  
  // ✅ CLASIFICACIÓN
  category: KnowledgeCategory
  tags: string[]
  
  // ✅ METADATOS
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
  
  // ✅ INTERACCIONES
  views: number
  likes: number
  dislikes: number
  isHelpful?: boolean         // Para el usuario actual
  
  // ✅ ESTADO
  status: 'published' | 'draft' | 'archived'
  priority: 'low' | 'medium' | 'high'
  
  // ✅ CONTENIDO ADICIONAL
  relatedDocuments?: string[] // IDs de documentos relacionados
  relatedFAQs?: string[]      // IDs de FAQs relacionadas
  
  // ✅ METADATOS
  metadata?: {
    keywords?: string[]
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedReadTime?: number
  }
}

/**
 * 🎯 CURSO DE CAPACITACIÓN
 */
export interface KnowledgeCourse {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  title: string
  description: string
  
  // ✅ CONTENIDO
  lessons: CourseLesson[]
  totalLessons: number
  estimatedDuration: number   // En minutos
  
  // ✅ CLASIFICACIÓN
  category: KnowledgeCategory
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  
  // ✅ METADATOS
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
  
  // ✅ ESTADO
  status: 'published' | 'draft' | 'archived'
  isActive: boolean
  
  // ✅ INTERACCIONES
  enrolledCount: number
  completedCount: number
  averageRating: number
  
  // ✅ CONFIGURACIÓN
  requiresEnrollment: boolean
  allowedRoles?: string[]
  prerequisites?: string[]    // IDs de cursos prerequisito
  
  // ✅ RECURSOS
  thumbnail?: string
  certificateTemplate?: string
  
  // ✅ PROGRESO DEL USUARIO ACTUAL
  userProgress?: CourseProgress
}

/**
 * 🎯 LECCIÓN DE CURSO
 */
export interface CourseLesson {
  id: string
  title: string
  description?: string
  order: number
  
  // ✅ CONTENIDO
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'link'
  content?: string            // Contenido de texto/markdown
  resourceUrl?: string        // URL del recurso (video, documento, etc.)
  duration?: number           // En minutos
  
  // ✅ RECURSOS ADICIONALES
  attachments?: KnowledgeDocument[]
  quiz?: CourseQuiz
  
  // ✅ CONFIGURACIÓN
  isRequired: boolean
  allowSkip: boolean
  
  // ✅ PROGRESO
  userProgress?: {
    isCompleted: boolean
    completedAt?: Date
    timeSpent?: number      // En minutos
    score?: number          // Para quizzes
  }
}

/**
 * 🎯 QUIZ DE CURSO
 */
export interface CourseQuiz {
  id: string
  title: string
  description?: string
  questions: QuizQuestion[]
  passingScore: number        // Porcentaje mínimo para aprobar
  maxAttempts?: number
  timeLimit?: number          // En minutos
}

/**
 * 🎯 PREGUNTA DE QUIZ
 */
export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'open_ended'
  options?: string[]          // Para multiple choice
  correctAnswer: string | number
  explanation?: string
  points: number
}

/**
 * 🎯 PROGRESO DE CURSO
 */
export interface CourseProgress {
  courseId: string
  userId: string
  
  // ✅ PROGRESO GENERAL
  isEnrolled: boolean
  isCompleted: boolean
  enrolledAt: Date
  completedAt?: Date
  lastAccessedAt: Date
  
  // ✅ MÉTRICAS
  completedLessons: number
  totalLessons: number
  progressPercentage: number
  timeSpent: number           // En minutos
  
  // ✅ PROGRESO POR LECCIÓN
  lessonProgress: Record<string, {
    isCompleted: boolean
    completedAt?: Date
    timeSpent: number
    score?: number
  }>
  
  // ✅ QUIZZES
  quizResults: QuizResult[]
  
  // ✅ CERTIFICACIÓN
  certificate?: {
    issuedAt: Date
    certificateUrl: string
    score: number
  }
}

/**
 * 🎯 RESULTADO DE QUIZ
 */
export interface QuizResult {
  quizId: string
  lessonId: string
  attempt: number
  score: number
  totalPoints: number
  passed: boolean
  completedAt: Date
  timeSpent: number
  answers: Record<string, any>
}

/**
 * 🎯 ACTIVIDAD DEL CENTRO DE CONOCIMIENTO
 */
export interface KnowledgeActivity {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar?: string
  
  // ✅ CONTENIDO DE LA ACTIVIDAD
  resourceType: 'document' | 'faq' | 'course' | 'category'
  resourceId: string
  resourceTitle: string
  
  // ✅ DETALLES
  action: string              // 'created', 'updated', 'viewed', 'completed', etc.
  description: string
  timestamp: Date
  
  // ✅ METADATOS
  metadata?: {
    oldValue?: any
    newValue?: any
    duration?: number
    score?: number
  }
}

/**
 * 🎯 TIPOS DE ACTIVIDAD
 */
export type ActivityType = 
  | 'document_created'
  | 'document_updated'
  | 'document_viewed'
  | 'document_downloaded'
  | 'document_favorited'
  | 'faq_created'
  | 'faq_updated'
  | 'faq_viewed'
  | 'course_enrolled'
  | 'course_completed'
  | 'lesson_completed'
  | 'quiz_attempted'
  | 'category_created'

/**
 * 🎯 ESTADÍSTICAS DEL CENTRO DE CONOCIMIENTO
 */
export interface KnowledgeStats {
  // ✅ CONTADORES GENERALES
  totalDocuments: number
  totalFAQs: number
  totalCourses: number
  totalCategories: number
  
  // ✅ ACTIVIDAD
  totalViews: number
  totalDownloads: number
  totalFavorites: number
  
  // ✅ USUARIOS
  activeUsers: number
  totalEnrollments: number
  completedCourses: number
  
  // ✅ CONTENIDO POR TIPO
  documentsByType: Record<DocumentType, number>
  
  // ✅ ACTIVIDAD RECIENTE
  recentActivity: KnowledgeActivity[]
  
  // ✅ MÉTRICAS DE TIEMPO
  averageViewTime: number     // En minutos
  averageCourseCompletion: number // Porcentaje
  
  // ✅ TOP CONTENIDO
  mostViewedDocuments: KnowledgeDocument[]
  mostPopularCourses: KnowledgeCourse[]
  mostHelpfulFAQs: KnowledgeFAQ[]
}

/**
 * 🎯 FILTROS DE BÚSQUEDA
 */
export interface KnowledgeFilters {
  // ✅ BÚSQUEDA
  search?: string
  
  // ✅ FILTROS BÁSICOS
  type?: DocumentType[]
  status?: DocumentStatus[]
  categories?: string[]        // IDs de categorías
  tags?: string[]
  
  // ✅ FILTROS TEMPORALES
  dateFrom?: Date
  dateTo?: Date
  
  // ✅ FILTROS DE INTERACCIÓN
  onlyFavorites?: boolean
  onlyRecent?: boolean
  minViews?: number
  
  // ✅ FILTROS DE USUARIO
  createdBy?: string[]
  assignedTo?: string[]
  
  // ✅ ORDENAMIENTO
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'views' | 'downloads' | 'relevance'
  sortOrder?: 'asc' | 'desc'
  
  // ✅ PAGINACIÓN
  page?: number
  limit?: number
}

/**
 * 🎯 CONFIGURACIÓN DEL MÓDULO
 */
export interface KnowledgeModuleConfig {
  // ✅ LÍMITES DE ARCHIVOS
  maxFileSize: number         // En bytes
  allowedFileTypes: string[]  // MIME types permitidos
  maxFilesPerUpload: number
  
  // ✅ CONFIGURACIÓN DE CURSOS
  enableCourses: boolean
  enableCertificates: boolean
  defaultCourseEnrollment: boolean
  
  // ✅ CONFIGURACIÓN DE FAQs
  enableFAQs: boolean
  allowUserSubmissions: boolean
  requireApproval: boolean
  
  // ✅ PERMISOS
  permissions: {
    canCreateDocuments: boolean
    canEditDocuments: boolean
    canDeleteDocuments: boolean
    canCreateCourses: boolean
    canManageCategories: boolean
    canViewAnalytics: boolean
  }
  
  // ✅ CONFIGURACIÓN DE UI
  defaultView: 'grid' | 'list'
  enableThumbnails: boolean
  enablePreviews: boolean
  enableVersioning: boolean
}

/**
 * 🎯 RESPUESTAS DE API
 */
export interface KnowledgeDocumentsResponse {
  success: boolean
  documents: KnowledgeDocument[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface KnowledgeDocumentResponse {
  success: boolean
  document?: KnowledgeDocument
  error?: string
}

export interface KnowledgeFAQsResponse {
  success: boolean
  faqs: KnowledgeFAQ[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface KnowledgeCoursesResponse {
  success: boolean
  courses: KnowledgeCourse[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface KnowledgeCategoriesResponse {
  success: boolean
  categories: KnowledgeCategory[]
  error?: string
}

export interface KnowledgeStatsResponse {
  success: boolean
  stats?: KnowledgeStats
  error?: string
}

/**
 * 🎯 ACCIONES DEL MÓDULO
 */
export type KnowledgeAction = 
  | 'create'
  | 'edit'
  | 'delete'
  | 'view'
  | 'download'
  | 'favorite'
  | 'share'
  | 'archive'
  | 'restore'

/**
 * 🎯 EVENTOS DEL MÓDULO
 */
export interface KnowledgeEvent {
  id: string
  type: ActivityType
  resourceId: string
  userId: string
  timestamp: Date
  data?: Record<string, any>
}

// ✅ CONSTANTES ÚTILES
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  pdf: 'PDF',
  video: 'Video',
  image: 'Imagen',
  excel: 'Excel',
  word: 'Word',
  powerpoint: 'PowerPoint',
  text: 'Texto',
  markdown: 'Markdown',
  link: 'Enlace',
  blog: 'Blog',
  audio: 'Audio',
  zip: 'Archivo ZIP',
  other: 'Otro'
}

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  pdf: '📄',
  video: '🎥',
  image: '🖼️',
  excel: '📊',
  word: '📝',
  powerpoint: '📽️',
  text: '📃',
  markdown: '📋',
  link: '🔗',
  blog: '✏️',
  audio: '🎵',
  zip: '📦',
  other: '📁'
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
  under_review: 'En Revisión',
  outdated: 'Desactualizado'
}

export const DIFFICULTY_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
}

export const MIME_TYPE_MAPPINGS: Record<string, DocumentType> = {
  'application/pdf': 'pdf',
  'video/mp4': 'video',
  'video/avi': 'video',
  'video/quicktime': 'video',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'application/vnd.ms-powerpoint': 'powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
  'text/plain': 'text',
  'text/markdown': 'markdown',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'application/zip': 'zip'
} 