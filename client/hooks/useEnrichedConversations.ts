import { useMemo } from 'react';
import { useConversations } from './useMessages';
import { useContacts } from './useContacts';
import { logger } from '@/lib/utils';
import type { Conversation, Contact } from '@/types/api';

/**
 * Conversación enriquecida con información de contacto
 */
export interface EnrichedConversation extends Conversation {
  // Información del contacto relacionado
  contactInfo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    status: Contact['status'];
  };
  
  // Nombre para mostrar (nombre del contacto o número)
  displayName: string;
  
  // Indica si se encontró el contacto
  hasContactInfo: boolean;
}

/**
 * Hook que enriquece conversaciones con información de contactos
 * 
 * Este hook:
 * 1. Obtiene todas las conversaciones
 * 2. Obtiene todos los contactos  
 * 3. Relaciona conversaciones con contactos por número de teléfono
 * 4. Proporciona nombres en lugar de números para la UI
 */
export function useEnrichedConversations(params?: {
  search?: string;
  status?: string;
}) {
  // Obtener conversaciones y contactos
  const {
    data: conversationsResponse,
    isLoading: isLoadingConversations,
    error: conversationsError
  } = useConversations(params);

  const {
    data: contactsResponse,
    isLoading: isLoadingContacts,
    error: contactsError
  } = useContacts({
    limit: 1000 // Obtener muchos contactos para el lookup
  });

  // Procesar y enriquecer conversaciones
  const enrichedConversations = useMemo(() => {
    const conversations = conversationsResponse?.conversations || [];
    const contacts = contactsResponse?.data || [];

    logger.api('🔗 Enriqueciendo conversaciones con contactos', {
      conversationsCount: conversations.length,
      contactsCount: contacts.length
    });

    // Crear mapa de teléfonos a contactos para búsqueda rápida
    const phoneToContactMap = new Map<string, Contact>();
    
    contacts.forEach(contact => {
      if (contact.phone) {
        // Normalizar números para mejor matching
        const normalizedPhone = normalizePhoneNumber(contact.phone);
        phoneToContactMap.set(normalizedPhone, contact);
      }
    });

    // Enriquecer cada conversación
    const enriched: EnrichedConversation[] = conversations.map(conversation => {
      const phone = conversation.customerPhone || conversation.phone;
      const normalizedPhone = phone ? normalizePhoneNumber(phone) : '';
      
      // Buscar contacto relacionado
      const relatedContact = normalizedPhone ? phoneToContactMap.get(normalizedPhone) : undefined;
      
      let displayName = phone || 'Número desconocido';
      let hasContactInfo = false;
      let contactInfo: EnrichedConversation['contactInfo'] = undefined;

      if (relatedContact) {
        hasContactInfo = true;
        displayName = relatedContact.name;
        contactInfo = {
          id: relatedContact.id,
          name: relatedContact.name,
          email: relatedContact.email,
          avatarUrl: relatedContact.avatarUrl,
          status: relatedContact.status
        };

        logger.api(`✅ Contacto encontrado para ${normalizedPhone}`, {
          conversationId: conversation.id,
          contactName: relatedContact.name,
          contactId: relatedContact.id
        });
      } else {
        logger.api(`⚠️ No se encontró contacto para ${normalizedPhone}`, {
          conversationId: conversation.id,
          originalPhone: phone
        });
      }

      return {
        ...conversation,
        contactInfo,
        displayName,
        hasContactInfo
      };
    });

    logger.api('🎯 Conversaciones enriquecidas', {
      total: enriched.length,
      withContacts: enriched.filter(c => c.hasContactInfo).length,
      withoutContacts: enriched.filter(c => !c.hasContactInfo).length
    });

    return enriched;
  }, [conversationsResponse, contactsResponse]);

  // Estados combinados
  const isLoading = isLoadingConversations || isLoadingContacts;
  const error = conversationsError || contactsError;

  // Estadísticas útiles
  const stats = useMemo(() => {
    const total = enrichedConversations.length;
    const withContacts = enrichedConversations.filter(c => c.hasContactInfo).length;
    const withoutContacts = total - withContacts;
    
    return {
      total,
      withContacts,
      withoutContacts,
      contactMatchRate: total > 0 ? Math.round((withContacts / total) * 100) : 0
    };
  }, [enrichedConversations]);

  return {
    // Datos principales
    conversations: enrichedConversations,
    
    // Estados
    isLoading,
    error,
    
    // Estadísticas
    stats,
    
    // Utilidades
    getConversationByPhone: (phone: string) => {
      const normalized = normalizePhoneNumber(phone);
      return enrichedConversations.find(c => 
        normalizePhoneNumber(c.customerPhone || c.phone || '') === normalized
      );
    },
    
    getUnmatchedConversations: () => enrichedConversations.filter(c => !c.hasContactInfo),
    
    // Para debugging
    debug: {
      rawConversations: conversationsResponse?.conversations || [],
      rawContacts: contactsResponse?.data || [],
      enrichedConversations
    }
  };
}

