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
    <div className="mobile-chat-composer">
      {/* Panel de plantillas */}
      {showActions && (
        <div className="templates-panel">
          <div className="templates-header">
            <h3>Plantillas de Solicitud</h3>
            <button
              onClick={() => setShowActions(false)}
              className="close-button"
            >
              ×
            </button>
          </div>
          
          <div className="templates-grid">
            {requestTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="template-item"
                >
                  <IconComponent className={`h-4 w-4 ${template.color}`} />
                  <span>{template.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="action-buttons">
        <button 
          className="action-btn"
          onClick={() => setShowActions(true)}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button className="action-btn">
          <Image className="h-4 w-4" />
        </button>
        <button className="action-btn">
          <AtSign className="h-4 w-4" />
        </button>
        <button className="action-btn">
          <Smile className="h-4 w-4" />
        </button>
      </div>

      {/* Textbox principal */}
      <div className="textbox-container">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="message-textbox"
          rows={1}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="send-button"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador de canal */}
      <div className="channel-indicator">
        Enviando a #{activeChannel.name}
      </div>
    </div>
  );
};

