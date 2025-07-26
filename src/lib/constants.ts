// Constantes globales de la aplicación
// Configuraciones, endpoints y valores inmutables

export const APP_CONFIG = {
  name: 'UTalk',
  version: '1.0.0',
  description: 'Plataforma de comunicación empresarial',
  author: 'UTalk Team',
} as const

// Constantes centralizadas para endpoints de la API
// ✅ ACTUALIZADA: Endpoints alineados con UID de Firebase + Firestore
// Previene duplicación de rutas y facilita mantenimiento

export const API_ENDPOINTS = {
  // ✅ ACTUALIZADA: Autenticación con soporte para Firestore
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    // ✅ NUEVOS: Endpoints específicos de Firestore
    USER_FIRESTORE: (uid: string) => `/auth/user/${uid}/firestore`,
    SYNC_FIRESTORE: (uid: string) => `/auth/user/${uid}/sync`,
    CREATE_FIRESTORE_USER: '/auth/firestore/create'
  },
  
  // ✅ ACTUALIZADA: Usuarios usando UID como identificador
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (uid: string) => `/users/${uid}`,          // ✅ Usa UID
    DELETE: (uid: string) => `/users/${uid}`,          // ✅ Usa UID
    PROFILE: (uid: string) => `/users/${uid}/profile`, // ✅ Usa UID
    BY_UID: (uid: string) => `/users/uid/${uid}`,      // ✅ NUEVO: Buscar por UID
    PERMISSIONS: (uid: string) => `/users/${uid}/permissions`,
    ROLES: (uid: string) => `/users/${uid}/roles`
  },
  
  // ✅ ACTUALIZADA: Conversaciones usando UID para asignación
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    GET: (id: string) => `/conversations/${id}`,
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    // ✅ NUEVOS: Filtros por UID
    BY_ASSIGNED: (uid: string) => `/conversations/assigned/${uid}`,
    BY_PARTICIPANT: (uid: string) => `/conversations/participant/${uid}`,
    ASSIGN: (id: string) => `/conversations/${id}/assign`,
    UNASSIGN: (id: string) => `/conversations/${id}/unassign`
  },
  
  // ✅ ACTUALIZADA: Mensajes usando UID para identificación
  MESSAGES: {
    LIST: '/messages',
    CREATE: '/messages',
    GET: (id: string) => `/messages/${id}`,
    UPDATE: (id: string) => `/messages/${id}`,
    DELETE: (id: string) => `/messages/${id}`,
    // ✅ NUEVOS: Filtros por UID
    BY_SENDER: (uid: string) => `/messages/sender/${uid}`,
    BY_RECIPIENT: (uid: string) => `/messages/recipient/${uid}`,
    SEND: '/messages/send',
    MARK_READ: (id: string) => `/messages/${id}/read`
  },
  
  // Contactos CRM (sin cambios significativos)
  CONTACTS: {
    LIST: '/contacts',
    CREATE: '/contacts',
    GET: (id: string) => `/contacts/${id}`,
    UPDATE: (id: string) => `/contacts/${id}`,
    DELETE: (id: string) => `/contacts/${id}`,
    SEARCH: '/contacts/search'
  },
  
  // ✅ ACTUALIZADA: Campañas con asignación por UID
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    START: (id: string) => `/campaigns/${id}/start`,
    STOP: (id: string) => `/campaigns/${id}/stop`,
    // ✅ NUEVOS: Asignación por UID
    ASSIGN: (id: string) => `/campaigns/${id}/assign`,
    BY_ASSIGNED: (uid: string) => `/campaigns/assigned/${uid}`
  },
  
  // ✅ ACTUALIZADA: Agentes IA usando UID
  AGENTS: {
    LIST: '/agents',
    CREATE: '/agents',
    GET: (id: string) => `/agents/${id}`,
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`,
    TRAIN: (id: string) => `/agents/${id}/train`,
    // ✅ NUEVOS: Por UID de creador/asignado
    BY_CREATOR: (uid: string) => `/agents/creator/${uid}`,
    ASSIGN: (id: string) => `/agents/${id}/assign`
  },
  
  // Base de conocimiento (sin cambios significativos)
  KNOWLEDGE: {
    LIST: '/knowledge',
    CREATE: '/knowledge',
    GET: (id: string) => `/knowledge/${id}`,
    UPDATE: (id: string) => `/knowledge/${id}`,
    DELETE: (id: string) => `/knowledge/${id}`,
    SEARCH: '/knowledge/search'
  },
  
  // ✅ NUEVOS: Endpoints específicos de Firestore
  FIRESTORE: {
    USER_EXISTS: (uid: string) => `/firestore/users/${uid}/exists`,
    USER_CREATE: '/firestore/users/create',
    USER_UPDATE: (uid: string) => `/firestore/users/${uid}`,
    USER_DELETE: (uid: string) => `/firestore/users/${uid}`,
    SYNC_ALL: '/firestore/sync/all',
    HEALTH: '/firestore/health'
  },
  
  // ✅ NUEVOS: Endpoints de permisos y roles
  PERMISSIONS: {
    CHECK: (uid: string, permission: string) => `/permissions/check/${uid}/${permission}`,
    LIST: (uid: string) => `/permissions/user/${uid}`,
    GRANT: '/permissions/grant',
    REVOKE: '/permissions/revoke'
  },
  
  // Sistema
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/status',
    CONFIG: '/config'
  }
} as const

// ✅ NUEVAS: Funciones helper para construcción de filtros con UID
export const FILTER_PARAMS = {
  // Filtros de conversaciones
  CONVERSATIONS: {
    ASSIGNED_TO: 'assignedTo',        // UID del agente asignado
    PARTICIPANT: 'participantUid',    // UID del participante
    CUSTOMER_UID: 'customerUid',      // UID del cliente
    AGENT_UID: 'agentUid',           // UID del agente
    STATUS: 'status',
    CHANNEL: 'channel',
    DATE_FROM: 'dateFrom',
    DATE_TO: 'dateTo'
  },
  
  // Filtros de mensajes
  MESSAGES: {
    SENDER_UID: 'senderUid',         // UID del remitente
    RECIPIENT_UID: 'recipientUid',   // UID del destinatario
    CONVERSATION_ID: 'conversationId',
    TYPE: 'type',
    STATUS: 'status',
    DATE_FROM: 'dateFrom',
    DATE_TO: 'dateTo'
  },
  
  // Filtros de usuarios
  USERS: {
    ROLE: 'role',
    STATUS: 'status',
    DEPARTMENT: 'department',
    IS_ONLINE: 'isOnline'
  }
} as const

// Tipos para TypeScript
export type ApiEndpoint = typeof API_ENDPOINTS
export type AuthEndpoint = typeof API_ENDPOINTS.AUTH
export type UsersEndpoint = typeof API_ENDPOINTS.USERS
export type ConversationsEndpoint = typeof API_ENDPOINTS.CONVERSATIONS
export type ContactsEndpoint = typeof API_ENDPOINTS.CONTACTS
export type CampaignsEndpoint = typeof API_ENDPOINTS.CAMPAIGNS
export type AgentsEndpoint = typeof API_ENDPOINTS.AGENTS
export type KnowledgeEndpoint = typeof API_ENDPOINTS.KNOWLEDGE
export type SystemEndpoint = typeof API_ENDPOINTS.SYSTEM

// Función helper para construir URLs completas
export function buildApiUrl(endpoint: string): string {
  const baseURL = import.meta.env.VITE_API_URL
  
  // Validar que no haya duplicación de /api
  if (baseURL.endsWith('/api') && endpoint.startsWith('/api')) {
    console.warn(`⚠️ Potential URL duplication: ${baseURL} + ${endpoint}`)
  }
  
  return `${baseURL}${endpoint}`
}

// Función helper para validar endpoints
export function validateEndpoint(endpoint: string): boolean {
  // Verificar que el endpoint no empiece con /api si la base URL ya lo incluye
  const baseURL = import.meta.env.VITE_API_URL
  
  if (baseURL.endsWith('/api') && endpoint.startsWith('/api')) {
    console.error(`❌ Endpoint duplication detected: ${endpoint}`)
    return false
  }
  
  return true
}

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  crm: '/crm',
  chat: '/chat',
  campaigns: '/campaigns',
  team: '/team',
  knowledge: '/knowledge',
  settings: '/settings',
} as const

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const

export const UPLOAD = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'text/plain'],
} as const

export const VALIDATION = {
  minPasswordLength: 8,
  maxNameLength: 50,
  maxEmailLength: 100,
  maxMessageLength: 2000,
} as const

export const UI = {
  sidebarWidth: 280,
  headerHeight: 64,
  mobileBreakpoint: 768,
} as const 