/**
 * Hook para obtener conversaciones sin información de contacto
 * (útil para mostrar alertas o crear contactos automáticamente)
 */
export function useUnmatchedConversations() {
  const { conversations, isLoading, getUnmatchedConversations } = useEnrichedConversations();
  
  const unmatchedConversations = useMemo(() => {
    return getUnmatchedConversations();
  }, [conversations]);

  return {
    unmatchedConversations,
    isLoading,
    count: unmatchedConversations.length,
    hasUnmatched: unmatchedConversations.length > 0
  };
}

/**
 * Hook para crear contacto desde una conversación no relacionada
 */
export function useCreateContactFromConversation() {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const { api } = require('@/lib/apiClient');
  const { toast } = require('@/hooks/use-toast');
  
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversation: EnrichedConversation) => {
      const phone = conversation.customerPhone || conversation.phone;
      if (!phone) {
        throw new Error('No se puede crear contacto sin número de teléfono');
      }

      const contactData = {
        name: phone, // Usar teléfono como nombre inicial
        phone: phone,
        email: '', // Email vacío inicialmente
        status: 'new-lead' as const,
        section: conversation.section || 'general'
      };

      logger.api('📞 Creando contacto desde conversación', {
        conversationId: conversation.id,
        phone,
        contactData
      });

      const newContact = await api.post('/contacts', contactData);
      
      return {
        contact: newContact,
        conversation
      };
    },
    onSuccess: ({ contact, conversation }) => {
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      logger.api('✅ Contacto creado exitosamente desde conversación', {
        contactId: contact.id,
        conversationId: conversation.id
      });
      
      toast({
        title: "Contacto creado",
        description: `Se creó el contacto para ${contact.phone}. Puedes editarlo para agregar más información.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Error creando contacto";
      
      logger.api('❌ Error creando contacto desde conversación', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error creando contacto",
        description: errorMessage,
      });
    },
  });
}

/**
 * Normaliza números de teléfono para comparación
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remover espacios, guiones, paréntesis, signos +
  let normalized = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Si empieza con código de país común, mantenerlo
  // México: 52, España: 34, Argentina: 54, Colombia: 57
  const commonCountryCodes = ['52', '34', '54', '57'];
  
  // Si no tiene código de país y es México (ejemplo), agregarlo
  if (normalized.length === 10 && !commonCountryCodes.some(code => normalized.startsWith(code))) {
    normalized = '52' + normalized;
  }
  
  return normalized;
}

/**
 * Hook para estadísticas de contactos vs conversaciones
 */
export function useContactConversationStats() {
  const { stats, isLoading } = useEnrichedConversations();
  
  return {
    ...stats,
    isLoading,
    
    // Recomendaciones
    needsAttention: stats.contactMatchRate < 80,
    recommendation: stats.contactMatchRate < 50 
      ? 'Crítico: Muchas conversaciones sin contactos relacionados'
      : stats.contactMatchRate < 80
      ? 'Mejorar: Crear contactos para conversaciones nuevas'
      : 'Bien: Buena relación contactos-conversaciones'
  };
} 