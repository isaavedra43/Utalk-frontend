// Datos mock para desarrollo - Mensajes y conversaciones
// Simula datos reales para testing y desarrollo del chat
import { Message, Conversation } from '@/types'

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    content: '¡Hola! ¿Cómo estás?',
    type: 'text',
    senderId: 'user1',
    recipientId: 'contact1',
    conversationId: 'conv1',
    isRead: true,
    sentAt: new Date('2024-01-20T10:30:00'),
  },
  {
    id: 'msg2',
    content: '¡Hola! Todo bien, gracias por preguntar. ¿Y tú?',
    type: 'text',
    senderId: 'contact1',
    recipientId: 'user1',
    conversationId: 'conv1',
    isRead: true,
    sentAt: new Date('2024-01-20T10:32:00'),
  },
  {
    id: 'msg3',
    content: 'Perfecto. Quería consultarte sobre el proyecto que mencionaste.',
    type: 'text',
    senderId: 'user1',
    recipientId: 'contact1',
    conversationId: 'conv1',
    isRead: true,
    sentAt: new Date('2024-01-20T10:35:00'),
  },
  {
    id: 'msg4',
    content: '¿Te parece si programamos una reunión esta semana?',
    type: 'text',
    senderId: 'user1',
    recipientId: 'contact1',
    conversationId: 'conv1',
    isRead: false,
    sentAt: new Date('2024-01-20T10:36:00'),
  },
  {
    id: 'msg5',
    content: '¡Hola! Te envío la propuesta comercial.',
    type: 'text',
    senderId: 'user1',
    recipientId: 'contact2',
    conversationId: 'conv2',
    isRead: true,
    sentAt: new Date('2024-01-19T16:15:00'),
  },
  {
    id: 'msg6',
    content: 'propuesta-comercial.pdf',
    type: 'file',
    senderId: 'user1',
    recipientId: 'contact2',
    conversationId: 'conv2',
    isRead: true,
    sentAt: new Date('2024-01-19T16:16:00'),
    metadata: {
      fileName: 'propuesta-comercial.pdf',
      fileSize: 2048576,
      fileType: 'application/pdf',
    },
  },
]

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: ['user1', 'contact1'],
    lastMessage: mockMessages[3],
    unreadCount: 1,
    isArchived: false,
    createdAt: new Date('2024-01-20T10:30:00'),
    updatedAt: new Date('2024-01-20T10:36:00'),
  },
  {
    id: 'conv2',
    participants: ['user1', 'contact2'],
    lastMessage: mockMessages[5],
    unreadCount: 0,
    isArchived: false,
    createdAt: new Date('2024-01-19T16:15:00'),
    updatedAt: new Date('2024-01-19T16:16:00'),
  },
]

// Función helper para obtener mensajes de una conversación
export const getMessagesByConversation = (conversationId: string): Message[] => {
  return mockMessages.filter(msg => msg.conversationId === conversationId)
}

// Función helper para obtener conversación por ID
export const getConversationById = (id: string): Conversation | undefined => {
  return mockConversations.find(conv => conv.id === id)
}

// Función helper para marcar mensajes como leídos
export const markMessagesAsRead = (conversationId: string, userId: string): Message[] => {
  return mockMessages.map(msg => {
    if (msg.conversationId === conversationId && msg.recipientId === userId) {
      return { ...msg, isRead: true }
    }
    return msg
  })
} 