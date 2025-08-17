import api from './api';
import { requestCache } from '../utils/requestCache';

export interface ClientProfile {
  // Información básica
  name: string;
  phone: string;
  status: string;
  channel: string;
  
  // Información de contacto
  lastContact: string;
  clientSince: string;
  whatsappId: string;
  
  // Etiquetas
  tags: string[];
  
  // Información de conversación
  conversation: {
    status: string;
    priority: string;
    unreadMessages: number;
    assignedTo: string;
  };
  
  // Información adicional del contacto
  contactDetails?: {
    id: string;
    email?: string;
    isActive: boolean;
    totalMessages: number;
    createdAt: string;
    updatedAt: string;
    customFields?: Record<string, unknown>;
  };
}

export interface ConversationData {
  id: string;
  contact: {
    id: string;
    name: string;
    avatar?: string;
    channel: string;
  };
  status: string;
  priority: string;
  tags: string[];
  unreadCount: number;
  assignedTo?: {
    id: string;
    name: string;
  };
  lastMessageAt: string;
  createdAt: string;
  customerPhone: string;
  participants: string[];
}

export interface ContactData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  isActive: boolean;
  lastContactAt: string;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, unknown>;
}

class ClientProfileService {
  // Cache para evitar peticiones repetidas
  private profileCache = new Map<string, { data: ClientProfile; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene el perfil completo del cliente basado en la conversación
   */
  async getCompleteClientProfile(conversationId: string): Promise<ClientProfile | null> {
    const cacheKey = `client-profile-${conversationId}`;
    
    // Verificar si hay una petición en curso
    if (requestCache.isRequestInProgress(cacheKey)) {
      console.log('🔄 Petición en curso, esperando...');
      return null;
    }
    
    // Verificar cache primero
    const cached = this.profileCache.get(conversationId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('✅ Usando perfil del cliente desde cache');
      return cached.data;
    }
    
    try {
      // 1. Obtener información de la conversación (incluye datos básicos del cliente)
      const conversationResponse = await api.get(`/api/conversations/${conversationId}`);
      
      if (!conversationResponse.data.success) {
        throw new Error('Error obteniendo conversación');
      }
      
      const conversationData: ConversationData = conversationResponse.data.data;
      
      if (!conversationData) {
        throw new Error('No se pudo obtener la información de la conversación');
      }
      
      // 2. Obtener información detallada del contacto (DESHABILITADO TEMPORALMENTE)
      let contactDetails: ContactData | null = null;
      
      // TODO: Habilitar cuando el endpoint /api/contacts/search esté funcionando correctamente
      // El endpoint está devolviendo 500, causando muchos logs de error
      /*
      if (conversationData.customerPhone) {
        try {
          // Estrategia 1: Buscar por teléfono
          const contactResponse = await api.get(`/api/contacts/search?phone=${encodeURIComponent(conversationData.customerPhone)}`);
          
          if (contactResponse.data.success && contactResponse.data.data) {
            contactDetails = contactResponse.data.data;
          }
        } catch (error) {
          console.log('Búsqueda por teléfono falló, intentando por ID del contacto...');
          
          // Estrategia 2: Intentar obtener por ID del contacto
          try {
            if (conversationData.contact.id) {
              const contactByIdResponse = await api.get(`/api/contacts/${conversationData.contact.id}`);
              
              if (contactByIdResponse.data.success && contactByIdResponse.data.data) {
                contactDetails = contactByIdResponse.data.data;
              }
            }
          } catch (idError) {
            console.log('No se pudo obtener información adicional del contacto por ID:', idError);
          }
        }
      }
      */
      
      // 3. Formatear la información del cliente según la estructura del backend
      const clientProfile: ClientProfile = {
        // Información básica del cliente
        name: conversationData.contact.name || 'Cliente sin nombre',
        phone: conversationData.customerPhone,
        status: "Activo",
        channel: conversationData.contact.channel,
        
        // Información de contacto
        lastContact: this.formatTimeAgo(conversationData.lastMessageAt),
        clientSince: new Date(conversationData.createdAt).getFullYear().toString(),
        whatsappId: conversationData.customerPhone.replace('+', ''),
        
        // Etiquetas de la conversación
        tags: conversationData.tags || [],
        
        // Información de conversación
        conversation: {
          status: conversationData.status,
          priority: conversationData.priority,
          unreadMessages: conversationData.unreadCount,
          assignedTo: conversationData.assignedTo?.name || "Sin asignar"
        },
        
        // Información adicional del contacto (si existe, sino usar datos de la conversación)
        contactDetails: contactDetails || {
          id: conversationData.contact.id,
          isActive: true,
          totalMessages: conversationData.unreadCount || 0,
          createdAt: conversationData.createdAt,
          updatedAt: conversationData.lastMessageAt
        }
      };
      
      // Guardar en cache
      this.profileCache.set(conversationId, {
        data: clientProfile,
        timestamp: Date.now()
      });
      
      return clientProfile;
      
    } catch (error) {
      // Solo loggear errores críticos, no todos los errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          console.log('Conversación no encontrada, usando datos mock para desarrollo');
          const mockProfile = this.getMockClientProfile(conversationId);
          this.profileCache.set(conversationId, {
            data: mockProfile,
            timestamp: Date.now()
          });
          return mockProfile;
        }
        // Solo loggear errores que no sean 500 (que sabemos que fallan)
        if (axiosError.response?.status !== 500) {
          console.error('Error obteniendo perfil completo del cliente:', error);
        }
      } else {
        // Solo loggear errores no relacionados con rate limit
        if (!String(error).includes('Rate limit')) {
          console.error('Error obteniendo perfil completo del cliente:', error);
        }
      }
      
      return null;
    }
  }

  /**
   * Obtiene información básica de la conversación
   */
  async getConversationInfo(conversationId: string): Promise<ConversationData | null> {
    try {
      const response = await api.get(`/api/conversations/${conversationId}`);
      
      if (!response.data.success) {
        throw new Error('Error obteniendo conversación');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo información de conversación:', error);
      return null;
    }
  }

  /**
   * Obtiene un contacto específico por ID
   */
  async getContactById(contactId: string): Promise<ContactData | null> {
    try {
      const response = await api.get(`/api/contacts/${contactId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo contacto por ID:', error);
      return null;
    }
  }

  /**
   * Lista todos los contactos con filtros
   */
  async getContactsList(filters: {
    page?: number;
    limit?: number;
    tags?: string;
    search?: string;
  } = {}): Promise<{
    contacts: ContactData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    total: number;
  } | null> {
    try {
      const queryParams = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 20).toString(),
        tags: filters.tags || '',
        q: filters.search || ''
      });

      const response = await api.get(`/api/contacts?${queryParams}`);
      
      if (response.data.success) {
        return {
          contacts: response.data.data.contacts,
          pagination: response.data.data.pagination,
          total: response.data.data.total
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo lista de contactos:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de contactos
   */
  async getContactStats(period: string = '30d'): Promise<any> {
    try {
      const response = await api.get(`/api/contacts/stats?period=${period}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo estadísticas de contactos:', error);
      return null;
    }
  }

  /**
   * Busca un contacto por teléfono
   */
  async searchContactByPhone(phone: string): Promise<ContactData | null> {
    try {
      const response = await api.get(`/api/contacts/search?phone=${encodeURIComponent(phone)}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // Si no se encuentra el contacto, devolver null
      return null;
    } catch (error) {
      console.error('Error buscando contacto:', error);
      return null;
    }
  }

  /**
   * Limpia el cache de perfiles
   */
  clearCache(): void {
    this.profileCache.clear();
    console.log('Cache de perfiles de cliente limpiado');
  }

  /**
   * Obtiene estadísticas del cache
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.profileCache.size,
      entries: Array.from(this.profileCache.keys())
    };
  }

  /**
   * Obtiene un perfil mock para desarrollo cuando la API falla
   */
  private getMockClientProfile(conversationId: string): ClientProfile {
    // Extraer información del conversationId si es posible
    const phoneMatch = conversationId.match(/\+(\d+)/);
    const phone = phoneMatch ? `+${phoneMatch[1]}` : '+5214775211021';
    
    return {
      name: 'Cliente Demo',
      phone: phone,
      status: 'Activo',
      channel: 'whatsapp',
      lastContact: 'hace 5 minutos',
      clientSince: '2024',
      whatsappId: phone.replace('+', ''),
      tags: ['Demo', 'Cliente'],
      conversation: {
        status: 'active',
        priority: 'normal',
        unreadMessages: 0,
        assignedTo: 'admin@company.com'
      },
      contactDetails: {
        id: conversationId,
        isActive: true,
        totalMessages: 15,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-08-16T20:00:00Z'
      }
    };
  }

  /**
   * Formatea el tiempo transcurrido
   */
  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'hace un momento';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}

export const clientProfileService = new ClientProfileService(); 