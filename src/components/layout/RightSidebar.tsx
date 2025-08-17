import React, { useState, useEffect, useCallback } from 'react';
import { DetailsPanel } from './DetailsPanel';
import { CopilotPanel } from './CopilotPanel';
import { useAppStore } from '../../stores/useAppStore';
import { useClientProfileStore } from '../../stores/useClientProfileStore';
import type { ClientProfile } from '../../services/clientProfile';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('copilot');
  const { activeConversation } = useAppStore();
  const selectedConversationId = activeConversation?.id || null;

  // Usar el store global para perfiles de cliente
  const { getProfile } = useClientProfileStore();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoadingClientProfile, setIsLoadingClientProfile] = useState(false);

  const loadClientProfile = useCallback(async (conversationId: string) => {
    // Evitar cargar si ya está cargando
    if (isLoadingClientProfile) {
      return;
    }
    
    setIsLoadingClientProfile(true);
    try {
      const profile = await getProfile(conversationId);
      if (profile) {
        setClientProfile(profile);
      } else {
        console.log('No se pudo obtener el perfil del cliente');
        setClientProfile(null);
      }
    } catch (error) {
      console.error('Error cargando perfil del cliente:', error);
      setClientProfile(null);
    } finally {
      setIsLoadingClientProfile(false);
    }
  }, [isLoadingClientProfile, getProfile]);

  // Cargar información del cliente cuando cambie la conversación
  useEffect(() => {
    if (selectedConversationId) {
      loadClientProfile(selectedConversationId);
    } else {
      setClientProfile(null);
    }
  }, [selectedConversationId, loadClientProfile]);

  // Configuración de notificaciones (mock por ahora)
  const notificationSettings = {
    conversationNotifications: true,
    reports: true,
    autoFollowUp: false,
    emailNotifications: true,
    pushNotifications: true
  };

  const updateNotificationSettings = () => {
    console.log('Actualizando configuración de notificaciones');
  };

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
          clientProfile ? (
            <DetailsPanel
              clientProfile={{
                id: selectedConversationId,
                name: clientProfile.name,
                phone: clientProfile.phone,
                channel: clientProfile.channel as 'whatsapp' | 'telegram' | 'email' | 'phone',
                lastContact: clientProfile.lastContact,
                clientSince: clientProfile.clientSince,
                whatsappId: clientProfile.whatsappId,
                tags: clientProfile.tags,
                status: clientProfile.status as 'active' | 'inactive' | 'blocked'
              }}
              conversationDetails={{
                id: selectedConversationId,
                status: clientProfile.conversation.status as 'open' | 'closed' | 'pending' | 'resolved',
                priority: clientProfile.conversation.priority as 'low' | 'medium' | 'high' | 'urgent',
                unreadCount: clientProfile.conversation.unreadMessages,
                assignedToName: clientProfile.conversation.assignedTo,
                createdAt: clientProfile.contactDetails?.createdAt || '',
                updatedAt: clientProfile.contactDetails?.updatedAt || '',
                lastMessageAt: clientProfile.lastContact,
                messageCount: clientProfile.contactDetails?.totalMessages || 0,
                participants: [],
                tags: clientProfile.tags
              }}
              notificationSettings={notificationSettings}
              onUpdateNotificationSettings={updateNotificationSettings}
              isLoading={isLoadingClientProfile}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              {isLoadingClientProfile ? 'Cargando detalles...' : 'Error al cargar los detalles del cliente'}
            </div>
          )
        ) : (
          <CopilotPanel />
        )}
      </div>
    </div>
  );
}; 