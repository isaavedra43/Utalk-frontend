// Tipos comunes compartidos

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: GPSCoordinates;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // Metros
  altitude?: number;
  timestamp?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  description?: string;
  type: string; // MIME type
  extension: string;
  size: number; // Bytes
  url: string;
  thumbnailUrl?: string;
  
  // Metadata
  uploadedAt: Date;
  uploadedBy: string;
  uploadedByName: string;
  
  // Categoría
  category?: string;
  tags: string[];
  
  // Escaneo
  virusScanned: boolean;
  scanResult?: 'clean' | 'infected' | 'suspicious';
  
  // Versionamiento (si es parte de un documento)
  version?: number;
  documentId?: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // Para 'between'
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_or_equal'
  | 'less_than'
  | 'less_or_equal'
  | 'between'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'is_empty'
  | 'is_not_empty';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: Date;
  version: string;
  pagination?: Pagination;
  executionTime?: number; // Milisegundos
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  estimatedTimeRemaining?: number; // Segundos
}

// Configuración de exportación
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'zip';
  
  // Qué incluir
  includeData: string[];
  includeAttachments: boolean;
  includeComments: boolean;
  includeHistory: boolean;
  
  // Formato
  template?: string;
  customization?: any;
  
  // Filtros
  dateRange?: DateRange;
  filters?: FilterConfig[];
  
  // Opciones
  compress: boolean;
  encryption?: {
    enabled: boolean;
    password?: string;
  };
}

// Configuración de importación
export interface ImportConfig {
  source: 'file' | 'url' | 'api';
  format: 'excel' | 'csv' | 'json' | 'xml' | 'mpp' | 'other';
  
  // Mapeo de campos
  fieldMapping: { [sourceField: string]: string };
  
  // Opciones
  skipErrors: boolean;
  validateBeforeImport: boolean;
  dryRun: boolean; // No guardar, solo validar
  
  // Duplicados
  duplicateHandling: 'skip' | 'update' | 'create_new';
  duplicateCheckFields: string[];
}

// Resultado de operación
export interface OperationResult {
  success: boolean;
  message: string;
  
  // Detalles
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  
  // Errores
  errors: OperationError[];
  warnings: string[];
  
  // Datos resultantes
  data?: any;
  
  // Tiempo
  startedAt: Date;
  completedAt: Date;
  duration: number; // Milisegundos
}

export interface OperationError {
  itemId?: string;
  itemName?: string;
  error: string;
  code?: string;
  recoverable: boolean;
}

// Configuración de UI
export interface UIPreferences {
  userId: string;
  projectId?: string; // Si es específico de proyecto
  
  // Vista
  defaultView: string;
  compactMode: boolean;
  showSidebar: boolean;
  sidebarWidth: number;
  
  // Tema
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  
  // Notificaciones
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  
  // Atajos
  customKeyboardShortcuts: { [key: string]: string };
  
  // Otros
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  
  updatedAt: Date;
}

