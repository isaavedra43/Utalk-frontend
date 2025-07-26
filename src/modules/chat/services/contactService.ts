// Servicio para contactos - Conecta con API real de UTalk Backend  
// Abstrae las llamadas a /api/contacts del backend
import { apiClient } from '@/services/apiClient'
import { Contact } from '../types'

export interface ContactsResponse {
  success: boolean
  contacts: Contact[]
  total: number
  page: number
  limit: number
}

export interface SingleContactResponse {
  success: boolean
  contact: Contact
}

export interface CreateContactData {
  name: string
  phone: string
  email?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface UpdateContactData {
  name?: string
  phone?: string
  email?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface ContactFilters {
  search?: string
  tags?: string[]
  isActive?: boolean
  page?: number
  limit?: number
}

class ContactService {
  private baseUrl = '/contacts'

  // Obtener lista de contactos con filtros
  async getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await apiClient.get(url)
    
    return {
      success: response.success || true,
      contacts: this.mapBackendContacts(response.data || response.contacts || []),
      total: response.total || response.data?.length || 0,
      page: response.page || 1,
      limit: response.limit || 50
    }
  }

  // Obtener contacto específico
  async getContact(contactId: string): Promise<SingleContactResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${contactId}`)
    
    return {
      success: response.success || true,
      contact: this.mapBackendContact(response.data || response.contact)
    }
  }

  // Crear nuevo contacto
  async createContact(data: CreateContactData): Promise<SingleContactResponse> {
    const response = await apiClient.post(this.baseUrl, data)
    
    return {
      success: response.success || true,
      contact: this.mapBackendContact(response.data || response.contact)
    }
  }

  // Actualizar contacto
  async updateContact(contactId: string, data: UpdateContactData): Promise<SingleContactResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${contactId}`, data)
    
    return {
      success: response.success || true,
      contact: this.mapBackendContact(response.data || response.contact)
    }
  }

  // Eliminar contacto
  async deleteContact(contactId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${contactId}`)
  }

  // Buscar contactos
  async searchContacts(query: string): Promise<ContactsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`)
    
    return {
      success: response.success || true,
      contacts: this.mapBackendContacts(response.data || response.contacts || []),
      total: response.total || response.data?.length || 0,
      page: 1,
      limit: 50
    }
  }

  // Obtener todas las etiquetas disponibles
  async getTags(): Promise<string[]> {
    const response = await apiClient.get(`${this.baseUrl}/tags`)
    return response.data?.tags || response.tags || []
  }

  // Exportar contactos
  async exportContacts(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export?format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Importar contactos desde CSV
  async importContacts(file: File): Promise<{ success: boolean, imported: number, errors: any[] }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data || response
  }

  // Mapear contacto del backend a nuestro tipo Contact
  private mapBackendContact(backendContact: any): Contact {
    // ✅ MAPEAR A ESTRUCTURA CANÓNICA COMPLETA
    return {
      id: backendContact.id,
      name: backendContact.name,
      phone: backendContact.phone,
      email: backendContact.email,
      avatar: backendContact.avatar,
      company: backendContact.company,
      // source: backendContact.source || 'manual', // ✅ Eliminado - no existe en CanonicalContact
      isOnline: backendContact.isOnline || false,
      lastSeen: backendContact.lastSeen ? new Date(backendContact.lastSeen) : undefined,
      createdAt: backendContact.createdAt ? new Date(backendContact.createdAt) : new Date(),
      updatedAt: backendContact.updatedAt ? new Date(backendContact.updatedAt) : new Date(),
      customFields: backendContact.customFields || {},
      tags: backendContact.tags || [],
      isBlocked: backendContact.isBlocked || false,
      preferences: {
        language: backendContact.preferences?.language || 'es',
        timezone: backendContact.preferences?.timezone || 'America/Mexico_City',
        notifications: backendContact.preferences?.notifications ?? true
      }
    }
  }

  private mapBackendContacts(backendContacts: any[]): Contact[] {
    return backendContacts.map(contact => this.mapBackendContact(contact))
  }

  // Método de validación de teléfono (reservado para uso futuro)
  // private validatePhone(phone: string): boolean {
  //   const phoneRegex = /^\+[1-9]\d{1,14}$/
  //   return phoneRegex.test(phone)
  // }

  // Método de validación de email (reservado para uso futuro)  
  // private validateEmail(email: string): boolean {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //   return emailRegex.test(email)
  // }
}

export const contactService = new ContactService()
export default contactService 