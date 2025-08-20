import api from './api';
import { requestCache } from '../utils/requestCache';
import { infoLog } from '../config/logger';

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
  contact: BackendContact | null;
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

// NUEVO: Estructura de contacto según el backend
export interface BackendContact {
  id: string;
  name: string;
  profileName?: string;
  phoneNumber: string;
  waId?: string;
  hasProfilePhoto?: boolean;
  avatar?: string | null;
  channel: string;
  lastSeen?: string;
}

class ClientProfileService {
  // Cache para evitar peticiones repetidas
  private profileCache = new Map<string, { data: ClientProfile; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  // NUEVO: Sistema de retry robusto
  private retryCache = new Map<string, { attempts: number; lastAttempt: number; backoff: number }>();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 segundo
  private readonly MAX_RETRY_DELAY = 10000; // 10 segundos
  
  // NUEVO: Cache de errores para evitar peticiones repetidas a endpoints que fallan
  private errorCache = new Map<string, { error: string; timestamp: number; ttl: number }>();
  private readonly ERROR_CACHE_TTL = 2 * 60 * 1000; // 2 minutos para errores

  /**
   * NUEVO: Sistema de retry con backoff exponencial
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    conversationId: string,
    operationName: string
  ): Promise<T> {
    const retryKey = `${operationName}-${conversationId}`;
    const retryInfo = this.retryCache.get(retryKey) || { attempts: 0, lastAttempt: 0, backoff: this.BASE_RETRY_DELAY };
    
    // Verificar si podemos reintentar
    const now = Date.now();
    const timeSinceLastAttempt = now - retryInfo.lastAttempt;
    
    if (retryInfo.attempts >= this.MAX_RETRY_ATTEMPTS) {
      infoLog(`🔄 [RETRY] Máximo de intentos alcanzado para ${operationName}: ${conversationId}`);
      throw new Error(`Máximo de intentos alcanzado para ${operationName}`);
    }
    
    if (timeSinceLastAttempt < retryInfo.backoff) {
      infoLog(`🔄 [RETRY] Esperando backoff para ${operationName}: ${conversationId} (${retryInfo.backoff - timeSinceLastAttempt}ms restantes)`);
      await new Promise(resolve => setTimeout(resolve, retryInfo.backoff - timeSinceLastAttempt));
    }
    
    try {
      infoLog(`🔄 [RETRY] Intento ${retryInfo.attempts + 1} para ${operationName}: ${conversationId}`);
      const result = await operation();
      
      // Éxito - limpiar cache de retry
      this.retryCache.delete(retryKey);
      infoLog(`✅ [RETRY] Éxito en intento ${retryInfo.attempts + 1} para ${operationName}: ${conversationId}`);
      
      return result;
    } catch (error) {
      // Actualizar información de retry
      retryInfo.attempts++;
      retryInfo.lastAttempt = now;
      retryInfo.backoff = Math.min(retryInfo.backoff * 2, this.MAX_RETRY_DELAY);
      
      this.retryCache.set(retryKey, retryInfo);
      
      infoLog(`❌ [RETRY] Error en intento ${retryInfo.attempts} para ${operationName}: ${conversationId} - ${error instanceof Error ? error.message : String(error)} (próximo retry en ${retryInfo.backoff}ms)`);
      
      throw error;
    }
  }

  /**
   * NUEVO: Verificar si un error está en cache para evitar peticiones repetidas
   */
  private isErrorCached(conversationId: string, errorType: string): boolean {
    const errorKey = `${errorType}-${conversationId}`;
    const cachedError = this.errorCache.get(errorKey);
    
    if (cachedError && Date.now() - cachedError.timestamp < cachedError.ttl) {
      infoLog(`🚫 [ERROR_CACHE] Error ${errorType} en cache para: ${conversationId}`);
      return true;
    }
    
    return false;
  }

  /**
   * NUEVO: Cachear error para evitar peticiones repetidas
   */
  private cacheError(conversationId: string, errorType: string, error: string, ttl?: number): void {
    const errorKey = `${errorType}-${conversationId}`;
    this.errorCache.set(errorKey, {
      error,
      timestamp: Date.now(),
      ttl: ttl || this.ERROR_CACHE_TTL
    });
    
    infoLog(`💾 [ERROR_CACHE] Error ${errorType} cacheado para: ${conversationId}`);
  }

  /**
   * NUEVO: Limpiar cache de errores expirados
   */
  private cleanupErrorCache(): void {
    const now = Date.now();
    for (const [key, errorInfo] of this.errorCache.entries()) {
      if (now - errorInfo.timestamp > errorInfo.ttl) {
        this.errorCache.delete(key);
      }
    }
  }

  /**
   * Obtiene el perfil completo del cliente basado en la conversación
   */
  async getCompleteClientProfile(conversationId: string): Promise<ClientProfile | null> {
    const cacheKey = `client-profile-${conversationId}`;
    
    // REDUCIDO: Solo loggear en desarrollo y cuando hay errores
    if (import.meta.env.DEV) {
      infoLog(`🔍 [DEBUG] Iniciando getCompleteClientProfile: ${conversationId}`);
    }
    
    // NUEVO: Limpiar cache de errores expirados
    this.cleanupErrorCache();
    
    // Verificar si hay una petición en curso
    if (requestCache.isRequestInProgress(cacheKey)) {
      if (import.meta.env.DEV) {
        infoLog('🔄 Petición en curso, esperando...');
      }
      return null;
    }
    
    // Verificar cache primero
    const cached = this.profileCache.get(conversationId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      if (import.meta.env.DEV) {
        infoLog('✅ Usando perfil del cliente desde cache');
      }
      return cached.data;
    }
    
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] Cache miss, haciendo petición a API...');
    }
    
