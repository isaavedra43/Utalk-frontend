// ===== TIPOS BASE =====
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  skills: string[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newContent: boolean;
  mentions: boolean;
  comments: boolean;
  approvals: boolean;
}

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author' | 'reader';

// ===== RECURSOS Y CONTENIDO =====
export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  content: string;
  ownerId: string;
  owner: User;
  area: string;
  tags: string[];
  language: string;
  status: ResourceStatus;
  visibility: VisibilityLevel;
  permissions: ResourcePermissions;
  metadata: ResourceMetadata;
  versions: ContentVersion[];
  chunks: Chunk[];
  embeddings: Embedding[];
  transcripts: Transcript[];
  collections: Collection[];
  comments: Comment[];
  reactions: Reaction[];
  bookmarks: Bookmark[];
  ratings: Rating[];
  analytics: ResourceAnalytics;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
}

export type ResourceType = 
  | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx'
  | 'video' | 'audio' | 'image' | 'link' | 'text' | 'markdown'
  | 'course' | 'lesson' | 'quiz' | 'playbook' | 'sop' | 'policy'
  | 'blog' | 'news' | 'announcement' | 'faq' | 'glossary';

export type ResourceStatus = 
  | 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'obsolete';

export type VisibilityLevel = 'public' | 'internal' | 'restricted' | 'private';

export interface ResourcePermissions {
  read: string[];
  write: string[];
  admin: string[];
  inheritFromCollection: boolean;
}

export interface ResourceMetadata {
  author?: string;
  publisher?: string;
  isbn?: string;
  doi?: string;
  license?: string;
  copyright?: string;
  source?: string;
  originalUrl?: string;
  fileSize?: number;
  pageCount?: number;
  duration?: number;
  resolution?: string;
  format?: string;
  encoding?: string;
  checksum?: string;
  extractedText?: string;
  ocrText?: string;
  transcriptText?: string;
  keywords?: string[];
  summary?: string;
  tableOfContents?: TableOfContentsItem[];
  customFields: Record<string, any>;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  page?: number;
  timestamp?: number;
  children: TableOfContentsItem[];
}

export interface ContentVersion {
  id: string;
  resourceId: string;
  version: number;
  title: string;
  description: string;
  content: string;
  diff: string;
  storagePath: string;
  checksum: string;
  publishedBy: string;
  publishedByUser: User;
  notes: string;
  changes: VersionChange[];
  createdAt: Date;
}

export interface VersionChange {
  type: 'added' | 'modified' | 'deleted';
  field: string;
  oldValue: any;
  newValue: any;
  description: string;
}

export interface Chunk {
  id: string;
  resourceId: string;
  version: number;
  index: number;
  text: string;
  html: string;
  start: number;
  end: number;
  page?: number;
  timestamp?: number;
  heading?: string;
  tags: string[];
  metadata: ChunkMetadata;
  embeddings: Embedding[];
  createdAt: Date;
}

export interface ChunkMetadata {
  section?: string;
  subsection?: string;
  paragraph?: number;
  sentence?: number;
  wordCount: number;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  importance?: number;
  customFields: Record<string, any>;
}

export interface Embedding {
  id: string;
  chunkId?: string;
  resourceId: string;
  vector: number[];
  model: string;
  dimensions: number;
  createdAt: Date;
}

