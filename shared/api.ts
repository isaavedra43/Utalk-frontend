/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 * 
 * ⚠️ TIPOS GLOBALES CONGELADOS - NO MODIFICAR DURANTE LIMPIEZA ⚠️
 * 
 * ESTRUCTURA DE TIPOS CONGELADOS:
 * 
 * Contact:
 * - id: string
 * - firstName: string
 * - lastName: string  
 * - email: string
 * - phone: string
 * - status: "lead" | "customer" | "inactive"
 * - channel: "whatsapp" | "facebook" | "instagram" | "telegram" | "email" | "phone" | "web"
 * - owner: string
 * - tags: string[]
 * - notes?: string
 * - company?: string
 * - position?: string
 * - website?: string
 * - address?: string
 * - city?: string
 * - country?: string
 * - birthDate?: string
 * - lastInteraction?: string
 * - createdAt: string
 * - updatedAt: string
 * - customFields?: Record<string, any>
 * - avatarUrl?: string
 * - aiScore?: number
 * - sentiment?: "positive" | "negative" | "neutral"
 * 
 * CreateContactRequest: Todos los campos de Contact excepto id, createdAt, updatedAt
 * UpdateContactRequest: Todos los campos de Contact opcionales excepto id
 * ContactTagsResponse: string[] (array de tags)
 * 
 * ⚠️ NO CAMBIAR ESTOS TIPOS HASTA TERMINAR LIMPIEZA COMPLETA ⚠️
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Authentication types - Exactos al contrato del backend
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// POST /api/auth/login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: string;
  message?: string; // Agregado para alineación con backend
}

// GET /api/auth/me
export interface AuthMeResponse {
  user: User;
  message?: string; // Agregado para alineación con backend
}

// POST /api/auth/logout
export interface LogoutResponse {
  message: string;
}

// POST /api/auth/refresh (futuro)
export interface RefreshTokenResponse {
  token: string;
  expiresIn: string;
}

// PUT /api/auth/profile
export interface UpdateProfileRequest {
  name: string;
  // settings?: any; // Para futuras expansiones
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

// POST /api/auth/forgot-password
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Contacts/CRM types - Estructura del backend
 */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "lead" | "customer" | "inactive";
  channel: "whatsapp" | "facebook" | "instagram" | "telegram" | "email" | "phone" | "web";
  owner: string; // ID del agente asignado
  tags: string[];
  notes?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string; // ISO date
  lastInteraction?: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  customFields?: Record<string, any>;
  avatarUrl?: string;
  aiScore?: number;
  sentiment?: "positive" | "negative" | "neutral";
}

// GET /api/contacts
export interface ContactsListRequest {
  page?: number;
  limit?: number;
  search?: string;
  status?: Contact['status'];
  channel?: Contact['channel'];
  owner?: string;
  tags?: string[];
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastInteraction';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactsListResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// POST /api/contacts
export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status?: Contact['status'];
  channel?: Contact['channel'];
  tags?: string[];
  notes?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  customFields?: Record<string, any>;
}

export interface CreateContactResponse {
  contact: Contact;
  message: string;
}

// PUT /api/contacts/:id
export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: Contact['status'];
  channel?: Contact['channel'];
  tags?: string[];
  notes?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  customFields?: Record<string, any>;
}

export interface UpdateContactResponse {
  contact: Contact;
  message: string;
}

// DELETE /api/contacts/:id
export interface DeleteContactResponse {
  message: string;
}

// GET /api/contacts/tags
export type ContactTagsResponse = string[];

// GET /api/contacts/export
export interface ExportContactsRequest {
  format?: 'csv' | 'xlsx';
  filters?: ContactsListRequest;
}

// POST /api/contacts/import
export interface ImportContactsRequest {
  file: File;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

export interface ImportContactsResponse {
  imported: number;
  updated: number;
  errors: number;
  duplicates: number;
  message: string;
  errorDetails?: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

// GET /api/contacts/stats
export interface ContactStatsResponse {
  total: number;
  byStatus: Record<Contact['status'], number>;
  byChannel: Record<Contact['channel'], number>;
  byOwner: Record<string, number>;
  recentActivity: {
    newContacts: number;
    conversions: number;
    lastWeek: number;
  };
}

/**
 * Error response type
 */
export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  details?: any;
}
