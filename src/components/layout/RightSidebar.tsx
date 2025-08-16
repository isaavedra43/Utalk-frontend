import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DetailsPanel } from './DetailsPanel';
import { CopilotPanel } from './CopilotPanel';
import { useAppStore } from '../../stores/useAppStore';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('copilot');
  const { activeConversation, calculateUnreadCount } = useAppStore();
  const selectedConversationId = activeConversation?.id || null;

  // Datos reales basados en la conversación activa
  const clientProfile = activeConversation ? {
    id: activeConversation.id,
    name: activeConversation.customerName || 'Cliente',
    phone: activeConversation.customerPhone,
    channel: 'whatsapp' as const,
    lastContact: (() => {
      if (!activeConversation.lastMessageAt) return 'hace un momento';
      try {
        const date = new Date(activeConversation.lastMessageAt);
        if (isNaN(date.getTime())) return 'hace un momento';
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      } catch {
        return 'hace un momento';
      }
    })(),
    clientSince: (() => {
      try {
        const date = new Date(activeConversation.createdAt);
        if (isNaN(date.getTime())) return '2024';
        return date.getFullYear().toString();
      } catch {
        return '2024';
      }
    })(),
    whatsappId: activeConversation.customerPhone.replace('+', ''),
    tags: activeConversation.tags || ['Cliente'],
    status: 'active' as const
  } : null;

  const conversationDetails = activeConversation ? {
    id: activeConversation.id,
    status: activeConversation.status,
    priority: activeConversation.priority || 'medium',
    unreadCount: calculateUnreadCount(activeConversation.id),
    assignedToName: activeConversation.assignedToName || 'Tú',
    createdAt: activeConversation.createdAt,
    updatedAt: activeConversation.updatedAt,
    lastMessageAt: activeConversation.lastMessageAt,
    messageCount: activeConversation.messageCount || 0,
    participants: activeConversation.participants || [],
    tags: activeConversation.tags || []
  } : null;

  const notificationSettings = {
    conversationNotifications: true,
    reports: true,
    autoFollowUp: false,
    emailNotifications: true,
    pushNotifications: true
  };

  const aiSuggestions = [
    {
      id: '1',
      title: 'Respuesta profesional',
      content: 'Gracias por contactarnos. ¿En qué puedo ayudarte hoy?',
      confidence: 'high',
      tags: ['profesional', 'cordial'],
      actions: { copy: true, improve: true }
    },
    {
      id: '2',
      title: 'Solución rápida',
      content: 'Entiendo tu consulta. Te ayudo a resolverlo de inmediato.',
      confidence: 'medium',
      tags: ['rápido', 'solución'],
      actions: { copy: true, improve: true }
    }
  ];

  const [copilotTab, setCopilotTabState] = useState<'suggestions' | 'chat'>('suggestions');
  
  const copilotState = {
    isMockMode: true,
    activeTab: copilotTab,
    suggestions: aiSuggestions,
    chatHistory: [],
    isLoading: false
  };

  const updateNotificationSettings = () => {
    console.log('Actualizando configuración de notificaciones');
  };
  
  const setCopilotTab = (tab: 'suggestions' | 'chat') => {
    console.log('Cambiando tab del copilot a:', tab);
    setCopilotTabState(tab);
  };
  
  const copySuggestion = (suggestionId: string) => {
    console.log('Copiando sugerencia:', suggestionId);
    // Aquí se implementaría la lógica para copiar al portapapeles
  };
  
  const improveSuggestion = (suggestionId: string) => {
    console.log('Mejorando sugerencia:', suggestionId);
    // Aquí se implementaría la lógica para mejorar la sugerencia
  };
  
  const generateAISuggestion = (context?: string) => {
    console.log('Generando sugerencia IA con contexto:', context);
    // Aquí se implementaría la lógica para generar sugerencias
  };

  const isLoadingClientProfile = false;
  const isLoadingConversationDetails = false;
  const isLoadingNotificationSettings = false;
  const isLoadingAISuggestions = false;

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
              {activeConversation ? 'Cargando detalles...' : 'Selecciona una conversación para ver los detalles'}
            </div>
          )
        ) : (
          <CopilotPanel
            copilotState={copilotState}
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