export interface Transcript {
  id: string;
  resourceId: string;
  language: string;
  words: TranscriptWord[];
  sentences: TranscriptSentence[];
  paragraphs: TranscriptParagraph[];
  confidence: number;
  createdAt: Date;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export interface TranscriptSentence {
  text: string;
  start: number;
  end: number;
  words: TranscriptWord[];
  speaker?: string;
}

export interface TranscriptParagraph {
  text: string;
  start: number;
  end: number;
  sentences: TranscriptSentence[];
  speaker?: string;
}

// ===== COLECCIONES Y ORGANIZACIÓN =====
export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  parent?: Collection;
  children: Collection[];
  resources: Resource[];
  permissions: CollectionPermissions;
  settings: CollectionSettings;
  analytics: CollectionAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionPermissions {
  read: string[];
  write: string[];
  admin: string[];
  inheritToResources: boolean;
}

export interface CollectionSettings {
  autoTagging: boolean;
  requireApproval: boolean;
  allowComments: boolean;
  allowReactions: boolean;
  retentionPolicy?: RetentionPolicy;
  qualityChecklist: QualityChecklist;
}

export interface RetentionPolicy {
  enabled: boolean;
  duration: number; // days
  action: 'archive' | 'delete' | 'notify';
  notifyBefore: number; // days
}

export interface QualityChecklist {
  enabled: boolean;
  items: QualityChecklistItem[];
}

export interface QualityChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  weight: number;
}

export interface CollectionAnalytics {
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  lastActivity: Date;
  growthRate: number;
}

// ===== CURSOS Y FORMACIÓN =====
export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  instructor: string;
  instructorUser: User;
  level: CourseLevel;
  duration: number; // minutes
  language: string;
  tags: string[];
  prerequisites: string[];
  objectives: string[];
  lessons: Lesson[];
  assessments: Assessment[];
  enrollments: Enrollment[];
  completions: Completion[];
  certificates: Certificate[];
  analytics: CourseAnalytics;
  status: CourseStatus;
  visibility: VisibilityLevel;
  permissions: ResourcePermissions;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: LessonType;
  content: string;
  duration: number; // minutes
  order: number;
  prerequisites: string[];
  resources: Resource[];
  quiz?: Quiz;
  progress: any[];
  analytics: LessonAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type LessonType = 'video' | 'reading' | 'quiz' | 'exercise' | 'discussion' | 'assignment';

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // minutes
  attempts: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  analytics: QuizAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: AssessmentType;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
  attempts: number;
  proctoring: ProctoringSettings;
  analytics: AssessmentAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type AssessmentType = 'quiz' | 'exam' | 'project' | 'presentation' | 'peer-review';

export interface ProctoringSettings {
  enabled: boolean;
  webcamRequired: boolean;
  screenRecording: boolean;
  timeLimit: boolean;
  randomizeQuestions: boolean;
  preventCopyPaste: boolean;
  fullScreenRequired: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  user: User;
  enrolledAt: Date;
  assignedBy?: string;
  assignedByUser?: User;
  deadline?: Date;
  status: EnrollmentStatus;
  progress: EnrollmentProgress;
  analytics: EnrollmentAnalytics;
}

export type EnrollmentStatus = 'enrolled' | 'in-progress' | 'completed' | 'dropped' | 'expired';

export interface EnrollmentProgress {
  completedLessons: string[];
  completedAssessments: string[];
  currentLesson?: string;
  progressPercentage: number;
  timeSpent: number; // minutes
  lastAccessed: Date;
  estimatedCompletion?: Date;
}

export interface Completion {
  id: string;
  courseId: string;
  userId: string;
  user: User;
  completedAt: Date;
  score?: number;
  timeSpent: number;
  certificate?: Certificate;
  analytics: CompletionAnalytics;
}

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  user: User;
  issuedAt: Date;
  validUntil?: Date;
  template: CertificateTemplate;
  metadata: CertificateMetadata;
  downloadUrl: string;
  verificationCode: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  design: CertificateDesign;
  fields: CertificateField[];
}

export interface CertificateDesign {
  background: string;
  logo: string;
  colors: string[];
  fonts: string[];
  layout: string;
}

export interface CertificateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'score' | 'signature';
  position: { x: number; y: number };
  format?: string;
}

export interface CertificateMetadata {
  courseName: string;
  studentName: string;
  completionDate: string;
  score?: string;
  instructorSignature?: string;
  customFields: Record<string, any>;
}

// ===== BLOGS Y NOTICIAS =====
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  author: User;
  tags: string[];
  categories: string[];
  status: BlogPostStatus;
  visibility: VisibilityLevel;
  seo: SEOData;
  comments: Comment[];
  reactions: Reaction[];
  analytics: BlogPostAnalytics;
  scheduledAt?: Date;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