    try {
      // NUEVO: Usar sistema de retry con backoff exponencial
      const clientProfile = await this.retryWithBackoff(
        async () => {
          // 1. Obtener información de la conversación (incluye datos básicos del cliente)
          if (import.meta.env.DEV) {
            infoLog(`📡 [DEBUG] Haciendo petición a: /api/conversations/${conversationId}`);
          }
          
          const conversationResponse = await api.get(`/api/conversations/${conversationId}`);
          
          if (import.meta.env.DEV) {
            infoLog(`📡 [DEBUG] Respuesta recibida: status=${conversationResponse.status}, success=${conversationResponse.data.success}, hasData=${!!conversationResponse.data.data}`);
          }
          
          if (!conversationResponse.data.success) {
            infoLog('❌ [DEBUG] API devolvió success: false');
            throw new Error(`API devolvió success: false - ${JSON.stringify(conversationResponse.data)}`);
          }
          
          const conversationData: ConversationData = conversationResponse.data.data;
          
          if (!conversationData) {
            infoLog('❌ [DEBUG] No hay datos en la respuesta');
            throw new Error('No se pudo obtener la información de la conversación - datos vacíos');
          }
          
          if (import.meta.env.DEV) {
            infoLog('✅ [DEBUG] Datos de conversación obtenidos:', {
              contactName: conversationData.contact?.name,
              customerPhone: conversationData.customerPhone,
              channel: conversationData.contact?.channel,
              status: conversationData.status,
              unreadCount: conversationData.unreadCount,
              lastMessageAt: conversationData.lastMessageAt,
              createdAt: conversationData.createdAt,
              priority: conversationData.priority,
              assignedTo: conversationData.assignedTo,
              tags: conversationData.tags
            });
          }
          
          // CORREGIDO: Validación mejorada usando la estructura correcta del backend
          // Verificar si realmente no hay datos de contacto (no solo si contact es null)
          const hasContactData = conversationData.contact && (
            conversationData.contact.name || 
            conversationData.contact.profileName || 
            conversationData.contact.phoneNumber || 
            conversationData.contact.id ||
            conversationData.contact.waId
          );
          
          if (!hasContactData) {
            if (import.meta.env.DEV) {
              infoLog('⚠️ [DEBUG] Backend devolvió conversación sin datos de contacto');
            }
            // No crear estructura por defecto, manejar en el frontend
            conversationData.contact = null;
          }
          
          if (!conversationData.customerPhone) {
            if (import.meta.env.DEV) {
              infoLog('⚠️ [DEBUG] Backend devolvió conversación sin teléfono del cliente');
            }
            // Intentar extraer del conversationId
            const phoneMatch = conversationId.match(/\+(\d+)/);
            conversationData.customerPhone = phoneMatch ? `+${phoneMatch[1]}` : '+5214775211021';
          }
          
          // 2. Obtener información detallada del contacto (DESHABILITADO TEMPORALMENTE)
          const contactDetails: ContactData | null = null;
          
          // Endpoint de búsqueda de contactos
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
              infoLog('Búsqueda por teléfono falló, intentando por ID del contacto...');
              
              // Estrategia 2: Intentar obtener por ID del contacto
              try {
                if (conversationData.contact.id) {
                  const contactByIdResponse = await api.get(`/api/contacts/${conversationData.contact.id}`);
                  
                  if (contactByIdResponse.data.success && contactByIdResponse.data.data) {
                    contactDetails = contactByIdResponse.data.data;
                  }
                }
              } catch (idError) {
                infoLog('No se pudo obtener información adicional del contacto por ID:', idError);
              }
            }
          }
          */
          
          // 3. Formatear la información del cliente según la estructura del backend
          if (import.meta.env.DEV) {
            infoLog('🔧 [DEBUG] Formateando perfil del cliente...');
          }
          
          const clientProfile: ClientProfile = {
            // Información básica del cliente - CORREGIDO: Usar profileName como prioridad
            name: conversationData.contact?.profileName || conversationData.contact?.name || 'Cliente sin nombre',
            phone: conversationData.customerPhone,
            status: "Activo",
            channel: conversationData.contact?.channel || 'whatsapp',
            
            // Información de contacto - CORREGIDO: Validaciones de fecha
            lastContact: this.formatTimeAgo(conversationData.lastMessageAt),
            clientSince: this.formatClientSince(conversationData.createdAt),
            whatsappId: conversationData.customerPhone.replace('+', ''),
            
            // Etiquetas de la conversación
            tags: conversationData.tags || [],
            
            // Información de conversación
            conversation: {
              status: conversationData.status,
              priority: conversationData.priority || 'normal',
              unreadMessages: conversationData.unreadCount || 0,
              assignedTo: conversationData.assignedTo?.name || "Sin asignar"
            },
            
            // Información adicional del contacto (si existe, sino usar datos de la conversación)
            contactDetails: contactDetails || {
              id: conversationData.contact?.id || conversationData.customerPhone,
              isActive: true,
              totalMessages: conversationData.unreadCount || 0,
              createdAt: conversationData.createdAt,
              updatedAt: conversationData.lastMessageAt
            }
          };
          
          if (import.meta.env.DEV) {
            infoLog('✅ [DEBUG] Perfil formateado exitosamente:', {
              name: clientProfile.name,
              phone: clientProfile.phone,
              channel: clientProfile.channel,
              status: clientProfile.conversation.status
            });
          }
          
          return clientProfile;
        },
        conversationId,
        'getCompleteClientProfile'
      );
      
      // Guardar en cache
      this.profileCache.set(conversationId, {
        data: clientProfile,
        timestamp: Date.now()
      });
      
      if (import.meta.env.DEV) {
        infoLog('💾 [DEBUG] Perfil guardado en cache');
      }
      
      return clientProfile;
      
    } catch (error) {
      infoLog('❌ [DEBUG] Error detallado en getCompleteClientProfile:', {
        conversationId,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorObject: error
      });
      
      // NUEVO: Manejo mejorado de errores con cache de errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            statusText?: string;
            data?: { message?: string } 
          };
          config?: { url?: string }
        };
        
        infoLog('📡 [DEBUG] Error de Axios detectado:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          url: axiosError.config?.url
        });
        
        // NUEVO: Cachear errores específicos para evitar peticiones repetidas
        if (axiosError.response?.status === 404) {
          this.cacheError(conversationId, '404', 'Conversación no encontrada', 5 * 60 * 1000); // 5 minutos
          infoLog('📝 Conversación no encontrada, usando datos mock para desarrollo');
          const mockProfile = this.getMockClientProfile(conversationId);
          this.profileCache.set(conversationId, {
            data: mockProfile,
            timestamp: Date.now()
          });
          return mockProfile;
        }
        
        if (axiosError.response?.status === 429) {
          this.cacheError(conversationId, '429', 'Rate limit exceeded', 30 * 1000); // 30 segundos
          infoLog('🚫 Rate limit excedido, usando datos mock');
          const mockProfile = this.getMockClientProfile(conversationId);
          this.profileCache.set(conversationId, {
            data: mockProfile,
            timestamp: Date.now()
          });
          return mockProfile;
        }
        
        if (axiosError.response?.status === 500) {
          this.cacheError(conversationId, '500', 'Server error', 2 * 60 * 1000); // 2 minutos
          infoLog('🔧 Error del servidor, usando datos mock');
          const mockProfile = this.getMockClientProfile(conversationId);
          this.profileCache.set(conversationId, {
            data: mockProfile,
            timestamp: Date.now()
          });
          return mockProfile;
        }
        
        // NUEVO: Cachear otros errores HTTP
        const errorType = `http-${axiosError.response?.status || 'unknown'}`;
        this.cacheError(conversationId, errorType, `HTTP ${axiosError.response?.status}`, 60 * 1000); // 1 minuto
        
        // Solo loggear errores críticos que no sean 500 (que sabemos que fallan)
        if (axiosError.response?.status !== 500) {
          infoLog('❌ Error obteniendo perfil completo del cliente:', {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
            url: axiosError.config?.url
          });
        }
      } else {
        // NUEVO: Cachear errores no-HTTP
        const errorMessage = String(error);
        if (!errorMessage.includes('Rate limit') && !errorMessage.includes('rate limit')) {
          this.cacheError(conversationId, 'network', errorMessage, 30 * 1000); // 30 segundos
          infoLog('❌ Error obteniendo perfil completo del cliente:', {
            errorType: typeof error,
            errorMessage: errorMessage,
            errorObject: error
          });
        }
      }
      
      // NUEVO: Verificar si el error está en cache para evitar peticiones repetidas
      const errorTypes = ['404', '429', '500', 'network'];
      for (const errorType of errorTypes) {
        if (this.isErrorCached(conversationId, errorType)) {
          infoLog(`🔄 [ERROR_CACHE] Usando fallback por error cacheado: ${errorType}`);
          const mockProfile = this.getMockClientProfile(conversationId);
          this.profileCache.set(conversationId, {
            data: mockProfile,
            timestamp: Date.now()
          });
          return mockProfile;
        }
      }
      
      // En caso de error, devolver perfil mock para evitar errores en la UI
      infoLog('🔄 [DEBUG] Usando perfil mock como fallback');
      const mockProfile = this.getMockClientProfile(conversationId);
      this.profileCache.set(conversationId, {
        data: mockProfile,
        timestamp: Date.now()
      });
      return mockProfile;
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
      infoLog('Error obteniendo información de conversación:', error);
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
      infoLog('Error obteniendo contacto por ID:', error);
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
      infoLog('Error obteniendo lista de contactos:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de contactos
   */
  async getContactStats(period: string = '30d'): Promise<{
    totalContacts: number;
    activeContacts: number;
    newContacts: number;
    period: string;
  } | null> {
    try {
      const response = await api.get(`/api/contacts/stats?period=${period}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      infoLog('Error obteniendo estadísticas de contactos:', error);
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
      infoLog('Error buscando contacto:', error);
      return null;
    }
  }

  /**
   * Limpia el cache de perfiles
   */
  clearCache(): void {
    this.profileCache.clear();
    infoLog('Cache de perfiles de cliente limpiado');
  }

  /**
   * NUEVO: Limpia todos los caches (perfiles, errores, retry)
   */
  clearAllCaches(): void {
    this.profileCache.clear();
    this.errorCache.clear();
    this.retryCache.clear();
    infoLog('🧹 [CACHE] Todos los caches limpiados');
  }

  /**
   * NUEVO: Obtiene estadísticas completas de todos los caches
   */
  getCacheStats(): { 
    profiles: { size: number; entries: string[] };
    errors: { size: number; entries: string[] };
    retry: { size: number; entries: string[] };
  } {
    return {
      profiles: {
        size: this.profileCache.size,
        entries: Array.from(this.profileCache.keys())
      },
      errors: {
        size: this.errorCache.size,
        entries: Array.from(this.errorCache.keys())
      },
      retry: {
        size: this.retryCache.size,
        entries: Array.from(this.retryCache.keys())
      }
    };
  }

  /**
   * NUEVO: Limpia caches expirados automáticamente
   */
  cleanupExpiredCaches(): void {
    const now = Date.now();
    
    // Limpiar perfiles expirados
    for (const [key, profile] of this.profileCache.entries()) {
      if (now - profile.timestamp > this.CACHE_DURATION) {
        this.profileCache.delete(key);
      }
    }
    
    // Limpiar errores expirados
    this.cleanupErrorCache();
    
    // Limpiar retry expirados (más de 1 hora)
    for (const [key, retryInfo] of this.retryCache.entries()) {
      if (now - retryInfo.lastAttempt > 60 * 60 * 1000) { // 1 hora
        this.retryCache.delete(key);
      }
    }
    
    infoLog('🧹 [CACHE] Caches expirados limpiados automáticamente');
  }

  /**
   * Obtiene un perfil mock para desarrollo cuando la API falla
   */
  private getMockClientProfile(conversationId: string): ClientProfile {
    // Extraer información del conversationId si es posible
    const phoneMatch = conversationId.match(/\+(\d+)/);
    const phone = phoneMatch ? `+${phoneMatch[1]}` : '+5214775211021';
    
    // Generar nombre basado en el teléfono para que sea más realista
    const phoneNumber = phone.replace('+', '');
    const mockNames = [
      'María González',
      'Carlos Rodríguez',
      'Ana Martínez',
      'Luis Pérez',
      'Sofia García',
      'Diego López',
      'Valentina Torres',
      'Miguel Silva'
    ];
    const nameIndex = parseInt(phoneNumber.slice(-2)) % mockNames.length;
    const mockName = mockNames[nameIndex];
    
    return {
      name: mockName,
      phone: phone,
      status: 'Activo',
      channel: 'whatsapp',
      lastContact: 'hace 5 minutos',
      clientSince: '2024',
      whatsappId: phone.replace('+', ''),
      tags: ['Cliente', 'WhatsApp', 'Activo'],
      conversation: {
        status: 'open',
        priority: 'normal',
        unreadMessages: 2,
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
    try {
      const date = new Date(dateString);
      
      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return 'No disponible';
      }
      
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
    } catch {
      return 'No disponible';
    }
  }

  /**
   * Formatea el año del cliente desde la fecha de creación
   */
  private formatClientSince(createdAt: string): string {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return 'Desconocido';
    }
    return date.getFullYear().toString();
  }
}

// Instancia global del servicio
export const clientProfileService = new ClientProfileService();

// NUEVO: Cleanup automático cada 5 minutos para evitar acumulación de caches
setInterval(() => {
  clientProfileService.cleanupExpiredCaches();
}, 5 * 60 * 1000); // 5 minutos 