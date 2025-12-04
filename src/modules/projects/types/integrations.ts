// Integraciones con otros módulos

export interface ProjectIntegrations {
  hr: HRIntegration;
  inventory: InventoryIntegration;
  providers: ProviderIntegration;
  clients: ClientIntegration;
  internalChat: ChatIntegration;
}

// Integración con módulo HR
export interface HRIntegration {
  enabled: boolean;
  
  // Empleados asignados
  assignedEmployees: string[]; // Employee IDs
  
  // Time tracking
  timeTrackingEnabled: boolean;
  approveTimeEntries: boolean;
  exportToPayroll: boolean;
  
  // Disponibilidad
  checkAvailabilityBeforeAssign: boolean;
  showVacationsInTimeline: boolean;
  
  // Costos
  trackLaborCosts: boolean;
  includeInBudget: boolean;
  
  // Performance
  trackPerformance: boolean;
  performanceMetrics: string[];
  
  // Configuración
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSynced?: Date;
  
  // Permisos
  allowHRModuleAccess: boolean;
}

// Integración con módulo de Inventario
export interface InventoryIntegration {
  enabled: boolean;
  
  // Inventario vinculado
  linkedInventoryId?: string;
  
  // Comportamiento
  autoReserveMaterials: boolean;
  autoOrderOnLowStock: boolean;
  notifyOnLowStock: boolean;
  
  // Transferencias
  allowInventoryTransfer: boolean;
  requireApprovalForTransfer: boolean;
  
  // Tracking
  trackMaterialUsage: boolean;
  trackWaste: boolean;
  
  // Costos
  updateCostsFromInventory: boolean;
  includeInBudget: boolean;
  
  // Devoluciones
  allowReturns: boolean;
  autoReturnUnused: boolean;
  
  // Configuración
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSynced?: Date;
}

// Integración con módulo de Proveedores
export interface ProviderIntegration {
  enabled: boolean;
  
  // Proveedores preferidos
  preferredProviders: PreferredProvider[];
  
  // Órdenes de compra
  createPOInProvidersModule: boolean;
  linkPOToProject: boolean;
  
  // Cotizaciones
  requestQuotesFromProviders: boolean;
  compareQuotes: boolean;
  
  // Pagos
  trackPaymentsInProject: boolean;
  createInvoicesInProvidersModule: boolean;
  
  // Estado de cuenta
  showProviderBalance: boolean;
  includeInBudget: boolean;
  
  // Evaluación
  trackProviderPerformance: boolean;
  rateProviders: boolean;
  
  // Configuración
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSynced?: Date;
}

export interface PreferredProvider {
  providerId: string;
  providerName: string;
  categories: string[]; // Categorías de materiales
  priority: number;
  terms?: string;
  notes?: string;
}

// Integración con módulo de Clientes
export interface ClientIntegration {
  enabled: boolean;
  
  // Cliente vinculado
  clientId?: string;
  clientName?: string;
  clientContact?: string;
  
  // Facturación
  billToClient: boolean;
  invoicingSchedule: 'milestone' | 'monthly' | 'weekly' | 'on_demand';
  autoGenerateInvoices: boolean;
  
  // Portal del cliente
  enableClientPortal: boolean;
  clientPortalUrl?: string;
  allowClientApprovals: boolean;
  
  // Comunicación
  shareUpdates: boolean;
  updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  
  // Documentos
  shareDocuments: boolean;
  allowClientUpload: boolean;
  sharedFolders: string[];
  
  // Satisfacción
  collectFeedback: boolean;
  feedbackFrequency: 'after_milestone' | 'monthly' | 'end_of_project';
  
  // Configuración
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSynced?: Date;
}

// Integración con Chat Interno
export interface ChatIntegration {
  enabled: boolean;
  
  // Canal del proyecto
  channelId?: string;
  channelName?: string;
  autoCreateChannel: boolean;
  
  // Miembros
  autoAddTeamMembers: boolean;
  autoRemoveOnUnassign: boolean;
  
