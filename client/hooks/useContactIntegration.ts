import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContacts } from '@/hooks/useContacts';
import { logger } from '@/lib/utils';
import type { Conversation, Contact } from '@/types/api';

/**
 * 🔧 Hook para integrar automáticamente contactos con conversaciones
 * 
 * Este hook enriquece las conversaciones con información de contactos:
 * - Nombres en lugar de solo números de teléfono
 * - Avatar de contacto si está disponible
 * - Información adicional como email, estado, etc.
 */
export function useContactIntegration() {
  const queryClient = useQueryClient();
  const { data: contactsResponse } = useContacts();
  
  const contacts = contactsResponse?.data || [];

  // Crear un mapa de teléfono -> contacto para búsqueda rápida
  const phoneToContactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    
    contacts.forEach(contact => {
      if (contact.phone) {
        // Normalizar número de teléfono para matching flexible
        const normalizedPhone = normalizePhoneNumber(contact.phone);
        map.set(normalizedPhone, contact);
        
        // También mapear el teléfono original por si acaso
        map.set(contact.phone, contact);
      }
    });
    
    logger.api('Mapa de contactos creado', { 
      totalContacts: contacts.length, 
      mappedPhones: map.size 
    });
    
    return map;
  }, [contacts]);

  /**
   * Enriquecer una conversación individual con datos de contacto
   */
  const enrichConversation = (conversation: Conversation): Conversation & {
    contactInfo?: Contact;
    displayName: string;
    contactEmail?: string;
    contactStatus?: Contact['status'];
  } => {
    if (!conversation.customerPhone) {
      return {
        ...conversation,
        displayName: conversation.name || "Cliente sin teléfono"
      };
    }

    const normalizedPhone = normalizePhoneNumber(conversation.customerPhone);
    const contact = phoneToContactMap.get(normalizedPhone) || phoneToContactMap.get(conversation.customerPhone);
    
    if (contact) {
      logger.api('Contacto encontrado para conversación', {
        conversationId: conversation.id,
        phone: conversation.customerPhone,
        contactName: contact.name,
        contactId: contact.id
      });

      return {
        ...conversation,
        contactInfo: contact,
        displayName: contact.name || conversation.name || `Cliente ${conversation.customerPhone}`,
        name: contact.name || conversation.name, // Override name with contact name
        contactEmail: contact.email,
        contactStatus: contact.status,
        avatar: contact.avatarUrl || conversation.avatar
      };
    }

    // Si no se encuentra contacto, usar datos de la conversación
    return {
      ...conversation,
      displayName: conversation.name || `Cliente ${conversation.customerPhone}`
    };
  };

  /**
   * Enriquecer una lista de conversaciones con datos de contactos
   */
  const enrichConversations = (conversations: Conversation[]) => {
    return conversations.map(enrichConversation);
  };

  /**
   * Actualizar automáticamente el cache de conversaciones con datos de contactos
   */
  useEffect(() => {
    if (contacts.length === 0) return;

    logger.api('Actualizando cache de conversaciones con datos de contactos');

    // Actualizar cache de lista de conversaciones
    queryClient.setQueryData(['conversations'], (old: any) => {
      if (!old?.conversations) return old;

      const enrichedConversations = enrichConversations(old.conversations);
      
      return {
        ...old,
        conversations: enrichedConversations
      };
    });

    // También actualizar conversaciones individuales en cache
    queryClient.getQueryCache().findAll({ queryKey: ['conversations'] }).forEach(query => {
      const queryKey = query.queryKey;
      
      // Si es una conversación específica (formato: ['conversations', conversationId])
      if (queryKey.length === 2 && typeof queryKey[1] === 'string') {
        const conversationData = query.state.data as Conversation;
        if (conversationData) {
          const enriched = enrichConversation(conversationData);
          queryClient.setQueryData(queryKey, enriched);
        }
      }
    });

  }, [contacts, queryClient, phoneToContactMap]);

  /**
   * Crear un nuevo contacto desde una conversación
   */
  const createContactFromConversation = async (conversation: Conversation) => {
    if (!conversation.customerPhone) {
      throw new Error('No se puede crear contacto sin número de teléfono');
    }

    // Verificar si ya existe el contacto
    const normalizedPhone = normalizePhoneNumber(conversation.customerPhone);
    const existingContact = phoneToContactMap.get(normalizedPhone);
    
    if (existingContact) {
      logger.api('Contacto ya existe', { 
        phone: conversation.customerPhone, 
        contactId: existingContact.id 
      });
      return existingContact;
    }

    // Crear nuevo contacto
    const newContactData = {
      name: conversation.name || `Cliente ${conversation.customerPhone}`,
      phone: conversation.customerPhone,
      email: '', // Será llenado por el usuario después
      status: 'new-lead' as const,
      section: conversation.section || 'general',
    };

    logger.api('Creando nuevo contacto desde conversación', {
      conversationId: conversation.id,
      contactData: newContactData
    });

    // Aquí se haría la llamada real a la API
    // const createdContact = await createContact(newContactData);
    // return createdContact;

    return newContactData;
  };

  /**
   * Buscar contacto por número de teléfono
   */
  const findContactByPhone = (phone: string): Contact | undefined => {
    const normalizedPhone = normalizePhoneNumber(phone);
    return phoneToContactMap.get(normalizedPhone) || phoneToContactMap.get(phone);
  };

  /**
   * Obtener estadísticas de integración
   */
  const getIntegrationStats = () => {
    // Obtener conversaciones actuales del cache
    const conversationsData = queryClient.getQueryData(['conversations']) as any;
    const conversations = conversationsData?.conversations || [];
    
    const totalConversations = conversations.length;
    const conversationsWithContacts = conversations.filter((conv: any) => 
      conv.contactInfo || findContactByPhone(conv.customerPhone)
    ).length;

    const integrationRate = totalConversations > 0 
      ? (conversationsWithContacts / totalConversations) * 100 
      : 0;

    return {
      totalContacts: contacts.length,
      totalConversations,
      conversationsWithContacts,
      conversationsWithoutContacts: totalConversations - conversationsWithContacts,
      integrationRate: Math.round(integrationRate)
    };
  };

  return {
    enrichConversation,
    enrichConversations,
    createContactFromConversation,
    findContactByPhone,
    phoneToContactMap,
    getIntegrationStats,
    isLoading: !contactsResponse,
    hasContacts: contacts.length > 0
  };
}

/**
 * Normalizar número de teléfono para matching flexible
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remover espacios, guiones, paréntesis y signos +
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Si empieza con código de país, mantenerlo
  // Si no, asumir que es número local
  return cleaned;
}

/**
 * Hook simplificado para obtener información de contacto por teléfono
 */
export function useContactByPhone(phone: string) {
  const { findContactByPhone, isLoading } = useContactIntegration();
  
  const contact = phone ? findContactByPhone(phone) : undefined;
  
  return {
    contact,
    isLoading,
    hasContact: !!contact,
    displayName: contact?.name || (phone ? `Cliente ${phone}` : 'Cliente sin teléfono'),
    avatar: contact?.avatarUrl,
    email: contact?.email,
    status: contact?.status
  };
}

/**
 * Hook para enrichecer conversaciones automáticamente
 */
export function useEnrichedConversations(conversations: Conversation[]) {
  const { enrichConversations, isLoading } = useContactIntegration();
  
  const enrichedConversations = useMemo(() => {
    if (isLoading || !conversations.length) return conversations;
    return enrichConversations(conversations);
  }, [conversations, enrichConversations, isLoading]);

  return {
    conversations: enrichedConversations,
    isLoading
  };
} 