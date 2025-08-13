import React from 'react';
import { Phone, Video, UserPlus, Bookmark, MoreVertical, Paperclip, Smile, FileText, Send } from 'lucide-react';

// Datos mock basados en las imágenes
const mockMessages = [
  {
    id: '1',
    sender: 'María González',
    avatar: 'MG',
    content: 'Hola, necesito ayuda con mi pedido #12345. ¿Podrían revisar el estado?',
    timestamp: 'hace más de 1 año',
    direction: 'incoming',
    isRead: true
  },
  {
    id: '2',
    sender: 'Agente',
    avatar: 'AG',
    content: '',
    timestamp: 'hace más de 1 año',
    direction: 'outgoing',
    isRead: true
  },
  {
    id: '3',
    sender: 'María González',
    avatar: 'MG',
    content: '¡Perfecto! Muchas gracias por la información. ¿Podrían cambiar la dirección de entrega?',
    timestamp: 'hace más de 1 año',
    direction: 'incoming',
    isRead: true
  }
];

export const ChatArea: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
              MG
            </div>
            
            {/* Información del contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">María González</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">en línea</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">VIP</span>
              </div>
            </div>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bookmark className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {/* Separador de fecha */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
            lunes, 15 de enero de 2024
          </div>
        </div>

        {/* Mensajes */}
        <div className="space-y-4">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.direction === 'incoming' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                  {message.avatar}
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md ${
                message.direction === 'outgoing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              } rounded-lg p-3 shadow-sm`}>
                {message.content && (
                  <p className="text-sm">{message.content}</p>
                )}
                <div className={`flex items-center justify-between mt-2 ${
                  message.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {message.direction === 'outgoing' && message.isRead && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* Tags de contexto */}
        <div className="flex gap-2 mb-3">
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Proposal
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Updated Doc
          </button>
        </div>

        {/* Input de mensaje */}
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2 flex-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Smile className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 