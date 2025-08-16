import React, { useState } from 'react';
import { ChannelsColumn } from './ChannelsColumn';
import { ConversationList } from './ConversationList';
import { ChatComponent } from './ChatComponent';
import { RightSidebar } from '../layout/RightSidebar';
import { useAppStore } from '../../stores/useAppStore';

import { 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu,
  X,
  Grid3X3,
  Building2,
  Bell,
  LayoutDashboard
} from 'lucide-react';

// Tipos para las vistas móviles
type MobileView = 'channels' | 'conversations' | 'chat' | 'details';

// Componente interno para el contenido autenticado
const AuthenticatedChatContent: React.FC = () => {
  const [mobileView, setMobileView] = useState<MobileView>('conversations');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // NUEVO: Obtener la conversación seleccionada del store
  const { activeConversation } = useAppStore();

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

  // Función para manejar navegación móvil
  const handleMobileNavigation = (view: MobileView) => {
    setMobileView(view);
    setShowMobileMenu(false);
  };

  // Navegación móvil moderna
  const mobileNavigationItems = [
    {
      id: 'channels' as MobileView,
      icon: Grid3X3,
      label: 'Canales',
      badge: '5'
    },
    {
      id: 'conversations' as MobileView,
      icon: MessageSquare,
      label: 'Chats',
      badge: '9+'
    },
    {
      id: 'details' as MobileView,
      icon: Settings,
      label: 'Detalles'
    }
  ];

  // Renderizar vista móvil moderna
  const renderMobileView = () => {
    switch (mobileView) {
      case 'channels':
        return (
          <div className="h-full bg-white">
            {/* Header moderno */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <h1 className="text-lg font-semibold">Canales</h1>
              </div>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenido de canales */}
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filtrar canales..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Grid3X3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Lista de canales */}
              <div className="space-y-3">
                {[
                  { name: 'Asignados a ti', count: 0, icon: Users },
                  { name: 'Sin contestar', count: 8, icon: Bell },
                  { name: 'Abiertos', count: 2, icon: MessageSquare },
                  { name: 'Urgentes', count: 0, icon: Building2 }
                ].map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <channel.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{channel.name}</span>
                    </div>
                    {channel.count > 0 && (
                      <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                        {channel.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'conversations':
        return (
          <div className="h-full bg-white">
            {/* Header moderno */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
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
              <ConversationList />
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
                      {activeConversation?.customerName?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{activeConversation?.customerName || 'Cliente'}</h2>
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
              <ChatComponent conversationId={activeConversation?.id} />
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
            <div className="flex-1 overflow-y-auto">
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
        
        {/* Menú lateral */}
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform">
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
                  onClick={() => handleMobileNavigation(item.id)}
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

      {/* Vista desktop - Mantener diseño existente */}
      <div className="hidden lg:flex h-full">
        <div className="w-80 border-r border-gray-200 bg-white">
          <ChannelsColumn />
        </div>
        <div className="w-96 border-r border-gray-200 bg-white">
          <ConversationList />
        </div>
        <div className="flex-1 bg-white">
          <ChatComponent conversationId={activeConversation?.id} />
        </div>
        <div className="w-80 border-l border-gray-200 bg-white">
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