import React, { useState } from 'react';
import { ChannelsColumn } from './ChannelsColumn';
import { ConversationList } from './ConversationList';
import { ChatComponent } from './ChatComponent';
import { DetailsPanel } from '../layout/DetailsPanel';
import { CopilotPanel } from '../layout/CopilotPanel';
import { useConversations } from '../../hooks/useConversations';

export const ChatModule: React.FC = () => {
  const { selectedConversationId } = useConversations();
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('copilot');

  // Datos mock para el panel de detalles
  const mockClientProfile = {
    id: '1',
    name: 'Isra',
    phone: '+5214773790184',
    channel: 'whatsapp' as const,
    lastContact: 'hace un momento',
    clientSince: '2024',
    whatsappId: '5214773790184',
    tags: ['VIP', 'Premium'],
    status: 'active' as const
  };

  const mockConversationDetails = {
    id: 'conv_1',
    status: 'open' as const,
    priority: 'high' as const,
    unreadCount: 5,
    assignedToName: 'Tú',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    lastMessageAt: '2024-01-01',
    messageCount: 10,
    participants: ['+5214773790184'],
    tags: ['VIP']
  };

  const mockNotificationSettings = {
    conversationNotifications: true,
    reports: true,
    autoFollowUp: false,
    emailNotifications: true,
    pushNotifications: true
  };

  // Datos mock para el panel de copilot
  const mockCopilotState = {
    isMockMode: true,
    activeTab: 'suggestions' as const,
    suggestions: [],
    chatHistory: [],
    isLoading: false
  };

  const mockAiSuggestions = [
    {
      id: '1',
      title: 'Respuesta rápida',
      content: '¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte hoy?',
      confidence: 'high' as const,
      category: 'respuesta',
      tags: ['respuesta', 'cordial'],
      actions: { copy: true, improve: true, use: true }
    }
  ];

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* 1. Columna de Canales - La más estrecha */}
      <div className="w-48 bg-white border-r border-gray-200 flex-shrink-0">
        <ChannelsColumn />
      </div>
      
      {/* 2. Columna de Lista de Conversaciones - Más delgada */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <ConversationList />
      </div>
      
      {/* 3. Área de Chat - La más ancha */}
      <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
        {selectedConversationId ? (
          <ChatComponent conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cargando conversación...
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* 4. Panel de Detalles/Copilot - Más delgado */}
      <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0">
        {/* Tabs de navegación */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'copilot'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Copilot
          </button>
        </div>

        {/* Contenido del panel */}
        <div className="h-full overflow-y-auto">
          {activeTab === 'details' ? (
            <DetailsPanel
              clientProfile={mockClientProfile}
              conversationDetails={mockConversationDetails}
              notificationSettings={mockNotificationSettings}
              onUpdateNotificationSettings={() => {}}
              isLoading={false}
            />
          ) : (
            <CopilotPanel
              copilotState={mockCopilotState}
              aiSuggestions={mockAiSuggestions}
              onSetCopilotTab={() => {}}
              onCopySuggestion={() => {}}
              onImproveSuggestion={() => {}}
              onGenerateSuggestion={() => {}}
              isLoading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 