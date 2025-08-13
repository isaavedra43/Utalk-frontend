/**
 * Verificación de Alineación con Backend UTalk
 * Basado en la documentación exacta del backend (3.md, 1.5.md, 1.md, 2.md)
 */

import { logStore } from '$lib/utils/logger';

// Tipos exactos según la documentación del backend
export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'viewer';
  isActive: boolean;
  avatar: string | null;
  lastSeen: string;
  isOnline: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface BackendAuthResponse {
  success: boolean;
  data: {
    user: BackendUser;
    tokens: BackendAuthTokens;
  };
}

export interface BackendConversation {
  id: string;
  participants: string[];
  customerPhone: string;
  contact: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    avatar: string | null;
    company: string | null;
    notes: string | null;
    channel: string;
    createdAt: string;
    updatedAt: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  status: 'open' | 'pending' | 'resolved' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  unreadCount: number;
  messageCount: number;
  lastMessage: {
    id: string;
    content: string;
    timestamp: string;
    sender: string;
    type: string;
    status: string;
  } | null;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: {
    source: string;
    autoAssigned: boolean;
    favorite: boolean;
  };
}

export interface BackendMessage {
  id: string;
  conversationId: string;
  content: string;
  mediaUrl: string | null;
  senderIdentifier: string;
  recipientIdentifier: string;
  sender: {
    identifier: string;
    type: 'customer' | 'agent';
    name: string;
  };
  recipient: {
    identifier: string;
    type: 'customer' | 'agent';
    name: string;
  };
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  metadata: {
    twilioSid?: string;
    sentViaSocket?: boolean;
    socketId?: string | null;
    readBy?: string[];
    readAt?: string | null;
    failureReason?: string;
    twilioError?: string;
    retryable?: boolean;
    retryCount?: number;
    maxRetries?: number;
    fileInfo?: {
      filename: string;
      size: number;
      mimeType: string;
      thumbnail?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface BackendContact {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  avatar: string | null;
  company: string | null;
  notes: string | null;
  channel: string;
  isActive: boolean;
  tags: string[];
  metadata: {
    lastContact: string;
    totalConversations: number;
    totalMessages: number;
    preferredLanguage: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BackendFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string | null;
  thumbnail: string | null;
  metadata: {
    uploadedBy: string;
    uploadedAt: string | null;
    conversationId: string | null;
    messageId: string | null;
    progress?: number;
    error?: string;
    errorCode?: string;
  };
  status: 'uploading' | 'uploaded' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface BackendPagination {
  hasMore: boolean;
  nextCursor: string | null;
  totalResults: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: BackendPagination;
  metadata?: {
    queryTime: string;
    appliedFilters: string[];
  };
}

export interface BackendErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Endpoints exactos según la documentación
export const BACKEND_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // Conversations
  CONVERSATIONS: '/conversations',
  CONVERSATION_BY_ID: (id: string) => `/conversations/${id}`,
  CONVERSATION_MESSAGES: (id: string) => `/conversations/${id}/messages`,
  CONVERSATION_MESSAGE: (convId: string, msgId: string) =>
    `/conversations/${convId}/messages/${msgId}`,
  CONVERSATION_MESSAGE_READ: (convId: string, msgId: string) =>
    `/conversations/${convId}/messages/${msgId}/read`,

  // Contacts
  CONTACTS: '/contacts',
  CONTACT_BY_ID: (id: string) => `/contacts/${id}`,

  // Files
  FILES_UPLOAD: '/files/upload',
  FILE_BY_ID: (id: string) => `/files/${id}`,
  FILE_DOWNLOAD: (id: string) => `/files/${id}/download`,

  // Stats
  STATS_CONVERSATIONS: '/stats/conversations',
  STATS_MESSAGES: '/stats/messages'
} as const;

// Códigos de error exactos del backend
export const BACKEND_ERROR_CODES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_EXPIRED_DURING_PROCESSING: 'TOKEN_EXPIRED_DURING_PROCESSING',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  CONTACT_NOT_FOUND: 'CONTACT_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND'
} as const;

// Headers exactos del backend
export const BACKEND_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  RATE_LIMIT_LIMIT: 'X-RateLimit-Limit'
} as const;

// Límites exactos del backend
export const BACKEND_LIMITS = {
  MESSAGE_MAX_LENGTH: 4096, // bytes
  FILE_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES_PER_MESSAGE: 10,
  MAX_CONVERSATIONS_PER_PAGE: 50,
  MAX_MESSAGES_PER_PAGE: 50
} as const;

// Tipos de archivo permitidos exactos
export const BACKEND_ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  'application/pdf'
] as const;

// Extensiones permitidas exactas
export const BACKEND_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp3',
  '.ogg',
  '.wav',
  '.mp4',
  '.webm',
  '.pdf'
] as const;

