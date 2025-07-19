// 🧪 TESTS DE INTEGRACIÓN - Sistema de Validación Centralizado
// Garantiza que la validación funcione correctamente en todos los escenarios

import { describe, it, expect } from 'vitest'
import { MessageValidator, ConversationValidator, ContactValidator } from '@/lib/validation'
import type { CanonicalMessage, CanonicalConversation, CanonicalContact } from '@/types/canonical'

describe('Sistema de Validación Centralizado', () => {
  
  describe('MessageValidator', () => {
    
    it('✅ Valida mensaje correcto del backend UTalk', () => {
      const backendMessage = {
        id: 'msg_123',
        conversationId: 'conv_456',
        content: 'Hola, ¿cómo están?',
        type: 'text',
        timestamp: '2024-01-15T10:30:00Z',
        sender: {
          id: 'user123',
          name: 'Juan Pérez'
        },
        direction: 'inbound',
        status: 'read',
        twilioSid: 'MM1234567890',
        userId: 'agent456'
      }
      
      const validation = MessageValidator.validate(backendMessage)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data).toBeDefined()
      expect(validation.data!.id).toBe('msg_123')
      expect(validation.data!.timestamp).toBeInstanceOf(Date)
      expect(validation.data!.isRead).toBe(true)
      expect(validation.data!.isDelivered).toBe(true)
    })
    
    it('❌ Rechaza mensaje sin campos obligatorios', () => {
      const invalidMessage = {
        content: 'Mensaje sin ID ni timestamp'
      }
      
      const validation = MessageValidator.validate(invalidMessage)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors.some(e => e.field === 'id')).toBe(true)
      expect(validation.errors.some(e => e.field === 'timestamp')).toBe(true)
    })
    
    it('🔄 Transforma timestamp string a Date', () => {
      const messageWithStringTimestamp = {
        id: 'msg_123',
        conversationId: 'conv_456',
        content: 'Test',
        type: 'text',
        timestamp: '2024-01-15T10:30:00Z', // String ISO
        sender: {
          id: 'user123',
          name: 'Juan Pérez',
          type: 'contact'
        },
        direction: 'inbound',
        status: 'sent'
      }
      
      const validation = MessageValidator.validate(messageWithStringTimestamp)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data!.timestamp).toBeInstanceOf(Date)
    })
    
    it('🛡️ Valida respuesta completa del backend', () => {
      const backendResponse = {
        data: [
          {
            id: 'msg_1',
            conversationId: 'conv_1',
            content: 'Mensaje 1',
            type: 'text',
            timestamp: '2024-01-15T10:30:00Z',
            sender: { id: 'user1', name: 'Usuario 1', type: 'contact' },
            direction: 'inbound',
            status: 'read'
          },
          {
            id: 'msg_2',
            conversationId: 'conv_1',
            content: 'Mensaje 2',
            type: 'text',
            timestamp: '2024-01-15T10:31:00Z',
            sender: { id: 'agent1', name: 'Agente 1', type: 'agent' },
            direction: 'outbound',
            status: 'delivered'
          }
        ]
      }
      
      const validatedMessages = MessageValidator.validateBackendResponse(backendResponse)
      
      expect(validatedMessages).toHaveLength(2)
      expect(validatedMessages[0].id).toBe('msg_1')
      expect(validatedMessages[1].id).toBe('msg_2')
    })
    
    it('🚨 Maneja estructura de respuesta inválida', () => {
      const invalidResponse = {
        error: 'No messages found'
      }
      
      const validatedMessages = MessageValidator.validateBackendResponse(invalidResponse)
      
      expect(validatedMessages).toHaveLength(0)
    })
    
    it('🔧 Mapea campos legacy del backend', () => {
      const legacyMessage = {
        id: 'msg_123',
        conversationId: 'conv_456',
        content: 'Test',
        type: 'text',
        timestamp: '2024-01-15T10:30:00Z',
        sender: { id: 'user1', name: 'Usuario' },
        direction: 'inbound',
        status: 'delivered',
        // Campo legacy del backend UTalk
        media: {
          url: 'https://example.com/file.jpg',
          type: 'image/jpeg',
          name: 'imagen.jpg',
          size: 1024
        }
      }
      
      const validation = MessageValidator.validate(legacyMessage)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data!.attachments).toBeDefined()
      expect(validation.data!.attachments![0].url).toBe('https://example.com/file.jpg')
    })
  })
  
  describe('ConversationValidator', () => {
    
    it('✅ Valida conversación correcta', () => {
      const backendConversation = {
        id: 'conv_123',
        title: 'Conversación con Juan',
        status: 'open',
        priority: 'medium',
        channel: 'whatsapp',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastMessageAt: '2024-01-15T10:30:00Z',
        messageCount: 5,
        unreadCount: 2,
        contact: {
          id: 'contact_123',
          name: 'Juan Pérez',
          phone: '+525512345678',
          email: 'juan@example.com',
          status: 'active',
          source: 'whatsapp',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          totalMessages: 10,
          totalConversations: 2,
          value: 1000,
          currency: 'MXN',
          tags: ['cliente', 'premium']
        }
      }
      
      const validation = ConversationValidator.validate(backendConversation)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data).toBeDefined()
      expect(validation.data!.contact.phone).toBe('+525512345678')
    })
    
    it('🏷️ Infiere title del nombre del contacto', () => {
      const conversationWithoutTitle = {
        id: 'conv_123',
        status: 'open',
        channel: 'whatsapp',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastMessageAt: '2024-01-15T10:30:00Z',
        messageCount: 1,
        unreadCount: 1,
        contact: {
          id: 'contact_123',
          name: 'María García',
          phone: '+525512345679',
          status: 'active',
          source: 'whatsapp',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          totalMessages: 1,
          totalConversations: 1,
          value: 0,
          currency: 'MXN',
          tags: []
        }
      }
      
      const validation = ConversationValidator.validate(conversationWithoutTitle)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data!.title).toBe('María García')
      expect(validation.warnings.some(w => w.field === 'title')).toBe(true)
    })
  })
  
  describe('ContactValidator', () => {
    
    it('✅ Valida contacto correcto', () => {
      const backendContact = {
        id: 'contact_123',
        name: 'Juan Pérez',
        phone: '5512345678', // Sin formato internacional
        email: 'juan@example.com',
        company: 'Empresa SA',
        position: 'Gerente',
        status: 'customer',
        source: 'import',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        totalMessages: 25,
        totalConversations: 3,
        value: 5000,
        currency: 'USD',
        tags: ['vip', 'empresa']
      }
      
      const validation = ContactValidator.validate(backendContact)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data).toBeDefined()
      expect(validation.data!.phone).toBe('+525512345678') // Normalizado
    })
    
    it('📞 Normaliza formatos de teléfono', () => {
      const testCases = [
        { input: '5512345678', expected: '+525512345678' },
        { input: '+525512345678', expected: '+525512345678' },
        { input: '52-55-1234-5678', expected: '+525512345678' },
        { input: '(55) 1234-5678', expected: '+525512345678' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const contact = {
          id: 'test',
          name: 'Test',
          phone: input,
          status: 'active',
          source: 'manual',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          totalMessages: 0,
          totalConversations: 0,
          value: 0,
          currency: 'MXN',
          tags: []
        }
        
        const validation = ContactValidator.validate(contact)
        expect(validation.isValid).toBe(true)
        expect(validation.data!.phone).toBe(expected)
      })
    })
    
    it('⚙️ Aplica defaults correctos', () => {
      const minimalContact = {
        id: 'contact_123',
        name: 'Usuario Mínimo',
        phone: '+525512345678',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
      
      const validation = ContactValidator.validate(minimalContact)
      
      expect(validation.isValid).toBe(true)
      expect(validation.data!.status).toBe('active') // Default
      expect(validation.data!.source).toBe('manual') // Default
      expect(validation.data!.totalMessages).toBe(0) // Default
      expect(validation.data!.value).toBe(0) // Default
      expect(validation.data!.currency).toBe('MXN') // Default
      expect(validation.data!.tags).toEqual([]) // Default
    })
  })
  
  describe('Integración con Servicios', () => {
    
    it('🔄 Flujo completo: Backend → Validación → UI', () => {
      // Simular respuesta del backend
      const backendResponse = {
        success: true,
        data: [
          {
            id: 'msg_1',
            conversationId: 'conv_1',
            content: 'Mensaje de prueba',
            type: 'text',
            timestamp: '2024-01-15T10:30:00.000Z',
            sender: {
              id: 'contact_1',
              name: 'Cliente Prueba',
              type: 'contact'
            },
            direction: 'inbound',
            status: 'read',
            twilioSid: 'MM123456789'
          }
        ],
        total: 1,
        page: 1,
        limit: 50
      }
      
      // Validar con el sistema
      const validatedMessages = MessageValidator.validateBackendResponse(backendResponse)
      
      // Verificar que los datos están listos para la UI
      expect(validatedMessages).toHaveLength(1)
      
      const message = validatedMessages[0]
      expect(message.id).toBeDefined()
      expect(message.content).toBeDefined()
      expect(message.timestamp).toBeInstanceOf(Date)
      expect(message.sender.name).toBeDefined()
      expect(message.isRead).toBe(true)
      expect(message.isDelivered).toBe(true)
      
      // Este mensaje puede ir directamente a la UI sin más validaciones
      expect(() => {
        // Simular uso en componente
        const messageElement = {
          key: message.id,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
          senderName: message.sender.name
        }
        expect(messageElement.key).toBe('msg_1')
      }).not.toThrow()
    })
    
    it('🚨 Manejo de errores de red y estructura', () => {
      const invalidResponses = [
        null,
        undefined,
        { error: 'Network error' },
        { data: null },
        { messages: 'not an array' },
        []
      ]
      
      invalidResponses.forEach(response => {
        const validatedMessages = MessageValidator.validateBackendResponse(response)
        expect(Array.isArray(validatedMessages)).toBe(true)
        expect(validatedMessages.length).toBe(0)
      })
    })
  })
  
  describe('Casos Edge y Performance', () => {
    
    it('📊 Valida grandes volúmenes de datos', () => {
      const largeResponse = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `msg_${i}`,
          conversationId: 'conv_1',
          content: `Mensaje ${i}`,
          type: 'text',
          timestamp: new Date().toISOString(),
          sender: {
            id: `user_${i % 10}`,
            name: `Usuario ${i % 10}`,
            type: 'contact'
          },
          direction: 'inbound',
          status: 'sent'
        }))
      }
      
      const startTime = Date.now()
      const validatedMessages = MessageValidator.validateBackendResponse(largeResponse)
      const endTime = Date.now()
      
      expect(validatedMessages).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Menos de 1 segundo
    })
    
    it('🛡️ Resiliente a datos corruptos', () => {
      const corruptedResponse = {
        data: [
          { id: 'valid_1', conversationId: 'conv_1', content: 'Valid', type: 'text', timestamp: new Date().toISOString(), sender: { id: '1', name: 'User', type: 'contact' }, direction: 'inbound', status: 'sent' },
          { id: null, content: undefined }, // Corrupto
          { timestamp: 'invalid-date' }, // Corrupto
          { id: 'valid_2', conversationId: 'conv_1', content: 'Valid 2', type: 'text', timestamp: new Date().toISOString(), sender: { id: '2', name: 'User 2', type: 'contact' }, direction: 'inbound', status: 'sent' }
        ]
      }
      
      const validatedMessages = MessageValidator.validateBackendResponse(corruptedResponse)
      
      // Solo los mensajes válidos pasan
      expect(validatedMessages).toHaveLength(2)
      expect(validatedMessages[0].id).toBe('valid_1')
      expect(validatedMessages[1].id).toBe('valid_2')
    })
  })
})

