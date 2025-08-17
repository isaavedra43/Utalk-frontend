import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatComponent } from './ChatComponent';
import { RightSidebar } from '../layout/RightSidebar';
import { DetailsPanel } from '../layout/DetailsPanel';
import { SuggestionsPanel } from '../layout/SuggestionsPanel';
import { useConversations } from '../../hooks/useConversations';
import { 
  ChevronLeft, 
  Settings, 
  Menu, 
  X, 
  MessageSquare, 
  Users, 
  Bell, 
  LayoutDashboard, 
  Building2 
} from 'lucide-react';
import '../../styles/four-column-layout.css';

// Tipos para las vistas móviles
type MobileView = 'conversations' | 'chat' | 'details';

// Componente interno para el contenido autenticado
const AuthenticatedChatContent: React.FC = () => {
  const [mobileView, setMobileView] = useState<MobileView>('conversations');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // NUEVO: Una sola instancia del hook useConversations
  const conversationsData = useConversations({});

  // Datos mock para el panel de detalles
  const mockClientProfile = {
    id: '1',
    name: 'Cliente Ejemplo',
    email: 'cliente@ejemplo.com',
    phone: '+1234567890',
    company: 'Empresa Ejemplo',
    status: 'active' as const,
    channel: 'whatsapp' as const,
    tags: ['VIP', 'Premium']
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
    participants: ['+1234567890'],
    tags: ['VIP']
  };

  const mockNotificationSettings = {
    conversationNotifications: true,
    reports: true,
    autoFollowUp: false,
    emailNotifications: true,
    pushNotifications: true
  };

  // Navegación móvil
  const mobileNavigationItems = [
    { id: 'conversations', icon: MessageSquare, label: 'Chat', badge: null },
    { id: 'details', icon: Settings, label: 'Detalles', badge: null }
  ];

  const handleMobileNavigation = (view: MobileView) => {
    setMobileView(view);
  };

  // Renderizar vista móvil
  const renderMobileView = () => {
    switch (mobileView) {
      case 'conversations':
        return (
          <div className="h-full bg-white flex flex-col">
            {/* Header de conversaciones */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-semibold">Conversaciones</h1>
              </div>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenido de conversaciones */}
            <div className="flex-1 overflow-hidden">
              <ConversationList {...conversationsData} />
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="h-full bg-white">
            {/* Header del chat */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileView('conversations')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {conversationsData.activeConversation?.customerName?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{conversationsData.activeConversation?.customerName || 'Cliente'}</h2>
                    <p className="text-sm text-white/80">En línea</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileView('details')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenido del chat */}
            <div className="flex-1 overflow-hidden">
              <ChatComponent conversationId={conversationsData.activeConversation?.id} />
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="h-full bg-white">
            {/* Header de detalles */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileView('chat')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold">Detalles</h1>
              </div>
            </div>
            
            {/* Contenido de detalles */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
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

  // Menú lateral móvil moderno
  const renderMobileMenu = () => {
    if (!showMobileMenu) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
        
        {/* Menú */}
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header del menú */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h2 className="text-lg font-semibold">Menú</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navegación del menú */}
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
                  { id: 'clients', icon: Building2, label: 'Clientes', path: '/clients' },
                  { id: 'team', icon: Users, label: 'Equipo', path: '/team' },
                  { id: 'notifications', icon: Bell, label: 'Notificaciones', path: '/notifications' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Vista móvil moderna */}
      <div className="lg:hidden h-full">
        {renderMobileView()}
        {renderMobileMenu()}
        
        {/* Navegación inferior moderna */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden">
          <div className="flex items-center justify-around p-2">
            {mobileNavigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = mobileView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavigation(item.id as MobileView)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <div className="relative">
                    <IconComponent className="h-6 w-6" />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium h-5 w-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vista desktop - Layout de 4 columnas */}
      <div className="four-column-layout">
        {/* Columna 1: Lista de conversaciones */}
        <div className="conversations-column column-separator">
          <ConversationList {...conversationsData} />
        </div>
        
        {/* Columna 2: Chat (con más ancho) */}
        <div className="chat-column column-separator">
          <ChatComponent conversationId={conversationsData.activeConversation?.id} />
        </div>
        
        {/* Columna 3: Sugerencias (independiente) */}
        <div className="suggestions-column column-separator">
          <SuggestionsPanel />
        </div>
        
        {/* Columna 4: Detalles + Copiloto */}
        <div className="details-copilot-column">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export const ChatModule: React.FC = () => {
  // El componente ya no maneja la autenticación, eso se hace en ProtectedRoute
  return <AuthenticatedChatContent />;
}; 