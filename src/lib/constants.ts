// Constantes globales de la aplicación
// Configuraciones, endpoints y valores inmutables

export const APP_CONFIG = {
  name: 'UTalk',
  version: '1.0.0',
  description: 'Plataforma de comunicación empresarial',
  author: 'UTalk Team',
} as const

export const API_ENDPOINTS = {
  auth: '/auth',
  users: '/users',
  contacts: '/contacts',
  messages: '/messages',
  campaigns: '/campaigns',
  teams: '/teams',
  knowledge: '/knowledge',
  analytics: '/analytics',
  settings: '/settings',
} as const

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