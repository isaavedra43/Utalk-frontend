// Servicio para gestión de contactos
// Abstrae las llamadas a la API REST para operaciones CRUD de contactos
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import { Contact, PaginatedResponse } from '@/types'
import { ContactData } from '@/lib/validations'

// ✅ CONTEXTO PARA LOGGING
const contactServiceContext = getComponentContext('contactService')

export interface ContactFilters {
  search?: string
  status?: string
  assignedTo?: string
  company?: string
  page?: number
  pageSize?: number
}

class ContactService {
  private baseUrl = '/contacts'

  // Obtener lista de contactos con filtros
  async getContacts(filters: ContactFilters = {}): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return apiClient.get(`${this.baseUrl}?${params.toString()}`)
  }

  // Obtener contacto por ID
  async getContact(id: string): Promise<Contact> {
    return apiClient.get(`${this.baseUrl}/${id}`)
  }

  // Crear nuevo contacto
  async createContact(data: ContactData): Promise<Contact> {
    return apiClient.post(this.baseUrl, data)
  }

  // Actualizar contacto existente
  async updateContact(id: string, data: Partial<ContactData>): Promise<Contact> {
    return apiClient.patch(`${this.baseUrl}/${id}`, data)
  }

  // Eliminar contacto
  async deleteContact(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // Importar contactos desde archivo
  async importContacts(file: File): Promise<{ imported: number; errors: string[] }> {
    return apiClient.upload(`${this.baseUrl}/import`, file)
  }

  // Exportar contactos
  async exportContacts(filters: ContactFilters = {}): Promise<Blob> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    // TODO: Implementar descarga de archivo
    // return apiClient.get(`${this.baseUrl}/export?${params.toString()}`, {
    //   responseType: 'blob'
    // })
    throw new Error('Exportación pendiente de implementación')
  }

  // Obtener estadísticas de contactos
  async getContactStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    recentlyAdded: number
  }> {
    return apiClient.get(`${this.baseUrl}/stats`)
  }

  // Asignar contacto a usuario
  async assignContact(contactId: string, userEmail: string): Promise<Contact> {
    return apiClient.patch(`${this.baseUrl}/${contactId}/assign`, { userEmail })
  }

  // Añadir etiquetas a contacto
  async addTags(contactId: string, tags: string[]): Promise<Contact> {
    return apiClient.post(`${this.baseUrl}/${contactId}/tags`, { tags })
  }

  // Remover etiquetas de contacto
  async removeTags(contactId: string, tags: string[]): Promise<Contact> {
    return apiClient.delete(`${this.baseUrl}/${contactId}/tags`, { data: { tags } })
  }
}

// Instancia singleton del servicio
export const contactService = new ContactService()
export default contactService 