export type BlogPostStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface SEOData {
  title?: string;
  description?: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  twitterCard?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  author: User;
  tags: string[];
  categories: string[];
  priority: NewsPriority;
  status: NewsStatus;
  visibility: VisibilityLevel;
  seo: SEOData;
  comments: Comment[];
  reactions: Reaction[];
  analytics: NewsAnalytics;
  publishedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

export type NewsPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NewsStatus = 'draft' | 'review' | 'published' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: NewsPriority;
  targetAudience: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdBy: string;
  createdByUser: User;
  analytics: AnnouncementAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error' | 'maintenance';

// ===== INTERACCIONES =====
export interface Comment {
  id: string;
  resourceId?: string;
  courseId?: string;
  blogPostId?: string;
  newsItemId?: string;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
  content: string;
  authorId: string;
  author: User;
  reactions: Reaction[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  id: string;
  resourceId?: string;
  commentId?: string;
  blogPostId?: string;
  newsItemId?: string;
  type: ReactionType;
  userId: string;
  user: User;
  createdAt: Date;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'thumbs-up' | 'thumbs-down';

export interface Bookmark {
  id: string;
  resourceId?: string;
  courseId?: string;
  blogPostId?: string;
  newsItemId?: string;
  userId: string;
  user: User;
  folder?: string;
  notes?: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  resourceId?: string;
  courseId?: string;
  blogPostId?: string;
  newsItemId?: string;
  userId: string;
  user: User;
  rating: number; // 1-5
  review?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BÚSQUEDA Y RAG =====
export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  pagination: SearchPagination;
  options: SearchOptions;
}

export interface SearchFilters {
  types?: ResourceType[];
  areas?: string[];
  tags?: string[];
  authors?: string[];
  dateRange?: DateRange;
  status?: ResourceStatus[];
  visibility?: VisibilityLevel[];
  language?: string[];
  level?: CourseLevel[];
  permissions?: string[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SearchSort {
  field: 'relevance' | 'date' | 'title' | 'rating' | 'views' | 'downloads';
  direction: 'asc' | 'desc';
}

export interface SearchPagination {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchOptions {
  includeContent: boolean;
  includeMetadata: boolean;
  includeHighlights: boolean;
  expandQuery: boolean;
  useSynonyms: boolean;
  typoTolerance: boolean;
  boostRecent: boolean;
  boostAuthority: boolean;
}

export interface SearchResult {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  content?: string;
  highlights: SearchHighlight[];
  score: number;
  metadata: ResourceMetadata;
  analytics: ResourceAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchHighlight {
  field: string;
  text: string;
  start: number;
  end: number;
  score: number;
}

export interface RAGQuery {
  question: string;
  context: RAGContext;
  options: RAGOptions;
}

export interface RAGContext {
  resourceIds?: string[];
  collectionIds?: string[];
  areas?: string[];
  tags?: string[];
  dateRange?: DateRange;
  maxChunks: number;
  similarityThreshold: number;
}

export interface RAGOptions {
  includeSources: boolean;
  includeCitations: boolean;
  includeConfidence: boolean;
  expandQuery: boolean;
  useHybridSearch: boolean;
  rerank: boolean;
  summarize: boolean;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  citations: RAGCitation[];
  confidence: number;
  query: string;
  expandedQuery?: string;
  processingTime: number;
  metadata: RAGMetadata;
}

export interface RAGSource {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  chunkId: string;
  score: number;
  metadata: ChunkMetadata;
}

export interface RAGCitation {
  id: string;
  text: string;
  sourceId: string;
  chunkId: string;
  start: number;
  end: number;
  page?: number;
  timestamp?: number;
  url: string;
}

export interface RAGMetadata {
  totalChunks: number;
  retrievedChunks: number;
  rerankedChunks: number;
  searchTime: number;
  embeddingTime: number;
  rerankTime: number;
  summaryTime: number;
}

// ===== ANALYTICS =====
export interface ResourceAnalytics {
  views: number;
  uniqueViews: number;
  downloads: number;
  uniqueDownloads: number;
  timeSpent: number; // total minutes
  averageTimeSpent: number; // minutes per view
  bounceRate: number;
  completionRate: number;
  rating: number;
  ratingCount: number;
  comments: number;
  reactions: number;
  bookmarks: number;
  shares: number;
  lastViewed: Date;
  topSearches: string[];
  topReferrers: string[];
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

export interface UserEngagement {
  userId: string;
  user: User;
  views: number;
  timeSpent: number;
  lastViewed: Date;
  completionRate: number;
  rating?: number;
}

export interface DailyStats {
  date: Date;
  views: number;
  downloads: number;
  timeSpent: number;
  newUsers: number;
  returningUsers: number;
}

export interface CourseAnalytics {
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  averageTimeToComplete: number;
  dropoffPoints: DropoffPoint[];
  popularLessons: string[];
  difficultLessons: string[];
  userFeedback: UserFeedback[];
  revenue?: number;
}

export interface DropoffPoint {
  lessonId: string;
  lessonTitle: string;
  dropoffRate: number;
  commonReasons: string[];
}

export interface UserFeedback {
  userId: string;
  user: User;
  rating: number;
  review: string;
  suggestions: string[];
  completedAt: Date;
}

export interface LessonAnalytics {
  views: number;
  completions: number;
  completionRate: number;
  averageTimeSpent: number;
  quizAttempts: number;
  averageQuizScore: number;
  commonQuestions: string[];
  userFeedback: UserFeedback[];
}

export interface QuizAnalytics {
  attempts: number;
  completions: number;
  averageScore: number;
  averageTimeSpent: number;
  questionStats: QuestionStats[];
  userStats: UserQuizStats[];
}

export interface QuestionStats {
  questionId: string;
  question: string;
  correctRate: number;
  averageTime: number;
  commonWrongAnswers: string[];
}

export interface UserQuizStats {
  userId: string;
  user: User;
  attempts: number;
  bestScore: number;
  averageScore: number;
  averageTime: number;
  lastAttempt: Date;
}

export interface AssessmentAnalytics {
  attempts: number;
  completions: number;
  averageScore: number;
  averageTimeSpent: number;
  passRate: number;
  questionStats: QuestionStats[];
  userStats: UserAssessmentStats[];
  proctoringStats: ProctoringStats;
}

export interface UserAssessmentStats {
  userId: string;
  user: User;
  attempts: number;
  bestScore: number;
  averageScore: number;
  averageTime: number;
  lastAttempt: Date;
  violations: ProctoringViolation[];
}

export interface ProctoringStats {
  totalSessions: number;
  violations: number;
  violationRate: number;
  commonViolations: ProctoringViolationType[];
}

export interface ProctoringViolation {
  id: string;
  type: ProctoringViolationType;
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
  evidence?: string;
}

export type ProctoringViolationType = 
  | 'multiple-faces' | 'no-face' | 'face-away' | 'multiple-people'
  | 'phone-detected' | 'tab-switch' | 'copy-paste' | 'fullscreen-exit'
  | 'time-limit-exceeded' | 'suspicious-behavior';

export interface EnrollmentAnalytics {
  enrollmentDate: Date;
  firstAccess: Date;
  lastAccess: Date;
  timeSpent: number;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  quizAttempts: number;
  averageQuizScore: number;
  estimatedCompletion: Date;
  actualCompletion?: Date;
}

export interface CompletionAnalytics {
  completionDate: Date;
  timeSpent: number;
  score: number;
  lessonsCompleted: number;
  assessmentsCompleted: number;
  quizAttempts: number;
  averageQuizScore: number;
  certificateIssued: boolean;
  feedback?: string;
}

export interface BlogPostAnalytics {
  views: number;
  uniqueViews: number;
  timeSpent: number;
  averageTimeSpent: number;
  bounceRate: number;
  comments: number;
  reactions: number;
  shares: number;
  bookmarks: number;
  topReferrers: string[];
  topSearchTerms: string[];
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

export interface NewsAnalytics {
  views: number;
  uniqueViews: number;
  timeSpent: number;
  averageTimeSpent: number;
  bounceRate: number;
  comments: number;
  reactions: number;
  shares: number;
  bookmarks: number;
  topReferrers: string[];
  topSearchTerms: string[];
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

export interface AnnouncementAnalytics {
  views: number;
  uniqueViews: number;
  clicks: number;
  clickThroughRate: number;
  dismissals: number;
  dismissRate: number;
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

export interface CollectionAnalytics {
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  lastActivity: Date;
  growthRate: number;
  topResources: string[];
  topUsers: string[];
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

// ===== INGESTA Y PROCESAMIENTO =====
export interface IngestionSource {
  id: string;
  name: string;
  type: IngestionSourceType;
  connection: IngestionConnection;
  settings: IngestionSettings;
  status: IngestionStatus;
  lastSync: Date;
  nextSync?: Date;
  jobs: IngestionJob[];
  analytics: IngestionAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type IngestionSourceType = 
  | 'google-drive' | 'onedrive' | 'sharepoint' | 'dropbox'
  | 'notion' | 'confluence' | 'youtube' | 'vimeo'
  | 'rss' | 'api' | 'webhook' | 'manual';

export interface IngestionConnection {
  type: string;
  credentials: Record<string, any>;
  endpoint?: string;
  authentication: AuthenticationConfig;
}

export interface AuthenticationConfig {
  type: 'oauth' | 'api-key' | 'basic' | 'bearer';
  credentials: Record<string, any>;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface IngestionSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  includeSubfolders: boolean;
  fileTypes: string[];
  maxFileSize: number; // bytes
  duplicateHandling: 'skip' | 'replace' | 'version';
  metadataMapping: Record<string, string>;
  autoTagging: boolean;
  qualityCheck: boolean;
}

export type IngestionStatus = 'active' | 'paused' | 'error' | 'disabled';

export interface IngestionJob {
  id: string;
  sourceId: string;
  status: JobStatus;
  type: JobType;
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  errors: JobError[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  metadata: JobMetadata;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'sync' | 'parse' | 'embed' | 'index' | 'cleanup';

export interface JobError {
  id: string;
  type: 'parse' | 'embed' | 'index' | 'permission' | 'network' | 'validation';
  message: string;
  details: string;
  itemId?: string;
  itemName?: string;
  timestamp: Date;
  retryable: boolean;
}

export interface JobMetadata {
  sourceType: string;
  sourceName: string;
  fileTypes: string[];
  totalSize: number;
  averageSize: number;
  processingTime: number;
  embeddingTime: number;
  indexingTime: number;
  qualityScore: number;
}

export interface IngestionAnalytics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  successRate: number;
  averageJobDuration: number;
  totalItemsProcessed: number;
  totalSizeProcessed: number;
  lastJobDate: Date;
  errorRate: number;
  commonErrors: string[];
}

// ===== AUDITORÍA Y SEGURIDAD =====
export interface AuditLog {
  id: string;
  userId: string;
  user: User;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  details: AuditDetails;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete' | 'publish' | 'archive'
  | 'approve' | 'reject' | 'comment' | 'react' | 'bookmark' | 'rate'
  | 'download' | 'share' | 'export' | 'import' | 'login' | 'logout'
  | 'permission-change' | 'role-change' | 'setting-change';

export interface AuditDetails {
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  reason?: string;
  notes?: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  response: WebhookResponse;
  status: WebhookStatus;
  attempts: number;
  maxAttempts: number;
  nextRetry?: Date;
  createdAt: Date;
  processedAt?: Date;
}

export interface WebhookResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
}

export type WebhookStatus = 'pending' | 'success' | 'failed' | 'retrying' | 'cancelled';

export interface Consent {
  id: string;
  userId: string;
  user: User;
  type: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  purpose: string;
  legalBasis: string;
  retentionPeriod?: number; // days
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentType = 
  | 'data-processing' | 'analytics' | 'marketing' | 'personalization'
  | 'sharing' | 'retention' | 'profiling' | 'automated-decision';

// ===== TAGS Y TEMAS =====
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  category: string;
  usage: number;
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  parent?: Topic;
  children: Topic[];
  tags: Tag[];
  resources: Resource[];
  analytics: TopicAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicAnalytics {
  totalResources: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  lastActivity: Date;
  growthRate: number;
  topResources: string[];
  topUsers: string[];
  userEngagement: UserEngagement[];
  dailyStats: DailyStats[];
}

// ===== HABILIDADES Y CERTIFICACIONES =====
export interface UserSkill {
  id: string;
  userId: string;
  user: User;
  skill: string;
  level: SkillLevel;
  verified: boolean;
  verifiedBy?: string;
  verifiedByUser?: User;
  verifiedAt?: Date;
  evidence: SkillEvidence[];
  resources: Resource[];
  courses: Course[];
  badges: Badge[];
  analytics: SkillAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillEvidence {
  id: string;
  type: 'course-completion' | 'assessment' | 'project' | 'peer-review' | 'certification';
  title: string;
  description: string;
  score?: number;
  date: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedByUser?: User;
  verifiedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: BadgeCriteria;
  users: User[];
  analytics: BadgeAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeCriteria {
  type: 'course-completion' | 'skill-level' | 'time-spent' | 'resources-created' | 'helpful-answers';
  threshold: number;
  timeFrame?: number; // days
  resources?: string[];
  skills?: string[];
}

export interface BadgeAnalytics {
  totalEarned: number;
  uniqueUsers: number;
  averageTimeToEarn: number;
  topUsers: string[];
  recentEarners: string[];
}

export interface SkillAnalytics {
  level: SkillLevel;
  verified: boolean;
  evidenceCount: number;
  resourcesCount: number;
  coursesCount: number;
  badgesCount: number;
  lastUpdated: Date;
  progress: number;
  nextLevel?: SkillLevel;
  nextLevelProgress: number;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  issuer: string;
  validityPeriod: number; // days
  requirements: CertificationRequirement[];
  users: User[];
  analytics: CertificationAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationRequirement {
  type: 'course-completion' | 'assessment' | 'experience' | 'portfolio';
  title: string;
  description: string;
  required: boolean;
  weight: number;
}

export interface CertificationAnalytics {
  totalIssued: number;
  activeCertifications: number;
  expiredCertifications: number;
  renewalRate: number;
  averageTimeToComplete: number;
  topUsers: string[];
  recentIssuances: string[];
}

// ===== UI STATES =====
export interface KnowledgeBaseState {
  // Navigation
  currentView: KnowledgeBaseView;
  currentResource?: Resource;
  currentCourse?: Course;
  currentCollection?: Collection;
  
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  searchFilters: SearchFilters;
  searchSort: SearchSort;
  searchPagination: SearchPagination;
  isSearching: boolean;
  searchError?: string;
  
  // RAG
  ragQuery: string;
  ragResponse?: RAGResponse;
  isRAGLoading: boolean;
  ragError?: string;
  
  // Resources
  resources: Resource[];
  isLoadingResources: boolean;
  resourcesError?: string;
  
  // Collections
  collections: Collection[];
  isLoadingCollections: boolean;
  collectionsError?: string;
  
  // Courses
  courses: Course[];
  isLoadingCourses: boolean;
  coursesError?: string;
  
  // User
  user?: User;
  userProgress: UserProgress;
  userBookmarks: Bookmark[];
  userRatings: Rating[];
  
  // UI
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  selectedResources: string[];
  viewMode: 'grid' | 'list';
  sortBy: string;
  filterBy: string;
  
  // Modals
  modals: {
    upload: boolean;
    createResource: boolean;
    createCourse: boolean;
    createCollection: boolean;
    settings: boolean;
    share: boolean;
    export: boolean;
  };
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
}

export type KnowledgeBaseView = 
  | 'explore' | 'collections' | 'courses' | 'blogs' | 'news' | 'analytics' | 'admin';

export type RightPanelTab = 
  | 'info' | 'comments' | 'related' | 'versions' | 'analytics' | 'settings';

export interface UserProgress {
  enrolledCourses: Enrollment[];
  completedCourses: Completion[];
  inProgressCourses: Enrollment[];
  bookmarks: Bookmark[];
  ratings: Rating[];
  skills: UserSkill[];
  badges: Badge[];
  certifications: Certification[];
  totalTimeSpent: number;
  totalResourcesViewed: number;
  totalCoursesCompleted: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string;
  courseId?: string;
  userId: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationType = 
  | 'new-content' | 'course-assigned' | 'course-completed' | 'comment-reply'
  | 'mention' | 'approval-needed' | 'content-updated' | 'deadline-reminder';

// ===== API RESPONSES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
  metadata?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: BulkOperationError[];
  results: BulkOperationItem[];
}

export interface BulkOperationError {
  id: string;
  error: string;
  details?: string;
}

export interface BulkOperationItem {
  id: string;
  success: boolean;
  error?: string;
  result?: any;
}

// ===== CONFIGURACIÓN =====
export interface KnowledgeBaseConfig {
  general: GeneralConfig;
  search: SearchConfig;
  rag: RAGConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  analytics: AnalyticsConfig;
  integrations: IntegrationsConfig;
  features: FeaturesConfig;
}

export interface GeneralConfig {
  name: string;
  description: string;
  logo: string;
  favicon: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface SearchConfig {
  defaultSearchEngine: 'hybrid' | 'vector' | 'keyword';
  maxResults: number;
  defaultSort: SearchSort;
  enableTypoTolerance: boolean;
  enableSynonyms: boolean;
  enableQueryExpansion: boolean;
  boostRecent: boolean;
  boostAuthority: boolean;
  recentBoostDays: number;
  authorityBoostWeight: number;
}

export interface RAGConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  maxChunks: number;
  similarityThreshold: number;
  enableReranking: boolean;
  enableSummarization: boolean;
  enableCitations: boolean;
  enableConfidence: boolean;
  defaultContext: RAGContext;
}

export interface StorageConfig {
  provider: 's3' | 'minio' | 'local';
  bucket: string;
  region: string;
  endpoint?: string;
  accessKey: string;
  secretKey: string;
  useSSL: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  retentionPolicy: RetentionPolicy;
}

export interface SecurityConfig {
  enableRBAC: boolean;
  enableAuditLog: boolean;
  enableEncryption: boolean;
  enableWatermarking: boolean;
  enableDownloadControl: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  twoFactorAuth: boolean;
  ipWhitelist: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  enablePersonalization: boolean;
  enableRecommendations: boolean;
  enableABTesting: boolean;
  retentionDays: number;
  anonymizeData: boolean;
  enableHeatmaps: boolean;
  enableSessionRecording: boolean;
}

export interface IntegrationsConfig {
  enableWebhooks: boolean;
  enableAPI: boolean;
  enableSSO: boolean;
  enableLDAP: boolean;
  enableOAuth: boolean;
  webhookSecret: string;
  apiKey: string;
  ssoProvider: string;
  ldapServer: string;
  oauthProviders: OAuthProvider[];
}

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  enabled: boolean;
}

export interface FeaturesConfig {
  enableCourses: boolean;
  enableBlogs: boolean;
  enableNews: boolean;
  enableComments: boolean;
  enableReactions: boolean;
  enableBookmarks: boolean;
  enableRatings: boolean;
  enableSharing: boolean;
  enableExport: boolean;
  enableImport: boolean;
  enableTranslation: boolean;
  enableOffline: boolean;
  enableGamification: boolean;
  enableAI: boolean;
  enableProctoring: boolean;
  enableAnalytics: boolean;
}
