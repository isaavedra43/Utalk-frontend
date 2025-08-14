import React, { useState } from 'react';
import { ChannelsColumn } from './ChannelsColumn';
import { ConversationList } from './ConversationList';
import { ChatComponent } from './ChatComponent';
import { DetailsPanel } from '../layout/DetailsPanel';
import { CopilotPanel } from '../layout/CopilotPanel';
import { useConversations } from '../../hooks/useConversations';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu,
  X
} from 'lucide-react';

// Tipos para las vistas móviles
type MobileView = 'channels' | 'conversations' | 'chat' | 'details';

// Componente interno para el contenido autenticado
const AuthenticatedChatContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('copilot');
  const [mobileView, setMobileView] = useState<MobileView>('conversations');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Hook de conversaciones (solo se ejecuta si está autenticado)
  const { selectedConversationId } = useConversations();

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

  // Función para manejar navegación móvil
  const handleMobileNavigation = (view: MobileView) => {
    setMobileView(view);
    setShowMobileMenu(false);
  };

  // Renderizar vista móvil
  const renderMobileView = () => {
    switch (mobileView) {
      case 'channels':
        return (
          <div className="h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">Canales</h1>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <ChannelsColumn />
          </div>
        );
      case 'conversations':
        return (
          <div className="h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">Conversaciones</h1>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <ConversationList />
          </div>
        );
      case 'chat':
        return (
          <div className="h-full bg-gray-100">
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
                    Selecciona una conversación
                  </h3>
                </div>
              </div>
            )}
          </div>
        );
      case 'details':
        return (
          <div className="h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => handleMobileNavigation('chat')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Detalles</h1>
              <div className="w-10"></div>
            </div>
            <div className="p-4">
              <DetailsPanel
                clientProfile={mockClientProfile}
                conversationDetails={mockConversationDetails}
                notificationSettings={mockNotificationSettings}
                onUpdateNotificationSettings={() => {}}
                isLoading={false}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-gray-100 overflow-hidden">
      {/* Vista Móvil */}
      <div className="lg:hidden h-full overflow-hidden">
        {/* Barra de navegación inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around py-2">
            <button
              onClick={() => handleMobileNavigation('channels')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                mobileView === 'channels' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">Canales</span>
            </button>
            <button
              onClick={() => handleMobileNavigation('conversations')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                mobileView === 'conversations' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-xs">Chats</span>
            </button>
            <button
              onClick={() => handleMobileNavigation('details')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                mobileView === 'details' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Detalles</span>
            </button>
          </div>
        </div>

        {/* Contenido principal con padding inferior para la barra de navegación */}
        <div className="h-full pb-16 overflow-hidden">
          {renderMobileView()}
        </div>

        {/* Menú móvil lateral */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => handleMobileNavigation('channels')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Users className="w-5 h-5 text-gray-600 mr-3" />
                    <span>Canales</span>
                  </button>
                  <button
                    onClick={() => handleMobileNavigation('conversations')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-600 mr-3" />
                    <span>Conversaciones</span>
                  </button>
                  <button
                    onClick={() => handleMobileNavigation('details')}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600 mr-3" />
                    <span>Detalles</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista Desktop - Solo el contenido principal sin sidebar */}
      <div className="hidden lg:flex h-full w-full bg-gray-100 overflow-hidden">
        {/* 1. Columna de Canales - La más estrecha */}
        <div className="w-48 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <ChannelsColumn />
        </div>
        
        {/* 2. Columna de Lista de Conversaciones - Más delgada */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <ConversationList />
        </div>
        
        {/* 3. Área de Chat - La más ancha */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-0 overflow-hidden">
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
                  Selecciona una conversación
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* 4. Panel de Detalles/Copilot - Más delgado */}
        <div className="w-64 bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden">
          {/* Tabs de navegación */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto min-h-0">
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
    </div>
  );
};

export const ChatModule: React.FC = () => {
  // El componente ya no maneja la autenticación, eso se hace en ProtectedRoute
  return <AuthenticatedChatContent />;
}; 