// 🧪 MOCKS PARA TESTING
export const mockValidMessage: CanonicalMessage = {
  id: 'msg_test_123',
  conversationId: 'conv_test_456',
  content: 'Mensaje de prueba para testing',
  type: 'text',
  timestamp: new Date('2024-01-15T10:30:00Z'),
  sender: {
    id: 'user_test_789',
    name: 'Usuario de Prueba',
    type: 'contact',
    avatar: 'https://example.com/avatar.jpg'
  },
  status: 'delivered',
  direction: 'inbound',
  isRead: false,
  isDelivered: true,
  isImportant: false,
  metadata: {
    twilioSid: 'MM_test_123456789',
    userId: 'agent_test_456'
  }
}

export const mockValidConversation: CanonicalConversation = {
  id: 'conv_test_123',
  title: 'Conversación de Prueba',
  status: 'open',
  priority: 'medium',
  contact: {
    id: 'contact_test_123',
    name: 'Contacto de Prueba',
    phone: '+525512345678',
    email: 'test@example.com',
    status: 'active',
    source: 'manual',
    isOnline: true, // ✅ Campo obligatorio agregado
    channel: 'whatsapp', // ✅ Campo obligatorio agregado
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    totalMessages: 5,
    totalConversations: 1,
    value: 1000,
    currency: 'MXN',
    tags: ['test', 'cliente']
  },
  channel: 'whatsapp',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  lastMessageAt: new Date('2024-01-15T10:30:00Z'),
  messageCount: 5,
  unreadCount: 2,
  tags: ['test'],
  isMuted: false,
  isArchived: false
}

export const mockValidContact: CanonicalContact = {
  id: 'contact_test_123',
  name: 'Contacto de Prueba',
  phone: '+525512345678',
  email: 'test@example.com',
  company: 'Empresa de Prueba',
  position: 'Desarrollador',
  status: 'active',
  source: 'manual',
  isOnline: true, // ✅ Campo obligatorio agregado
  channel: 'whatsapp', // ✅ Campo obligatorio agregado
  createdAt: new Date('2024-01-15T09:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  totalMessages: 10,
  totalConversations: 2,
  value: 5000,
  currency: 'USD',
  tags: ['test', 'desarrollador', 'activo']
} 