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
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detalles</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>Selecciona una conversación</p>
            <p className="text-sm">para ver los detalles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'copilot'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
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