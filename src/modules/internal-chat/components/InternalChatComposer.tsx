import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Image, 
  AtSign, 
  Smile, 
  Send,
  Sparkles,
  FileText,
  CreditCard,
  Truck,
  Users,
  Package,
  ShoppingCart,
  Megaphone,
  Factory,
  Wrench,
  Scale
} from 'lucide-react';
import { useInternalChat } from '../context/InternalChatContext';

export const InternalChatComposer: React.FC = () => {
  const { state, actions } = useInternalChat();
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = state.activeChannel;

  // Plantillas de solicitud disponibles
  const requestTemplates = [
    { id: 'pago', name: 'Solicitar Aprobación de Pago', icon: CreditCard, color: 'text-green-600' },
    { id: 'gasto', name: 'Registrar Gasto', icon: FileText, color: 'text-red-600' },
    { id: 'envio', name: 'Solicitar Envío', icon: Truck, color: 'text-blue-600' },
    { id: 'factura', name: 'Procesar Factura', icon: FileText, color: 'text-purple-600' },
    { id: 'rh', name: 'Solicitud RH', icon: Users, color: 'text-orange-600' },
    { id: 'legal', name: 'Consulta Legal', icon: Scale, color: 'text-gray-600' },
    { id: 'proveedor', name: 'Gestión Proveedor', icon: Package, color: 'text-indigo-600' },
    { id: 'pedido', name: 'Nuevo Pedido', icon: ShoppingCart, color: 'text-pink-600' },
    { id: 'marketing', name: 'Campaña Marketing', icon: Megaphone, color: 'text-yellow-600' },
    { id: 'manufactura', name: 'Orden Manufactura', icon: Factory, color: 'text-teal-600' },
    { id: 'mantenimiento', name: 'Solicitud Mantenimiento', icon: Wrench, color: 'text-amber-600' },
  ];

  const handleSendMessage = () => {
    if (!message.trim() || !activeChannel) return;

    actions.sendMessage(activeChannel.id, message.trim());
    setMessage('');
    
    // Resetear altura del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleTemplateSelect = (templateId: string) => {
    // Aquí se abriría el modal de solicitud correspondiente
    console.log('Seleccionar plantilla:', templateId);
    setShowActions(false);
  };

  const handleCopilotClick = () => {
    // Aquí se abriría el panel del copiloto IA
    console.log('Abrir copiloto IA');
  };

  if (!activeChannel) {
    return null;
  }

  return (
    <div className="internal-chat-composer p-4">
      <div className="max-w-4xl mx-auto">
        {/* Botón de acciones expandibles */}
        {!showActions && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowActions(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Acciones</span>
            </button>
          </div>
        )}

        {/* Panel de acciones */}
        {showActions && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Plantillas de Solicitud</h3>
              <button
                onClick={() => setShowActions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {requestTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="flex items-center space-x-2 p-3 text-left bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <IconComponent className={`h-4 w-4 ${template.color}`} />
                    <span className="text-sm text-gray-700">{template.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Composer principal */}
        <div className="flex items-end space-x-3">
          {/* Botones de acción izquierda */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Image className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <AtSign className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="h-5 w-5" />
            </button>
          </div>

          {/* Área de texto */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              rows={1}
            />
          </div>

          {/* Botones de acción derecha */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopilotClick}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copiloto IA"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Indicador de canal activo */}
        <div className="mt-2 text-xs text-gray-500">
          Enviando a #{activeChannel.name}
        </div>
      </div>
    </div>
  );
};
