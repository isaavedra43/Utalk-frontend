// Componente principal del módulo de chat/inbox
// Layout de tres columnas: Sidebar, ConversationList, ChatWindow + Panels
import { useState } from 'react'
import { InboxProps, ConversationFilter, Conversation, Message, TypingIndicator, SuggestedResponse, ConversationSummary } from './types'
import Sidebar from './components/Sidebar'
import ConversationList from './components/ConversationList'
import ChatWindow from './components/ChatWindow'
import IAPanel from './components/IAPanel'
import InfoPanel from './components/InfoPanel'

// Datos simulados para demostración - TODO: Remover cuando se integre con API real
const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    contact: {
      id: 'contact1',
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+34 666 777 888',
      avatar: undefined,
      channel: 'whatsapp',
      tags: ['vip', 'cliente'],
      isOnline: true,
      lastSeen: new Date(),
      customFields: { empresa: 'Tech Corp' }
    },
    channel: 'whatsapp',
    status: 'open',
    assignedTo: {
      id: 'agent1',
      name: 'Juan Pérez',
      avatar: undefined
    },
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      content: 'Hola, necesito ayuda con mi pedido',
      type: 'text',
      timestamp: new Date(),
      sender: {
        id: 'contact1',
        name: 'Ana García',
        type: 'contact',
        avatar: undefined
      },
      isRead: false,
      isDelivered: true
    },
    unreadCount: 2,
    tags: ['urgente'],
    createdAt: new Date(),
    updatedAt: new Date(),
    priority: 'high',
    isMuted: false
  },
  {
    id: 'conv2',
    contact: {
      id: 'contact2',
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+34 699 888 777',
      avatar: undefined,
      channel: 'email',
      tags: ['soporte'],
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000), // 1 hora atrás
      customFields: {}
    },
    channel: 'email',
    status: 'pending',
    assignedTo: undefined,
    lastMessage: {
      id: 'msg2',
      conversationId: 'conv2',
      content: 'Gracias por la información',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000), // 30 min atrás
      sender: {
        id: 'agent1',
        name: 'Juan Pérez',
        type: 'agent',
        avatar: undefined
      },
      isRead: true,
      isDelivered: true
    },
    unreadCount: 0,
    tags: [],
    createdAt: new Date(Date.now() - 86400000), // 1 día atrás
    updatedAt: new Date(Date.now() - 1800000),
    priority: 'medium',
    isMuted: false
  }
]

const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    content: 'Hola, tengo un problema con mi pedido número #12345',
    type: 'text',
    timestamp: new Date(Date.now() - 3600000),
    sender: {
      id: 'contact1',
      name: 'Ana García',
      type: 'contact',
      avatar: undefined
    },
    isRead: true,
    isDelivered: true
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    content: 'Hola Ana, estaré encantado de ayudarte. ¿Podrías decirme qué problema específico tienes?',
    type: 'text',
    timestamp: new Date(Date.now() - 3500000),
    sender: {
      id: 'agent1',
      name: 'Juan Pérez',
      type: 'agent',
      avatar: undefined
    },
    isRead: true,
    isDelivered: true
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    content: 'No me ha llegado y la fecha de entrega era ayer',
    type: 'text',
    timestamp: new Date(Date.now() - 1800000),
    sender: {
      id: 'contact1',
      name: 'Ana García',
      type: 'contact',
      avatar: undefined
    },
    isRead: false,
    isDelivered: true
  }
]

const mockSuggestions: SuggestedResponse[] = [
  {
    id: 'sugg1',
    content: 'Lamento escuchar sobre el retraso en tu pedido. Permíteme revisar el estado de tu envío inmediatamente.',
    confidence: 92,
    category: 'Disculpa',
    isRelevant: true
  },
  {
    id: 'sugg2',
    content: 'Puedo ayudarte a rastrear tu pedido y encontrar una solución. ¿Tienes el número de seguimiento?',
    confidence: 87,
    category: 'Soporte',
    isRelevant: true
  }
]

const mockSummary: ConversationSummary = {
  totalMessages: 8,
  avgResponseTime: '2 min',
  sentiment: 'neutral',
  topics: ['pedido', 'envío', 'retraso'],
  lastActivity: new Date()
}