  // Notificaciones
  notifyOnTaskMention: boolean;
  notifyOnDocumentShare: boolean;
  notifyOnMilestone: boolean;
  
  // Compartir
  shareTasksInChat: boolean;
  shareDocumentsInChat: boolean;
  shareUpdatesInChat: boolean;
  
  // Configuración
  syncFrequency: 'realtime' | 'manual';
}

// Sincronización de datos
export interface IntegrationSync {
  moduleType: 'hr' | 'inventory' | 'providers' | 'clients' | 'chat';
  projectId: string;
  
  // Estado
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncAt?: Date;
  lastSyncDuration?: number; // Milisegundos
  
  // Resultados
  recordsSynced: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  
  // Errores
  errors: SyncError[];
  
  // Próxima sincronización
  nextSyncAt?: Date;
  
  // Configuración
  autoSync: boolean;
  syncFrequency: string;
}

export interface SyncError {
  recordId: string;
  recordType: string;
  error: string;
  timestamp: Date;
  retry: boolean;
  retryCount: number;
}

// Webhooks para integraciones externas
export interface Webhook {
  id: string;
  projectId: string;
  
  // Configuración
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: { [key: string]: string };
  
  // Eventos que disparan el webhook
  events: WebhookEvent[];
  
  // Seguridad
  secret?: string;
  signatureHeader?: string;
  
  // Retry
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number; // Segundos
  
  // Estado
  enabled: boolean;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  
  // Logs
  logs: WebhookLog[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type WebhookEvent = 
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'budget.exceeded'
  | 'milestone.reached'
  | 'document.uploaded'
  | 'inspection.completed'
  | 'risk.identified'
  | 'team.member_added'
  | 'all';

export interface WebhookLog {
  id: string;
  triggeredAt: Date;
  event: WebhookEvent;
  
  // Request
  requestUrl: string;
  requestMethod: string;
  requestHeaders: { [key: string]: string };
  requestBody: any;
  
  // Response
  responseStatus?: number;
  responseBody?: any;
  responseTime: number; // Milisegundos
  
  // Resultado
  success: boolean;
  error?: string;
  
  // Retry
  retryCount: number;
  retriedAt?: Date;
}

// Configuración de integración
export interface IntegrationSettings {
  projectId: string;
  
  // Módulos habilitados
  enabledModules: {
    hr: boolean;
    inventory: boolean;
    providers: boolean;
    clients: boolean;
    internalChat: boolean;
  };
  
  // Comportamiento global
  autoSync: boolean;
  syncOnSave: boolean;
  conflictResolution: 'manual' | 'auto_local' | 'auto_remote' | 'merge';
  
  // Notificaciones
  notifyOnSyncError: boolean;
  notifyRecipients: string[];
  
  // Permisos
  whoCanConfigureIntegrations: string[]; // Roles
  
  // Webhooks
  webhooks: Webhook[];
  
  // Metadata
  updatedAt: Date;
  updatedBy: string;
}

// Mapeo de campos entre módulos
export interface FieldMapping {
  sourceModule: string;
  sourceField: string;
  targetModule: string;
  targetField: string;
  
  // Transformación
  transform?: 'none' | 'uppercase' | 'lowercase' | 'date_format' | 'number_format' | 'custom';
  transformFunction?: string;
  
  // Sincronización
  syncDirection: 'one_way' | 'two_way';
  syncOnChange: boolean;
  
  // Validación
  required: boolean;
  validation?: any;
}

// Datos compartidos entre módulos
export interface SharedData {
  // Del módulo HR
  employees: {
    id: string;
    name: string;
    email: string;
    role: string;
    hourlyRate: number;
    availability: any;
  }[];
  
  // Del módulo Inventory
  materials: {
    id: string;
    name: string;
    stock: number;
    unit: string;
    cost: number;
  }[];
  
  // Del módulo Providers
  providers: {
    id: string;
    name: string;
    categories: string[];
    rating: number;
    terms: string;
  }[];
  
  // Del módulo Clients
  client?: {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
  };
}

