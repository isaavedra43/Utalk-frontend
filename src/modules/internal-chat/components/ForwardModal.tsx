import React, { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { ApprovalCard as ApprovalCardType } from '../../../types/internal-chat';

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ApprovalCardType;
  onForward: (forwardData: ForwardData) => void;
}

interface ForwardData {
  destinationChannels: string[];
  contentToInclude: {
    originalMessage: boolean;
    attachments: boolean;
    clientName: boolean;
    amount: boolean;
    paymentMethod: boolean;
    approvalInfo: boolean;
  };
  customMessage: string;
  useDefaultRule: boolean;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  isOpen,
  onClose,
  card,
  onForward,
}) => {
  const [destinationChannels, setDestinationChannels] = useState<string[]>([]);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [useDefaultRule, setUseDefaultRule] = useState(false);
  const [contentToInclude, setContentToInclude] = useState({
    originalMessage: true,
    attachments: true,
    clientName: true,
    amount: true,
    paymentMethod: true,
    approvalInfo: false,
  });
  const [customMessage, setCustomMessage] = useState('');

  // Canales disponibles para reenvío
  const availableChannels = [
    { id: 'pedidos', name: 'Pedidos', description: 'Gestión de pedidos y envíos' },
    { id: 'facturas', name: 'Facturas', description: 'Procesamiento de facturas' },
    { id: 'rh', name: 'Recursos Humanos', description: 'Gestión de personal' },
    { id: 'tesoreria', name: 'Tesorería', description: 'Gestión financiera' },
    { id: 'compras', name: 'Compras', description: 'Gestión de compras' },
  ];

  if (!isOpen) return null;

  const handleChannelToggle = (channelId: string) => {
    setDestinationChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleContentToggle = (field: keyof typeof contentToInclude) => {
    setContentToInclude(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleForward = () => {
    const forwardData: ForwardData = {
      destinationChannels,
      contentToInclude,
      customMessage,
      useDefaultRule,
    };
    onForward(forwardData);
    onClose();
  };

  const getSelectedChannelsText = () => {
    if (destinationChannels.length === 0) {
      return 'Seleccionar canales...';
    }
    if (destinationChannels.length === 1) {
      const channel = availableChannels.find(c => c.id === destinationChannels[0]);
      return channel?.name || '';
    }
    return `${destinationChannels.length} canales seleccionados`;
  };

  const generatePreview = () => {
    const parts = [];
    
    if (contentToInclude.originalMessage) {
      parts.push(`Mensaje: ${card.subtitle}`);
    }
    if (contentToInclude.clientName) {
      parts.push(`Cliente: ${card.title}`);
    }
    if (contentToInclude.amount) {
      parts.push(`Monto: ${card.amount}`);
    }
    if (contentToInclude.paymentMethod) {
      parts.push('Método: Tarjeta de Crédito');
    }
    if (contentToInclude.attachments) {
      parts.push('Adjunto: Comprobante de pago');
    }
    if (contentToInclude.approvalInfo) {
      parts.push(`Estado: ${card.status === 'approved' ? 'Aprobado' : card.status === 'rejected' ? 'Rechazado' : 'Pendiente'}`);
    }

    return `De: ${card.senderName} en #Pagos\n\n${parts.join('\n')}${customMessage ? `\n\n${customMessage}` : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reenviar Información de Pago</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona los canales de destino y la información a incluir.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Canales de Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canales de Destino
            </label>
            <div className="relative">
              <button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <span className="text-gray-900">{getSelectedChannelsText()}</span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </button>
              
              {showChannelDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableChannels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => handleChannelToggle(channel.id)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                        <div className="text-xs text-gray-500">{channel.description}</div>
                      </div>
                      {destinationChannels.includes(channel.id) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contenido a Incluir */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Contenido a Incluir
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Usar regla por defecto</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDefaultRule}
                    onChange={(e) => setUseDefaultRule(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.originalMessage}
                    onChange={() => handleContentToggle('originalMessage')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Texto del mensaje original</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.clientName}
                    onChange={() => handleContentToggle('clientName')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Nombre del Cliente</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.paymentMethod}
                    onChange={() => handleContentToggle('paymentMethod')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Método de Pago</span>
                </label>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.attachments}
                    onChange={() => handleContentToggle('attachments')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Adjuntos (comprobante)</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.amount}
                    onChange={() => handleContentToggle('amount')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Monto y Moneda</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentToInclude.approvalInfo}
                    onChange={() => handleContentToggle('approvalInfo')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Información de Aprobación</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mensaje Personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Añadir un mensaje personalizado (opcional)...
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Escribe un mensaje adicional..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Vista Previa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {generatePreview()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleForward}
            disabled={destinationChannels.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Reenviar
          </button>
        </div>
      </div>
    </div>
  );
};
