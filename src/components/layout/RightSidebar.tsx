import React, { useState } from 'react';
import { DetailsPanel } from './DetailsPanel';
import { CopilotPanel } from './CopilotPanel';
import { useSidebar } from '../../hooks/useSidebar';
import { useAppStore } from '../../stores/useAppStore';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('details');
  const { activeConversation } = useAppStore();
  const selectedConversationId = activeConversation?.id || null;
  
  const {
    clientProfile,
    conversationDetails,
    notificationSettings,
    aiSuggestions,
    copilotState,
    updateNotificationSettings,
    setCopilotTab,
    copySuggestion,
    improveSuggestion,
    generateAISuggestion,
    isLoadingClientProfile,
    isLoadingConversationDetails,
    isLoadingNotificationSettings,
    isLoadingAISuggestions
  } = useSidebar(selectedConversationId);

  // Si no hay conversación seleccionada
  if (!selectedConversationId) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
            <p className="text-gray-500 text-sm">Elige una conversación para ver los detalles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'copilot'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Copilot
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          clientProfile && conversationDetails && notificationSettings ? (
            <DetailsPanel
              clientProfile={clientProfile}
              conversationDetails={conversationDetails}
              notificationSettings={notificationSettings}
              onUpdateNotificationSettings={updateNotificationSettings}
              isLoading={isLoadingClientProfile || isLoadingConversationDetails || isLoadingNotificationSettings}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              Cargando detalles...
            </div>
          )
        ) : (
          <CopilotPanel
            copilotState={{
              isMockMode: true,
              activeTab: copilotState.tab,
              suggestions: aiSuggestions,
              chatHistory: [],
              isLoading: copilotState.isGenerating
            }}
            aiSuggestions={aiSuggestions}
            onSetCopilotTab={setCopilotTab}
            onCopySuggestion={(suggestion) => copySuggestion(suggestion.id)}
            onImproveSuggestion={improveSuggestion}
            onGenerateSuggestion={generateAISuggestion}
            isLoading={isLoadingAISuggestions}
          />
        )}
      </div>
    </div>
  );
}; 