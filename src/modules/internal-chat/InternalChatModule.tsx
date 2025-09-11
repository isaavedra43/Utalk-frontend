import React, { useState } from 'react';
import { InternalChatSidebar } from './components/InternalChatSidebar';
import { MobileChannelList } from './components/MobileChannelList';
import { InternalChatHeader } from './components/InternalChatHeader';
import { InternalChatMessages } from './components/InternalChatMessages';
import { InternalChatComposer } from './components/InternalChatComposer';
import { InternalChatRightPanel } from './components/InternalChatRightPanel';
import { InternalChatProvider } from './context/InternalChatContext';
import { CopilotPanel } from '../../components/layout/CopilotPanel';
import { MobileMenuButton } from '../../components/layout/MobileMenuButton';
import './styles/internal-chat.css';

const InternalChatModule: React.FC = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar cerrado por defecto en móvil
  const [showActions, setShowActions] = useState(false);
  const [showChannelDetail, setShowChannelDetail] = useState(false); // Para móvil: mostrar chat individual
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null); // Canal seleccionado en móvil

  // Funciones para manejar la navegación móvil
  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setShowChannelDetail(true);
  };

  const handleBackToList = () => {
    console.log('handleBackToList called');
    setShowChannelDetail(false);
    setSelectedChannel(null);
  };

  return (
    <InternalChatProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar izquierdo - Desktop */}
        <div className="hidden lg:block">
        <InternalChatSidebar />
        </div>
        
        {/* Layout móvil */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0">
          {/* Vista de lista de canales - Móvil */}
          {!showChannelDetail && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header de la lista */}
              <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                  <MobileMenuButton />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">Chat Interno</h1>
                      <p className="text-sm text-gray-600">Selecciona un canal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lista de canales */}
              <div className="flex-1 overflow-y-auto">
                <MobileChannelList onChannelSelect={handleChannelSelect} />
              </div>
            </div>
          )}
          
          {/* Vista de chat individual - Móvil */}
          {showChannelDetail && selectedChannel && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header del chat individual */}
              <InternalChatHeader 
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
                rightPanelOpen={rightPanelOpen}
                onOpenCopilot={() => setLeftPanelOpen(true)}
                onToggleSidebar={handleBackToList}
                showBackButton={true}
                onBackClick={handleBackToList}
              />
              
              {/* Área de mensajes */}
              <div className="flex-1 flex flex-col min-h-0">
                <InternalChatMessages forceShowChat={true} />
                <InternalChatComposer />
              </div>
              
              {/* Panel izquierdo del Copiloto - Móvil */}
              {leftPanelOpen && (
                <div className="fixed inset-0 z-50">
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setLeftPanelOpen(false)}
                  />
                  <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Copiloto IA</h2>
                      <button
                        onClick={() => setLeftPanelOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <CopilotPanel />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Panel derecho - Móvil */}
              {rightPanelOpen && (
                <div className="fixed inset-0 z-50">
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setRightPanelOpen(false)}
                  />
                  <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                    <InternalChatRightPanel 
                      onClose={() => setRightPanelOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Layout desktop */}
        <div className="hidden lg:flex flex-1 flex flex-col min-h-0">
          {/* Header del canal */}
          <InternalChatHeader 
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            rightPanelOpen={rightPanelOpen}
            onOpenCopilot={() => setLeftPanelOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          
          {/* Área de mensajes desktop */}
          <div className="flex-1 flex min-h-0">
            {/* Panel izquierdo del Copiloto - Desktop */}
            {leftPanelOpen && (
              <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Copiloto IA</h2>
                  <button
                    onClick={() => setLeftPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <CopilotPanel />
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0">
              <InternalChatMessages forceShowChat={false} />
              <InternalChatComposer />
            </div>
            
            {/* Panel derecho - Desktop */}
            {rightPanelOpen && (
              <InternalChatRightPanel 
                onClose={() => setRightPanelOpen(false)}
              />
            )}
          </div>
        </div>

      </div>
    </InternalChatProvider>
  );
};

export default InternalChatModule;
