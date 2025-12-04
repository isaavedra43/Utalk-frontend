// Sistema documental

export type DocumentCategory = 
  | 'plans'          // Planos
  | 'specifications' // Especificaciones
  | 'contracts'      // Contratos
  | 'permits'        // Permisos y licencias
  | 'reports'        // Reportes
  | 'photos'         // Fotografías
  | 'videos'         // Videos
  | 'certificates'   // Certificados
  | 'invoices'       // Facturas
  | 'correspondence' // Correspondencia
  | 'manuals'        // Manuales
  | 'other';

export interface ProjectDocuments {
  projectId: string;
  
  // Estructura de carpetas personalizable
  folders: DocumentFolder[];
  
  // Documentos del proyecto
  documents: Document[];
  
  // Plantillas
  templates: DocumentTemplate[];
  
  // Versionamiento
  versions: DocumentVersion[];
  
  // Aprobaciones pendientes
  pendingApprovals: DocumentApproval[];
  
  // Búsqueda
  searchIndexed: boolean;
  lastIndexed?: Date;
  
  // Estadísticas
  totalDocuments: number;
  totalSize: number; // Bytes
  documentsByCategory: { [category: string]: number };
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // Para estructura anidada
  path: string; // Path completo (ej: "/Planos/Arquitectónicos")
  
  // Configuración
  color?: string;
  icon?: string;
  order: number;
  
  // Permisos
  permissions?: FolderPermissions;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Document {
  id: string;
  projectId: string;
  folderId?: string;
  
  // Información básica
  name: string;
  description?: string;
  type: string; // PDF, DOCX, XLSX, DWG, etc.
  category: DocumentCategory;
  
  // Almacenamiento
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  
  // Metadata
  tags: string[];
  customFields: { [key: string]: any };
  
  // Relaciones
  relatedTaskIds: string[];
  relatedPhaseIds: string[];
  relatedMilestoneIds: string[];
  relatedDocumentIds: string[]; // Documentos relacionados
  
  // Versionamiento
  version: number;
  versionHistory: DocumentVersion[];
  isLatestVersion: boolean;
  
  // Permisos
  permissions?: DocumentPermissions;
  
  // Colaboración
  comments: DocumentComment[];
  annotations: Annotation[];
  
  // Aprobaciones
  requiresApproval: boolean;
  approvalWorkflow?: string; // ID del workflow
  approvalStatus?: ApprovalStatus;
  approvals: DocumentApproval[];
  
  // Tracking
  views: number;
  downloads: number;
  lastViewedAt?: Date;
  lastViewedBy?: string;
  
  // Estado
  status: 'draft' | 'review' | 'approved' | 'archived' | 'obsolete';
  
  // Auditoría
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  viewHistory: ViewHistory[];
  
  // Búsqueda
  indexed: boolean;
  extractedText?: string; // Para búsqueda full-text
  ocrProcessed?: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  
  // Cambios
  changeDescription?: string;
  changedBy: string;
  changedAt: Date;
  
  // Comparación
  diffUrl?: string; // URL del diff si es posible
  
  // Estado
  isCurrent: boolean;
  canRestore: boolean;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  
  // Posición en el documento (si aplica)
  page?: number;
  position?: {
    x: number;
    y: number;
  };
  
  // Thread
  replyTo?: string;
  replies: DocumentComment[];
  
  // Estado
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Menciones
  mentions: string[];
  
  // Attachments
  attachments: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  reactions: { emoji: string; userId: string }[];
}

export interface Annotation {
  id: string;
  documentId: string;
  type: 'highlight' | 'note' | 'drawing' | 'stamp';
  
  // Posición
  page: number;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  
  // Contenido
  text?: string;
  color?: string;
  drawingData?: string; // SVG o path data
  
  // Autor
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

export interface DocumentApproval {
  id: string;
  documentId: string;
  workflowId?: string;
  
  // Aprobador
  approver: string;
  approverName: string;
  required: boolean;
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  // Respuesta
  approvedAt?: Date;
  rejectedAt?: Date;
  comments?: string;
  conditions?: string; // Condiciones de aprobación
  
  // Orden (para aprobaciones secuenciales)
  order: number;
  
  // Notificaciones
  notifiedAt?: Date;
  remindersSent: number;
  
  // Timeout
  timeout?: number; // Horas
  escalateTo?: string; // A quién escalar si no responde
}

export type ApprovalStatus = 
  | 'not_required'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'conditional'
  | 'cancelled';

export interface DocumentPermissions {
  // Quién puede ver
  canView: string[]; // User IDs o roles
  
  // Quién puede editar
  canEdit: string[];
  
  // Quién puede eliminar
  canDelete: string[];
  
  // Quién puede aprobar
  canApprove: string[];
  
  // Quién puede compartir
  canShare: string[];
  
  // Es público en el proyecto
  isPublic: boolean;
  
  // Restricciones
  downloadRestricted: boolean;
  printRestricted: boolean;
  copyRestricted: boolean;
}

export interface FolderPermissions {
  inheritFromParent: boolean;
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canManage: string[];
}

export interface ViewHistory {
  userId: string;
  userName: string;
  viewedAt: Date;
  duration?: number; // Segundos
  device?: string;
  ipAddress?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  
  // Template file
  templateUrl: string;
  previewUrl?: string;
  
  // Variables del template
  variables: TemplateVariable[];
  
  // Uso
  timesUsed: number;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  isPublic: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'image';
  defaultValue?: any;
  required: boolean;
  description?: string;
}

// Búsqueda de documentos
export interface DocumentSearchFilters {
  query?: string;
  category?: DocumentCategory[];
  folderId?: string;
  tags?: string[];
  uploadedBy?: string[];
  uploadedFrom?: Date;
  uploadedTo?: Date;
  status?: string[];
  fileType?: string[];
  requiresApproval?: boolean;
  approvalStatus?: ApprovalStatus[];
  minSize?: number;
  maxSize?: number;
}

export interface DocumentSearchResult {
  document: Document;
  relevance: number;
  highlights: string[];
  matchedIn: ('name' | 'description' | 'content' | 'tags' | 'comments')[];
}

