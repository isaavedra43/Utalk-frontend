// Servicio para manejo de contactos del CRM
import { apiClient } from '@/services/apiClient'
import { Contact } from '../mockContacts'

export interface ContactFilters {
  search?: string
  status?: string[]
  channel?: string[]
  owner?: string[]
  tags?: string[]
  dateRange?: {
    from: string
    to: string
  }
}

export interface ContactResponse {
  success: boolean
  data: Contact[]
  total: number
  page: number
  limit: number
}

export interface ContactCreateRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  position: string
  status: Contact['status']
  channel: Contact['channel']
  owner: string
  tags: string[]
  notes?: string
  value?: number
  probability?: number
}

export interface ContactUpdateRequest extends Partial<ContactCreateRequest> {
  id: string
}

class ContactService {
  private baseUrl = '/contacts'

  // Obtener todos los contactos con filtros
  async getContacts(filters?: ContactFilters, page = 1, limit = 20): Promise<ContactResponse> {
    try {
      const params = new URLSearchParams()

      if (filters?.search) {params.append('search', filters.search)}
      if (filters?.status) {params.append('status', filters.status.join(','))}
      if (filters?.channel) {params.append('channel', filters.channel.join(','))}
      if (filters?.owner) {params.append('owner', filters.owner.join(','))}
      if (filters?.tags) {params.append('tags', filters.tags.join(','))}
      if (filters?.dateRange) {
        params.append('from', filters.dateRange.from)
        params.append('to', filters.dateRange.to)
      }

      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw new Error('Failed to fetch contacts')
    }
  }

  // Obtener un contacto por ID
  async getContact(id: string): Promise<Contact> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching contact:', error)
      throw new Error('Failed to fetch contact')
    }
  }

  // Crear nuevo contacto
  async createContact(contact: ContactCreateRequest): Promise<Contact> {
    try {
      const response = await apiClient.post(this.baseUrl, contact)
      return response.data
    } catch (error) {
      console.error('Error creating contact:', error)
      throw new Error('Failed to create contact')
    }
  }

  // Actualizar contacto
  async updateContact(contact: ContactUpdateRequest): Promise<Contact> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${contact.id}`, contact)
      return response.data
    } catch (error) {
      console.error('Error updating contact:', error)
      throw new Error('Failed to update contact')
    }
  }

  // Eliminar contacto
  async deleteContact(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw new Error('Failed to delete contact')
    }
  }

  // Obtener estadísticas del CRM
  async getCRMStats(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching CRM stats:', error)
      throw new Error('Failed to fetch CRM stats')
    }
  }

  // Exportar contactos a CSV
  async exportContacts(filters?: ContactFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams()

      if (filters?.search) {params.append('search', filters.search)}
      if (filters?.status) {params.append('status', filters.status.join(','))}
      if (filters?.channel) {params.append('channel', filters.channel.join(','))}
      if (filters?.owner) {params.append('owner', filters.owner.join(','))}
      if (filters?.tags) {params.append('tags', filters.tags.join(','))}
      if (filters?.dateRange) {
        params.append('from', filters.dateRange.from)
        params.append('to', filters.dateRange.to)
      }

      const response = await apiClient.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting contacts:', error)
      throw new Error('Failed to export contacts')
    }
  }
}

export const contactService = new ContactService()