// Constantes globales de la aplicación
// Configuraciones, endpoints y valores inmutables

export const APP_CONFIG = {
  name: 'UTalk',
  version: '1.0.0',
  description: 'Plataforma de comunicación empresarial',
  author: 'UTalk Team',
} as const

// Constantes centralizadas para endpoints de la API
// ✅ EMAIL-FIRST: Todos los identificadores usan email
// Sin dependencias Firebase, UID o Firestore

export const API_ENDPOINTS = {
  // ✅ Autenticación con backend propio
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VALIDATE_TOKEN: '/auth/validate-token',
    REFRESH: '/auth/refresh'
  },
  
  // ✅ Usuarios usando EMAIL como identificador
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    BY_EMAIL: (email: string) => `/users/email/${encodeURIComponent(email)}`,
    UPDATE: (email: string) => `/users/${encodeURIComponent(email)}`,
    DELETE: (email: string) => `/users/${encodeURIComponent(email)}`,
    PROFILE: (email: string) => `/users/${encodeURIComponent(email)}/profile`,
    PERMISSIONS: (email: string) => `/users/${encodeURIComponent(email)}/permissions`,
    ROLES: (email: string) => `/users/${encodeURIComponent(email)}/roles`
  },
  
  // ✅ Conversaciones usando EMAIL para asignación
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    GET: (id: string) => `/conversations/${id}`,
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    BY_ASSIGNED: (email: string) => `/conversations/assigned/${encodeURIComponent(email)}`,
    BY_PARTICIPANT: (email: string) => `/conversations/participant/${encodeURIComponent(email)}`,
    ASSIGN: (id: string) => `/conversations/${id}/assign`,
    UNASSIGN: (id: string) => `/conversations/${id}/unassign`
  },
  
  // ✅ Mensajes usando EMAIL para identificación
  MESSAGES: {
    LIST: '/messages',
    CREATE: '/messages',
    GET: (id: string) => `/messages/${id}`,
    UPDATE: (id: string) => `/messages/${id}`,
    DELETE: (id: string) => `/messages/${id}`,
    BY_SENDER: (email: string) => `/messages/sender/${encodeURIComponent(email)}`,
    BY_RECIPIENT: (email: string) => `/messages/recipient/${encodeURIComponent(email)}`,
    MARK_READ: (id: string) => `/messages/${id}/read`,
    SEARCH: '/messages/search'
  },
  
  // ✅ Contactos
  CONTACTS: {
    LIST: '/contacts',
    CREATE: '/contacts',
    GET: (id: string) => `/contacts/${id}`,
    UPDATE: (id: string) => `/contacts/${id}`,
    DELETE: (id: string) => `/contacts/${id}`,
    SEARCH: '/contacts/search'
  },
  
  // ✅ Campañas con asignación por EMAIL
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    STATS: (id: string) => `/campaigns/${id}/stats`,
    BY_ASSIGNED: (email: string) => `/campaigns/assigned/${encodeURIComponent(email)}`
  },
  
  // ✅ Agentes IA usando EMAIL
  AGENTS: {
    LIST: '/agents',
    CREATE: '/agents',
    GET: (id: string) => `/agents/${id}`,
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`,
    ANALYTICS: (id: string) => `/agents/${id}/analytics`,
    BY_CREATOR: (email: string) => `/agents/creator/${encodeURIComponent(email)}`
  },
  
  // ✅ Base de conocimientos
  KNOWLEDGE: {
    LIST: '/knowledge',
    CREATE: '/knowledge',
    GET: (id: string) => `/knowledge/${id}`,
    UPDATE: (id: string) => `/knowledge/${id}`,
    DELETE: (id: string) => `/knowledge/${id}`,
    SEARCH: '/knowledge/search'
  },
  
  // ✅ Permisos y roles por EMAIL
  PERMISSIONS: {
    CHECK: (email: string, permission: string) => `/permissions/check/${encodeURIComponent(email)}/${permission}`,
    LIST: (email: string) => `/permissions/user/${encodeURIComponent(email)}`,
    UPDATE: (email: string) => `/permissions/user/${encodeURIComponent(email)}`
  },
  
  // ✅ Sistema y configuración
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/status',
    CONFIG: '/config'
  }
} as const

// ✅ Parámetros de filtros usando EMAIL
export const FILTER_PARAMS = {
  // ✅ Filtros generales
  ASSIGNED_TO: 'assignedTo',
  STATUS: 'status',
  CHANNEL: 'channel',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  
  // ✅ Filtros para conversaciones con EMAIL
  CONVERSATIONS: {
    ASSIGNED_TO: 'assignedTo',
    PARTICIPANT_EMAIL: 'participantEmail',
    CUSTOMER_EMAIL: 'customerEmail',
    AGENT_EMAIL: 'agentEmail',
    STATUS: 'status',
    CHANNEL: 'channel',
    DATE_FROM: 'dateFrom',
    DATE_TO: 'dateTo',
  },
  
  // ✅ Filtros para mensajes con EMAIL
  MESSAGES: {
    SENDER_EMAIL: 'senderEmail',
    RECIPIENT_EMAIL: 'recipientEmail',
    CONVERSATION_ID: 'conversationId',
    DATE_FROM: 'dateFrom',
    DATE_TO: 'dateTo',
  },
  
  // ✅ Campos comunes usando EMAIL
  SENDER_EMAIL: 'senderEmail',
  RECIPIENT_EMAIL: 'recipientEmail',
  CUSTOMER_EMAIL: 'customerEmail',
  AGENT_EMAIL: 'agentEmail',
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