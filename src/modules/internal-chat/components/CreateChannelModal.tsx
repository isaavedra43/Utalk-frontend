import React, { useState } from 'react';
import { X, ChevronDown, MessageSquare, Users, Lock, Globe, Building2, CreditCard, Truck, FileText, Scale, Settings, Zap, Shield, Heart } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (channelData: ChannelData) => void;
}

interface ChannelData {
  name: string;
  description: string;
  visibility: 'public' | 'private';
  icon: string;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedIcon, setSelectedIcon] = useState('MessageSquare');
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  if (!isOpen) return null;

  const icons = [
    { id: 'MessageSquare', name: 'MessageSquare', icon: MessageSquare, label: 'Mensaje' },
    { id: 'Users', name: 'Users', icon: Users, label: 'Usuarios' },
    { id: 'Building2', name: 'Building2', icon: Building2, label: 'Empresa' },
    { id: 'CreditCard', name: 'CreditCard', icon: CreditCard, label: 'Pagos' },
    { id: 'Truck', name: 'Truck', icon: Truck, label: 'Envíos' },
    { id: 'FileText', name: 'FileText', icon: FileText, label: 'Documentos' },
    { id: 'Scale', name: 'Scale', icon: Scale, label: 'Legal' },
    { id: 'Settings', name: 'Settings', icon: Settings, label: 'Configuración' },
    { id: 'Zap', name: 'Zap', icon: Zap, label: 'Energía' },
    { id: 'Shield', name: 'Shield', icon: Shield, label: 'Seguridad' },
    { id: 'Heart', name: 'Heart', icon: Heart, label: 'Salud' },
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Público', description: 'Cualquier miembro puede unirse', icon: Globe },
    { id: 'private', name: 'Privado', description: 'Solo miembros invitados', icon: Lock },
  ];

  const handleCreateChannel = () => {
    if (!name.trim()) return;

    const channelData: ChannelData = {
      name: name.trim(),
      description: description.trim(),
      visibility,
      icon: selectedIcon,
    };

    onCreateChannel(channelData);
    onClose();
    
    // Reset form
    setName('');
    setDescription('');
    setVisibility('public');
    setSelectedIcon('MessageSquare');
  };

  const getSelectedIconComponent = () => {
    const iconData = icons.find(icon => icon.id === selectedIcon);
    return iconData ? iconData.icon : MessageSquare;
  };

  const getSelectedVisibilityData = () => {
    return visibilityOptions.find(option => option.id === visibility) || visibilityOptions[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Canal</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configura los detalles de tu nuevo canal de comunicación.
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
        <div className="p-6 space-y-6">
          {/* Nombre del Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Canal
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Diseño de Producto"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este canal?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Visibilidad e Icono */}
          <div className="grid grid-cols-2 gap-4">
            {/* Visibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidad
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {React.createElement(getSelectedVisibilityData().icon, { className: "h-4 w-4 text-gray-500" })}
                    <span className="text-gray-900">{getSelectedVisibilityData().name}</span>
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </button>
                
                {showVisibilityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {visibilityOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => {
                          setVisibility(option.id as 'public' | 'private');
                          setShowVisibilityDropdown(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        {React.createElement(option.icon, { className: "h-4 w-4 text-gray-500" })}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{option.name}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowIconDropdown(!showIconDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {React.createElement(getSelectedIconComponent(), { className: "h-4 w-4 text-gray-500" })}
                    <span className="text-gray-900">{selectedIcon}</span>
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </button>
                
                {showIconDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {icons.map((iconData) => (
                      <div
                        key={iconData.id}
                        onClick={() => {
                          setSelectedIcon(iconData.id);
                          setShowIconDropdown(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        {React.createElement(iconData.icon, { className: "h-4 w-4 text-gray-500" })}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{iconData.name}</div>
                          <div className="text-xs text-gray-500">{iconData.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            onClick={handleCreateChannel}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Crear Canal
          </button>
        </div>
      </div>
    </div>
  );
};
