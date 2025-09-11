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
  Hash
} from 'lucide-react';

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
const defaultChannels = [
  {
    id: '1',
    name: 'Pagos',
    description: 'Gestión y aprobación de pagos',
    icon: 'pagos',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Gastos',
    description: 'Control de gastos operativos',
    icon: 'gastos',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Envíos',
    description: 'Gestión de envíos y logística',
    icon: 'envios',
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'Facturas',
    description: 'Procesamiento de facturas',
    icon: 'facturas',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'RH',
    description: 'Recursos humanos y personal',
    icon: 'rh',
    unreadCount: 0,
  },
  {
    id: '6',
    name: 'Legal/Contable',
    description: 'Asuntos legales y contables',
    icon: 'legal/contable',
    unreadCount: 0,
  },
  {
    id: '7',
    name: 'Proveedores',
    description: 'Gestión de proveedores',
    icon: 'proveedores',
    unreadCount: 0,
  },
  {
    id: '8',
    name: 'Pedidos',
    description: 'Gestión de pedidos',
    icon: 'pedidos',
    unreadCount: 0,
  },
  {
    id: '9',
    name: 'Marketing',
    description: 'Estrategias de marketing',
    icon: 'marketing',
    unreadCount: 0,
  },
  {
    id: '10',
    name: 'Manufactura',
    description: 'Procesos de manufactura',
    icon: 'manufactura',
    unreadCount: 0,
  },
  {
    id: '11',
    name: 'Mantenimiento',
    description: 'Mantenimiento y soporte técnico',
    icon: 'mantenimiento',
    unreadCount: 0,
  },
];

// Mensajes directos por defecto
const defaultDirectMessages = [
  {
    id: 'dm_1',
    userName: 'Ana C.',
    lastMessage: '¿Podrías revisar el reporte?',
    isOnline: true,
  },
  {
    id: 'dm_2',
    userName: 'Carlos D.',
    lastMessage: 'Gracias por la información',
    isOnline: false,
  },
];

interface MobileChannelListProps {
  onChannelSelect: (channelId: string) => void;
}

export const MobileChannelList: React.FC<MobileChannelListProps> = ({ onChannelSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar canales basado en la búsqueda
  const filteredChannels = defaultChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar canales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        {/* Canales */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Canales
            </h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {filteredChannels.map((channel) => {
              const IconComponent = channelIcons[channel.icon] || Hash;
              return (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-gray-100">
                      <IconComponent className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-sm">{channel.name}</span>
                      <p className="text-xs text-gray-500">{channel.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button className="w-full flex items-center space-x-3 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2">
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
    </div>
  );
};
