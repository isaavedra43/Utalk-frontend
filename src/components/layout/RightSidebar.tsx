import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { infoLog } from '../../config/logger';
import { DetailsPanel } from './DetailsPanel';
import { CopilotPanel } from './CopilotPanel';
import { useChatStore } from '../../stores/useChatStore';
import { useClientProfileStore } from '../../stores/useClientProfileStore';
import type { ClientProfile } from '../../services/clientProfile';
import { User, Bot, MessageSquare } from 'lucide-react';
import '../../styles/details-copilot-optimized.css';

type ConvMeta = { status?: string; priority?: string; unreadMessages?: number; assignedTo?: string };
type ContactMeta = { createdAt?: string; updatedAt?: string; totalMessages?: number };

const getSafe = <T extends object>(val: unknown, fallback: T): T => (typeof val === 'object' && val !== null ? (val as T) : fallback);

// Componente separado para el CopilotPanel para evitar re-renderizaciones
const CopilotPanelWrapper: React.FC = React.memo(() => {
  return <CopilotPanel />;
});

// Componente separado para el DetailsPanel para evitar re-renderizaciones
const DetailsPanelWrapper: React.FC<{
  clientProfile: any;
  conversationDetails: any;
  notificationSettings: any;
  onUpdateNotificationSettings: (updates: any) => void;
  isLoading: boolean;
}> = React.memo(({ clientProfile, conversationDetails, notificationSettings, onUpdateNotificationSettings, isLoading }) => {
  return (
    <DetailsPanel
      clientProfile={clientProfile}
      conversationDetails={conversationDetails}
      notificationSettings={notificationSettings}
      onUpdateNotificationSettings={onUpdateNotificationSettings}
      isLoading={isLoading}
    />
  );
});

