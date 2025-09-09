import React, { useState } from 'react';
import { InternalChatSidebar } from './components/InternalChatSidebar';
import { InternalChatHeader } from './components/InternalChatHeader';
import { InternalChatMessages } from './components/InternalChatMessages';
import { InternalChatComposer } from './components/InternalChatComposer';
import { InternalChatRightPanel } from './components/InternalChatRightPanel';
import { InternalChatProvider } from './context/InternalChatContext';
import { CopilotPanel } from '../../components/layout/CopilotPanel';
import './styles/internal-chat.css';

const InternalChatModule: React.FC = () => {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  return (
    <InternalChatProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar izquierdo */}
        <InternalChatSidebar />
        
        {/* Área principal del chat */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header del canal */}
          <InternalChatHeader 
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            rightPanelOpen={rightPanelOpen}
            onOpenCopilot={() => setLeftPanelOpen(true)}
          />
          
          {/* Área de mensajes */}
          <div className="flex-1 flex min-h-0">
            {/* Panel izquierdo del Copiloto */}
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
              <InternalChatMessages />
              <InternalChatComposer />
            </div>
            
            {/* Panel derecho */}
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
