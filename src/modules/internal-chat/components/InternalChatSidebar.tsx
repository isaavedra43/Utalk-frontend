import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Building2, 
  CreditCard, 
  Truck, 
  FileText, 
  Users, 
  Scale, 
  Package, 
  ShoppingCart, 
  Megaphone, 
  Factory, 
  Wrench,
  MessageCircle,
  Hash,
  X
} from 'lucide-react';
import { useInternalChat } from '../context/InternalChatContext';
import { InternalChannel, DirectMessage } from '../../../types/internal-chat';
import { CreateChannelModal } from './CreateChannelModal';

// Iconos para los canales
const channelIcons: Record<string, React.ComponentType<any>> = {
  pagos: Building2,
  gastos: CreditCard,
  envios: Truck,
  facturas: FileText,
  rh: Users,
  'legal/contable': Scale,
  proveedores: Package,
  pedidos: ShoppingCart,
  marketing: Megaphone,
  manufactura: Factory,
  mantenimiento: Wrench,
};

// Canales por defecto
const defaultChannels: Omit<InternalChannel, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Pagos',
    description: 'Gestión y aprobación de pagos',
    icon: 'pagos',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: true,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Gastos',
    description: 'Control de gastos operativos',
    icon: 'gastos',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Envíos',
    description: 'Gestión de envíos y logística',
    icon: 'envios',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Facturas',
    description: 'Procesamiento de facturas',
    icon: 'facturas',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'RH',
    description: 'Recursos humanos y personal',
    icon: 'rh',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Legal/Contable',
    description: 'Asuntos legales y contables',
    icon: 'legal/contable',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Proveedores',
    description: 'Gestión de proveedores',
    icon: 'proveedores',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Pedidos',
    description: 'Gestión de pedidos',
    icon: 'pedidos',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Marketing',
    description: 'Estrategias de marketing',
    icon: 'marketing',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Manufactura',
    description: 'Procesos de manufactura',
    icon: 'manufactura',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
  {
    name: 'Mantenimiento',
    description: 'Mantenimiento y soporte técnico',
    icon: 'mantenimiento',
    type: 'public',
    members: [],
    unreadCount: 0,
    isActive: false,
    settings: {
      approvers: [],
      autoForwardRules: [],
      sla: { enabled: false, duration: 0, escalationUsers: [] },
      templates: [],
    },
  },
];

// Mensajes directos por defecto
const defaultDirectMessages: DirectMessage[] = [
  {
    id: 'dm_1',
    userId: 'user_1',
    userName: 'Ana C.',
    userAvatar: undefined,
    lastMessage: '¿Podrías revisar el reporte?',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    unreadCount: 0,
    isOnline: true,
    status: 'online',
  },
  {
    id: 'dm_2',
    userId: 'user_2',
    userName: 'Ana C.',
    userAvatar: undefined,
    lastMessage: 'Gracias por la información',
    lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    unreadCount: 0,
    isOnline: false,
    status: 'offline',
  },
];

interface InternalChatSidebarProps {
  onClose?: () => void;
  onChannelSelect?: (channelId: string) => void;
}

export const InternalChatSidebar: React.FC<InternalChatSidebarProps> = ({ onClose, onChannelSelect }) => {
  const { state, actions } = useInternalChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  // Inicializar canales por defecto si no existen
  React.useEffect(() => {
    console.log('Sidebar: channels length:', state.channels.length);
    if (state.channels.length === 0) {
      console.log('Sidebar: Creating default channels');
      defaultChannels.forEach(channelData => {
        actions.createChannel(channelData);
      });
    }
  }, [state.channels.length, actions]);

  // Inicializar mensajes directos por defecto si no existen
  React.useEffect(() => {
    if (state.directMessages.length === 0) {
      // Aquí se inicializarían los mensajes directos
    }
  }, [state.directMessages.length]);

  // Filtrar canales basado en la búsqueda
  const filteredChannels = state.channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Sidebar: filteredChannels:', filteredChannels.length);
  
  // Usar canales por defecto si no hay canales en el estado
  const channelsToShow = filteredChannels.length > 0 ? filteredChannels : defaultChannels.map((channel, index) => ({
    ...channel,
    id: `default_${index}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const handleChannelClick = (channelId: string) => {
    actions.setActiveChannel(channelId);
    
    // Si hay función onChannelSelect (móvil), usarla
    if (onChannelSelect) {
      onChannelSelect(channelId);
    }
    
    // Cerrar sidebar en móvil después de seleccionar canal
    if (onClose) {
      onClose();
    }
  };

  const handleCreateChannel = (channelData: any) => {
    const newChannel: Omit<InternalChannel, 'id' | 'createdAt' | 'updatedAt'> = {
      name: channelData.name,
      description: channelData.description,
      icon: channelData.icon.toLowerCase().replace(/\s+/g, '-'),
      type: channelData.visibility,
      members: [],
      unreadCount: 0,
      isActive: false,
      settings: {
        approvers: [],
        autoForwardRules: [],
        sla: { enabled: false, duration: 0, escalationUsers: [] },
        templates: [],
      },
    };
    actions.createChannel(newChannel);
  };

  return (
    <div className={`${onChannelSelect ? 'w-full' : 'w-80'} internal-chat-sidebar flex flex-col h-full`}>
      {/* Header móvil */}
      {onClose && (
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Canales</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Canales */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Canales
            </h2>
            <button 
              onClick={() => setIsCreateChannelModalOpen(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {channelsToShow.map((channel) => {
              const IconComponent = channelIcons[channel.icon] || Hash;
              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg internal-chat-transition channel-item ${
                    channel.isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${
                      channel.isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        channel.isActive ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <span className="font-medium text-sm">{channel.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setIsCreateChannelModalOpen(true)}
            className="w-full flex items-center space-x-3 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Agregar canal</span>
          </button>
        </div>

        {/* Mensajes directos */}
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Mensajes directos
          </h2>

          <div className="space-y-1">
            {defaultDirectMessages.map((dm) => (
              <button
                key={dm.id}
                className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {dm.userName.charAt(0)}
                    </span>
                  </div>
                  {dm.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dm.userName}</span>
                  </div>
                  {dm.lastMessage && (
                    <p className="text-xs text-gray-500 truncate">{dm.lastMessage}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de crear canal */}
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  );
};