// Memoizar el componente principal para evitar re-renders innecesarios
const RightSidebarInner: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('copilot');
  
  // Usar refs para evitar re-renderizaciones
  const activeConversationRef = useRef<any>(null);
  const selectedConversationIdRef = useRef<string | null>(null);
  
  const activeConversation = useChatStore((s) => s.activeConversation);
  const selectedConversationId = activeConversation?.id || null;
  
  // Memoizar la actualización de refs para evitar re-renders
  useEffect(() => {
    activeConversationRef.current = activeConversation;
    selectedConversationIdRef.current = selectedConversationId;
  }, [activeConversation, selectedConversationId]);

  // Usar el store global para perfiles de cliente
  const { getProfile } = useClientProfileStore();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoadingClientProfile, setIsLoadingClientProfile] = useState(false);

  // NUEVO: Estado real para configuraciones de notificación
  const [notificationSettings, setNotificationSettings] = useState({
    conversationNotifications: true,
    reports: true,
    autoFollowUp: false,
    emailNotifications: true,
    pushNotifications: true
  });

  // Memoizar loadClientProfile para evitar recreaciones
  const loadClientProfile = useCallback(async (conversationId: string) => {
    if (isLoadingClientProfile) {
      if (import.meta.env.DEV) {
        infoLog('🔄 [DEBUG] Ya cargando perfil, saltando...');
      }
      return;
    }

    setIsLoadingClientProfile(true);
    
    try {
      if (import.meta.env.DEV) {
        infoLog('📞 [DEBUG] Llamando a getProfile...');
      }
      const profile = await getProfile(conversationId);
      
      if (import.meta.env.DEV) {
        infoLog('📊 [DEBUG] Resultado de getProfile:', {
          conversationId,
          hasProfile: !!profile,
          profileName: profile?.name,
          profilePhone: profile?.phone,
          profileChannel: profile?.channel
        });
      }
      
      if (profile) {
        if (import.meta.env.DEV) {
          infoLog('✅ [DEBUG] Perfil obtenido, actualizando estado...');
        }
        setClientProfile(profile);
      } else {
        if (import.meta.env.DEV) {
          infoLog('❌ [DEBUG] No se pudo obtener el perfil del cliente');
        }
        setClientProfile(null);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        infoLog('❌ [DEBUG] Error cargando perfil del cliente:', {
          conversationId,
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorObject: error
        });
      }
      setClientProfile(null);
    } finally {
      if (import.meta.env.DEV) {
        infoLog('🏁 [DEBUG] Finalizando carga...');
      }
      setIsLoadingClientProfile(false);
    }
  }, [getProfile, isLoadingClientProfile]);

  // Cargar información del cliente cuando cambie la conversación - optimizado
  useEffect(() => {
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] useEffect RightSidebar - selectedConversationId cambió:', { selectedConversationId });
    }
    
    if (selectedConversationId) {
      if (import.meta.env.DEV) {
        infoLog('📞 [DEBUG] Llamando a loadClientProfile...');
      }
      loadClientProfile(selectedConversationId);
    } else {
      if (import.meta.env.DEV) {
        infoLog('🧹 [DEBUG] No hay conversación seleccionada, limpiando perfil...');
      }
      setClientProfile(null);
    }
  }, [selectedConversationId, loadClientProfile]);

  // Configuración de notificaciones (mock por ahora) - memoizada
  const updateNotificationSettings = useCallback((updates: Partial<typeof notificationSettings>) => {
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] Actualizando configuración de notificaciones:', updates);
    }
    setNotificationSettings(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Memoizar handlers de tabs para evitar recreaciones
  const handleDetailsTab = useCallback(() => setActiveTab('details'), []);
  const handleCopilotTab = useCallback(() => setActiveTab('copilot'), []);

  // Memoizar datos del cliente para evitar recreaciones
  const clientProfileData = useMemo(() => {
    if (!clientProfile || !selectedConversationId) return null;
    
    const convDetails = getSafe<ConvMeta>((clientProfile as unknown as { conversation?: ConvMeta })?.conversation, {});
    const contactDetails = getSafe<ContactMeta>((clientProfile as unknown as { contactDetails?: ContactMeta })?.contactDetails, {});
    
    return {
      clientProfile: {
        id: selectedConversationId,
        name: clientProfile.name,
        phone: clientProfile.phone,
        channel: clientProfile.channel as 'whatsapp' | 'telegram' | 'email' | 'phone',
        status: clientProfile.status as 'active' | 'inactive' | 'blocked',
        lastContact: clientProfile.lastContact,
        clientSince: clientProfile.clientSince,
        whatsappId: clientProfile.whatsappId,
        tags: clientProfile.tags || []
      },
      conversationDetails: {
        id: selectedConversationId,
        status: (convDetails.status as 'open' | 'closed' | 'pending' | 'resolved') || 'open',
        priority: (convDetails.priority as 'low' | 'medium' | 'high' | 'urgent') || 'low',
        unreadCount: convDetails.unreadMessages ?? 0,
        assignedToName: convDetails.assignedTo,
        createdAt: contactDetails.createdAt || '',
        updatedAt: contactDetails.updatedAt || '',
        lastMessageAt: clientProfile.lastContact || '',
        messageCount: contactDetails.totalMessages || 0,
        participants: [],
        tags: clientProfile.tags || []
      }
    };
  }, [clientProfile, selectedConversationId]);

  // Si no hay conversación seleccionada
  if (!selectedConversationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-2">INFO/IA</h2>
          <div className="flex space-x-1">
            <button
              onClick={handleDetailsTab}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
                activeTab === 'details'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Details</span>
            </button>
            <button
              onClick={handleCopilotTab}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
                activeTab === 'copilot'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>Copilot</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium mb-1">Selecciona una conversación</p>
            <p className="text-xs">para ver los detalles del cliente y el copiloto</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-2">INFO/IA</h2>
        <div className="flex space-x-1">
          <button
            onClick={handleDetailsTab}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'details'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Details</span>
          </button>
          <button
            onClick={handleCopilotTab}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 ${
              activeTab === 'copilot'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>Copilot</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'details' ? (
          clientProfileData ? (
            <DetailsPanelWrapper
              clientProfile={clientProfileData.clientProfile}
              conversationDetails={clientProfileData.conversationDetails}
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
          <CopilotPanelWrapper />
        )}
      </div>
    </div>
  );
});

export const RightSidebar = RightSidebarInner; 