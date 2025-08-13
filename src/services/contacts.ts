import api from './api';
import type { Contact } from '../types';

// Configuración de la API
const CONTACTS_API = '/api/contacts';

export const contactsService = {
  // Listar contactos
  async getContacts(params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  } = {}): Promise<{ contacts: Contact[]; total: number; page: number; limit: number; hasMore: boolean }> {
    const queryParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '20',
      q: params.search || '',
      tags: params.tags || ''
    });

    const response = await api.get(`${CONTACTS_API}?${queryParams}`);
    return response.data;
  },

  // Obtener contacto específico
  async getContact(contactId: string): Promise<Contact> {
    const response = await api.get(`${CONTACTS_API}/${contactId}`);
    return response.data;
  },

  // Crear contacto
  async createContact(contactData: {
    phone: string;
    name: string;
    email?: string;
    company?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Contact> {
    const response = await api.post(CONTACTS_API, contactData);
    return response.data;
  },

  // Actualizar contacto
  async updateContact(contactId: string, updateData: {
    name?: string;
    email?: string;
    company?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Contact> {
    const response = await api.put(`${CONTACTS_API}/${contactId}`, updateData);
    return response.data;
  },

  // Eliminar contacto
  async deleteContact(contactId: string): Promise<void> {
    await api.delete(`${CONTACTS_API}/${contactId}`);
  },

  // Importar contactos
  async importContacts(contactsData: {
    contacts: Array<{
      phone: string;
      name: string;
      email?: string;
      company?: string;
    }>;
    tags?: string[];
    updateExisting?: boolean;
  }): Promise<{ imported: number; updated: number; errors: number }> {
    const response = await api.post(`${CONTACTS_API}/import`, contactsData);
    return response.data;
  },

  // Agregar tags a contacto
  async addContactTags(contactId: string, tags: string[]): Promise<Contact> {
    const response = await api.post(`${CONTACTS_API}/${contactId}/tags`, { tags });
    return response.data;
  },

  // Remover tags de contacto
  async removeContactTags(contactId: string, tags: string[]): Promise<Contact> {
    const response = await api.delete(`${CONTACTS_API}/${contactId}/tags`, { data: { tags } });
    return response.data;
  },

  // Obtener todos los tags
  async getContactTags(): Promise<string[]> {
    const response = await api.get(`${CONTACTS_API}/tags`);
    return response.data;
  },

  // Buscar contacto por teléfono
  async searchContactByPhone(phone: string): Promise<Contact | null> {
    const response = await api.get(`${CONTACTS_API}/search?q=${phone}`);
    return response.data;
  },

  // Obtener estadísticas de contactos
  async getContactStats(params: {
    period?: string;
    userId?: string;
  } = {}): Promise<{
    total: number;
    active: number;
    inactive: number;
    newThisPeriod: number;
    growthRate: number;
  }> {
    const queryParams = new URLSearchParams({
      period: params.period || '30d',
      userId: params.userId || ''
    });

    const response = await api.get(`${CONTACTS_API}/stats?${queryParams}`);
    return response.data;
  }
};

// Datos mock basados en Firebase para desarrollo
export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'María González',
    phone: '+34612345678',
    email: 'maria.gonzalez@email.com',
    company: 'Empresa ABC',
    avatar: 'MG',
    tags: ['VIP', 'Premium'],
    status: 'active',
    lastContact: new Date('2024-01-15'),
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-15'),
    metadata: {
      location: 'Madrid, España',
      language: 'es',
      source: 'whatsapp'
    }
  },
  {
    id: 'contact-2',
    name: 'Carlos Ruiz',
    phone: '+34623456789',
    email: 'carlos.ruiz@email.com',
    company: 'Empresa XYZ',
    avatar: 'CR',
    tags: ['New Customer'],
    status: 'active',
    lastContact: new Date('2024-01-14'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    metadata: {
      location: 'Barcelona, España',
      language: 'es',
      source: 'website'
    }
  },
  {
    id: 'contact-3',
    name: 'David López',
    phone: '+34634567890',
    email: 'david.lopez@email.com',
    company: 'Tech Solutions',
    avatar: 'DL',
    tags: ['Technical Support'],
    status: 'active',
    lastContact: new Date('2024-01-13'),
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-13'),
    metadata: {
      location: 'Valencia, España',
      language: 'es',
      source: 'phone'
    }
  }
]; 