// Extensiones bloqueadas exactas
export const BACKEND_BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.msi',
  '.dmg',
  '.app',
  '.sh',
  '.py',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.pl',
  '.cgi',
  '.htaccess',
  '.htpasswd'
] as const;

/**
 * Verifica si un modelo coincide exactamente con el backend
 */
export function validateBackendAlignment<T>(
  model: T,
  expectedType: keyof typeof BACKEND_MODELS,
  context?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Verificar estructura básica
    if (!model || typeof model !== 'object') {
      errors.push(`${expectedType}: modelo no es un objeto válido`);
      return { valid: false, errors };
    }

    // Verificar campos requeridos según el tipo
    const requiredFields = BACKEND_MODELS[expectedType];
    for (const field of requiredFields) {
      if (!(field in model)) {
        errors.push(`${expectedType}: campo requerido '${field}' no encontrado`);
      }
    }

    logStore('backend-alignment: validación', {
      type: expectedType,
      context,
      valid: errors.length === 0,
      errorCount: errors.length
    });

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`${expectedType}: error durante validación - ${String(error)}`);
    return { valid: false, errors };
  }
}

// Modelos esperados según la documentación
const BACKEND_MODELS = {
  user: ['id', 'email', 'name', 'role', 'isActive'],
  conversation: ['id', 'participants', 'customerPhone', 'status', 'createdAt', 'updatedAt'],
  message: [
    'id',
    'conversationId',
    'content',
    'senderIdentifier',
    'recipientIdentifier',
    'direction',
    'type',
    'status',
    'timestamp'
  ],
  contact: ['id', 'phone', 'channel', 'isActive', 'createdAt', 'updatedAt'],
  file: ['id', 'filename', 'originalName', 'size', 'mimeType', 'status', 'createdAt', 'updatedAt']
} as const;

/**
 * Verifica que un endpoint coincida con la documentación
 */
export function validateEndpoint(
  endpoint: string,
  method: string,
  expectedEndpoint: string,
  context?: string
): { valid: boolean; error?: string } {
  const isValid = endpoint === expectedEndpoint;

  if (!isValid) {
    const error = `Endpoint incorrecto: ${method} ${endpoint} (esperado: ${expectedEndpoint})`;
    logStore('backend-alignment: endpoint inválido', {
      actual: endpoint,
      expected: expectedEndpoint,
      method,
      context
    });
    return { valid: false, error };
  }

  logStore('backend-alignment: endpoint válido', {
    endpoint,
    method,
    context
  });

  return { valid: true };
}

/**
 * Verifica que un código de error sea válido según el backend
 */
export function validateErrorCode(code: string): boolean {
  const validCodes = Object.values(BACKEND_ERROR_CODES);
  return validCodes.includes(code as any);
}

/**
 * Verifica que un límite coincida con el backend
 */
export function validateLimit(
  limit: number,
  limitType: keyof typeof BACKEND_LIMITS,
  context?: string
): { valid: boolean; error?: string } {
  const expectedLimit = BACKEND_LIMITS[limitType];

  if (limit !== expectedLimit) {
    const error = `Límite incorrecto para ${limitType}: ${limit} (esperado: ${expectedLimit})`;
    logStore('backend-alignment: límite inválido', {
      actual: limit,
      expected: expectedLimit,
      limitType,
      context
    });
    return { valid: false, error };
  }

  return { valid: true };
}
