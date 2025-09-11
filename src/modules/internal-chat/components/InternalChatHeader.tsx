import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Settings, 
  Bot, 
  ChevronDown,
  Info,
  Users,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { useInternalChat } from '../context/InternalChatContext';
import ChannelSettingsModal from './ChannelSettingsModal';
import { MobileMenuButton } from '../../../components/layout/MobileMenuButton';

interface InternalChatHeaderProps {
  onToggleRightPanel: () => void;
  rightPanelOpen: boolean;
  onOpenCopilot: () => void;
  onToggleSidebar: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const InternalChatHeader: React.FC<InternalChatHeaderProps> = ({
  onToggleRightPanel,
  rightPanelOpen,
  onOpenCopilot,
  onToggleSidebar,
  showBackButton = false,
  onBackClick,
}) => {
  const { state } = useInternalChat();
  const activeChannel = state.activeChannel;
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  console.log('Header: showBackButton:', showBackButton);
  console.log('Header: onBackClick:', !!onBackClick);

  // Si no hay canal activo y no estamos en modo móvil con showBackButton, mostrar estado vacío
  if (!activeChannel && !showBackButton) {
    return (
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
        {/* Header móvil */}
        <div className="lg:hidden flex items-center space-x-3">
          <MobileMenuButton />
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Chat Interno</h1>
              <p className="text-sm text-gray-600">Selecciona un canal</p>
            </div>
          </div>
        </div>
        
        {/* Header desktop */}
        <div className="hidden lg:flex items-center justify-center w-full">
          <p className="text-gray-500 text-sm">Selecciona un canal para comenzar</p>
        </div>
      </div>
    );
  }

  // Miembros del canal (simulados)
  const channelMembers = [
    { id: '1', name: 'Carlos D.', avatar: undefined, isOnline: true },
    { id: '2', name: 'Beatriz E.', avatar: undefined, isOnline: true },
    { id: '3', name: 'David F.', avatar: undefined, isOnline: false },
    { id: '4', name: 'Ana C.', avatar: undefined, isOnline: true },
  ];

  return (
    <div className="h-16 internal-chat-header flex items-center justify-between px-4 lg:px-6">
      {/* Header móvil */}
      <div className="lg:hidden flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <button
              onClick={onBackClick}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <MobileMenuButton />
          )}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {activeChannel ? `#${activeChannel.name}` : 'Chat Interno'}
              </h1>
              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                {activeChannel ? activeChannel.description : 'Canal seleccionado'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Ajustes del canal"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenCopilot}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Copiloto IA"
          >
            <Bot className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleRightPanel}
            className={`p-2 rounded-lg transition-all duration-200 ${
              rightPanelOpen
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Canvas"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header desktop */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Información del canal */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <span>{activeChannel ? activeChannel.name : 'Chat Interno'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </h1>
              <p className="text-sm text-gray-500">
                {activeChannel ? activeChannel.description : 'Canal seleccionado'}
              </p>
            </div>
          </div>

          {/* Información de miembros */}
          <div className="flex items-center space-x-2 text-gray-500">
            <Info className="h-4 w-4" />
            <div className="flex -space-x-2">
              {channelMembers.slice(0, 4).map((member, index) => (
                <div
                  key={member.id}
                  className="relative"
                  title={member.name}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs font-medium">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
              ))}
              {channelMembers.length > 4 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-gray-600 text-xs font-medium">
                    +{channelMembers.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones globales */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button 
            onClick={onOpenCopilot}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bot className="h-5 w-5" />
          </button>
          
          <button
            onClick={onToggleRightPanel}
            className={`p-2 rounded-lg transition-colors ${
              rightPanelOpen
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Canvas"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modal de configuración */}
      {activeChannel && (
        <ChannelSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          channel={{
            id: activeChannel.id,
            name: activeChannel.name,
            description: activeChannel.description,
            isPrivate: true,
            autoForwarding: true
          }}
        />
      )}
    </div>
  );
};
