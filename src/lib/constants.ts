// Constantes globales de la aplicación
// Configuraciones, endpoints y valores inmutables

export const APP_CONFIG = {
  name: 'UTalk',
  version: '1.0.0',
  description: 'Plataforma de comunicación empresarial',
  author: 'UTalk Team',
} as const

// Constantes centralizadas para endpoints de la API
// Previene duplicación de rutas y facilita mantenimiento

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  
  // Usuarios y equipos
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile'
  },
  
  // Conversaciones y mensajes
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    GET: (id: string) => `/conversations/${id}`,
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`
  },
  
  // Contactos CRM
  CONTACTS: {
    LIST: '/contacts',
    CREATE: '/contacts',
    GET: (id: string) => `/contacts/${id}`,
    UPDATE: (id: string) => `/contacts/${id}`,
    DELETE: (id: string) => `/contacts/${id}`,
    SEARCH: '/contacts/search'
  },
  
  // Campañas
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    START: (id: string) => `/campaigns/${id}/start`,
    STOP: (id: string) => `/campaigns/${id}/stop`
  },
  
  // Agentes IA
  AGENTS: {
    LIST: '/agents',
    CREATE: '/agents',
    GET: (id: string) => `/agents/${id}`,
    UPDATE: (id: string) => `/agents/${id}`,
    DELETE: (id: string) => `/agents/${id}`,
    TRAIN: (id: string) => `/agents/${id}/train`
  },
  
  // Base de conocimiento
  KNOWLEDGE: {
    LIST: '/knowledge',
    CREATE: '/knowledge',
    GET: (id: string) => `/knowledge/${id}`,
    UPDATE: (id: string) => `/knowledge/${id}`,
    DELETE: (id: string) => `/knowledge/${id}`,
    SEARCH: '/knowledge/search'
  },
  
  // Sistema
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/status',
    CONFIG: '/config'
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