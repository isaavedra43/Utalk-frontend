import React, { useEffect, useState } from 'react';
import { MoreVertical, Phone, User } from 'lucide-react';
import type { Conversation } from '../../types';
import { useClientProfileStore } from '../../stores/useClientProfileStore';
import type { ClientProfile } from '../../services/clientProfile';
import { useChatStore } from '../../stores/useChatStore';
import { chatHeaderLogger } from '../../config/logging';

interface ChatHeaderProps {
  conversation: Conversation | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  // Cargar perfil completo del cliente (nombre/teléfono) como en Detalle de Cliente
  const getProfile = useClientProfileStore((s) => s.getProfile);
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  // También tomar el id de la conversación activa del store (más estable)
  const activeConversation = useChatStore((s) => s.activeConversation);
  const profileConversationId = conversation?.id || activeConversation?.id || null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (profileConversationId) {
        const p = await getProfile(profileConversationId);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profileConversationId, getProfile]);

  // MEJORADO: Usar sistema de logging configurable
  if (conversation && (conversation.customerName || conversation.customerPhone || conversation.contact)) {
    chatHeaderLogger.info('Información de conversación cargada', {
      customerName: conversation.customerName,
      customerPhone: conversation.customerPhone,
      hasContact: !!conversation.contact,
      profileLoaded: !!profile
    });
  }

  if (!conversation && !activeConversation) {
    return (
      <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Selecciona una conversación</h3>
              <p className="text-xs sm:text-sm text-gray-500">Para comenzar a chatear</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prioridad: perfil -> contacto -> customerName -> teléfono
  const displayName =
    profile?.name ||
    conversation?.contact?.name ||
    conversation?.contact?.name ||
    conversation?.customerName ||
    profile?.phone ||
    conversation?.customerPhone ||
    activeConversation?.customerName ||
    activeConversation?.customerPhone ||
    'Usuario';

  const displayPhone =
    profile?.phone ||
    conversation?.contact?.phoneNumber ||
    conversation?.customerPhone ||
    activeConversation?.contact?.phoneNumber ||
    activeConversation?.customerPhone ||
    'Sin teléfono';

  const avatarInitial = (displayName || displayPhone || 'U').charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs sm:text-sm">
              {avatarInitial}
            </span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-500 truncate">
                {displayPhone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Prioridad */}
          {conversation?.priority && (
            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
              conversation.priority === 'urgent' 
                ? 'bg-red-100 text-red-800'
                : conversation.priority === 'high'
                ? 'bg-orange-100 text-orange-800'
                : conversation.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {conversation.priority === 'urgent' ? 'Urgente' :
               conversation.priority === 'high' ? 'Alta' :
               conversation.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          )}

          {/* Acciones */}
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {conversation?.tags && conversation.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {conversation.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}; 