export function Inbox({ initialConversationId }: InboxProps = {}) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(initialConversationId)
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [filter, setFilter] = useState<ConversationFilter>({})
  const [isLoading] = useState(false)
  const [activePanel, setActivePanel] = useState<'ai' | 'info'>('ai')
  const [typingUsers] = useState<TypingIndicator[]>([])

  // Filtrar conversaciones según el filtro activo
  const filteredConversations = conversations.filter(conv => {
    if (filter.search && !conv.contact.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }
    if (filter.status && conv.status !== filter.status) {
      return false
    }
    if (filter.channel && conv.channel !== filter.channel) {
      return false
    }
    if (filter.assignedTo && conv.assignedTo?.id !== filter.assignedTo) {
      return false
    }
    if (filter.unreadOnly && conv.unreadCount === 0) {
      return false
    }
    return true
  })

  // Obtener conversación seleccionada
  const selectedConversation = selectedConversationId 
    ? conversations.find(conv => conv.id === selectedConversationId)
    : undefined

  // Obtener mensajes de la conversación seleccionada
  const conversationMessages = selectedConversationId
    ? messages.filter(msg => msg.conversationId === selectedConversationId)
    : []

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    
    // Marcar mensajes como leídos (simulado)
    setMessages(prev => prev.map(msg => 
      msg.conversationId === conversationId 
        ? { ...msg, isRead: true }
        : msg
    ))
    
    // Actualizar contador de no leídos
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: 0 }
        : conv
    ))
  }

  const handleSendMessage = (content: string, type: string) => {
    if (!selectedConversationId) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversationId,
      content,
      type: type as any,
      timestamp: new Date(),
      sender: {
        id: 'current-agent',
        name: 'Usuario Actual',
        type: 'agent',
        avatar: undefined
      },
      isRead: false,
      isDelivered: false
    }

    setMessages(prev => [...prev, newMessage])

    // Actualizar última actividad de la conversación
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversationId
        ? { 
            ...conv, 
            lastMessage: newMessage,
            updatedAt: new Date()
          }
        : conv
    ))
  }

  const handleSendSuggestion = (suggestion: SuggestedResponse) => {
    handleSendMessage(suggestion.content, 'text')
  }

  const handleAskAssistant = async (question: string) => {
    // TODO: Implementar llamada a API de IA
    console.log('Pregunta al asistente:', question)
  }

  const handleUpdateContact = (contactId: string, data: Partial<any>) => {
    setConversations(prev => prev.map(conv =>
      conv.contact.id === contactId
        ? { ...conv, contact: { ...conv.contact, ...data } }
        : conv
    ))
  }

  const handleUpdateConversation = (conversationId: string, data: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, ...data }
        : conv
    ))
  }

  return (
    <div className="flex h-screen bg-[#181e2a] overflow-hidden">
      {/* Sidebar izquierda */}
      <Sidebar 
        onFilterChange={setFilter}
        currentFilter={filter}
      />

      {/* Lista de conversaciones */}
      <ConversationList
        conversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoading}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Ventana de chat */}
      <ChatWindow
        conversationId={selectedConversationId}
        messages={conversationMessages}
        isLoading={isLoading}
        typingUsers={typingUsers}
        onSendMessage={handleSendMessage}
      />

      {/* Panel derecho con tabs */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        {/* Tabs del panel derecho */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActivePanel('ai')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activePanel === 'ai'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🤖 Asistente IA
          </button>
          <button
            onClick={() => setActivePanel('info')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activePanel === 'info'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            👤 Info Cliente
          </button>
        </div>

        {/* Contenido del panel */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'ai' ? (
            <IAPanel
              conversationId={selectedConversationId}
              suggestions={mockSuggestions}
              summary={mockSummary}
              onSendSuggestion={handleSendSuggestion}
              onAskAssistant={handleAskAssistant}
            />
          ) : (
            <InfoPanel
              contact={selectedConversation?.contact}
              conversation={selectedConversation}
              onUpdateContact={handleUpdateContact}
              onUpdateConversation={handleUpdateConversation}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Inbox 