import React from 'react';
import { Search } from 'lucide-react';

// Datos mock basados en las imágenes
const mockConversations = [
  {
    id: '1',
    name: 'María González',
    avatar: 'MG',
    lastMessage: '¡Perfecto! Muchas gr',
    tag: 'Order',
    tagCount: 1,
    status: 'online',
    isSelected: true
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    avatar: 'CR',
    lastMessage: 'Buenos días, soy nue',
    tag: 'New Cus',
    tagCount: 1,
    status: 'offline'
  },
  {
    id: '3',
    name: 'David López',
    avatar: 'DL',
    lastMessage: 'Tengo un problema t',
    tag: 'Technica',
    tagCount: 1,
    status: 'offline'
  },
  {
    id: '4',
    name: 'Elena Torres',
    avatar: 'ET',
    lastMessage: 'URGENTE: Necesito',
    tag: 'VIP',
    tagCount: 2,
    status: 'urgent'
  },
  {
    id: '5',
    name: 'Ana Martín',
    avatar: 'AM',
    lastMessage: 'Entendido, Ana. I',
    tag: 'Cancellat',
    tagCount: 0,
    status: 'offline'
  }
];

export const ConversationList: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Q Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
            All
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            New
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Asig
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Urg
          </button>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              conversation.isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {conversation.avatar}
                </div>
                {/* Indicador de estado */}
                <div className={`w-3 h-3 rounded-full border-2 border-white mt-1 ml-6 ${
                  conversation.status === 'online' ? 'bg-green-500' :
                  conversation.status === 'urgent' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {conversation.status === 'online' ? 'en línea' : ''}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-2">
                  {conversation.lastMessage}
                </p>
                
                {/* Tag */}
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {conversation.tag}
                  </span>
                  {conversation.tagCount > 0 && (
                    <span className="text-xs bg-blue-500 text-white px-1 rounded">
                      +{conversation.tagCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 