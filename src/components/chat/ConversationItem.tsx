import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Conversation } from '../../types';
import { useChatStore } from '../../stores/useChatStore';
import { convertFirebaseTimestamp } from '../../utils/timestampUtils';
import { useClientProfileStore } from '../../stores/useClientProfileStore';



interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  isNewConversation?: boolean; // NUEVO: Prop para identificar conversaciones nuevas
}

export const ConversationItem: React.FC<ConversationItemProps> = React.memo(({
  conversation,
  isSelected,
  onClick,
  isNewConversation = false // NUEVO: Prop para animación de nueva conversación
}) => {
  // Cargar perfil (nombre/teléfono) como en Detalle de Cliente
  const getProfile = useClientProfileStore((s) => s.getProfile);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (conversation.id) {
        const p = await getProfile(conversation.id);
        if (mounted) {
          setProfileName(p?.name || null);
          setProfilePhone(p?.phone || null);
        }
      }
    })();
    return () => { mounted = false; };
  }, [conversation.id, getProfile]);

  // Estados para controlar animaciones
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNewConversationAnimating, setIsNewConversationAnimating] = useState(isNewConversation); // NUEVO: Estado para animación de nueva conversación
  const { calculateUnreadCount, markConversationAsRead } = useChatStore();
  
  // Calcular unreadCount dinámicamente
  const unreadCount = calculateUnreadCount(conversation.id);
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

  // Marcar conversación como leída cuando se selecciona
  useEffect(() => {
    if (isSelected && unreadCount > 0) {
      markConversationAsRead(conversation.id);
    }
  }, [isSelected, unreadCount, conversation.id, markConversationAsRead]);

  // NUEVO: Animación para nueva conversación
  useEffect(() => {
    if (isNewConversation) {
      setIsNewConversationAnimating(true);
      
      // Animación de entrada con delay
      const enterTimeout = setTimeout(() => {
        setIsNewConversationAnimating(false);
      }, 2000); // 2 segundos de animación
      
      return () => clearTimeout(enterTimeout);
    }
  }, [isNewConversation]);

  // FASE 1: Optimización - Detectar cuando llega un nuevo mensaje con memoización
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setIsNewMessage(true);
      setIsHighlighted(true);
      
      // Resetear animaciones después de un tiempo
      const timeoutId = setTimeout(() => {
        setIsNewMessage(false);
        setIsHighlighted(false);
      }, 3000);
      
      // Cleanup para evitar memory leaks
      return () => clearTimeout(timeoutId);
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount]);

  // Animación al seleccionar/deseleccionar
  useEffect(() => {
    setIsAnimating(true);
    const timeoutId = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [isSelected]);

  // FASE 3: Optimización - Memoizar funciones para evitar recreaciones
  const formatLastMessageTime = useCallback((timestamp: string | { _seconds: number; _nanoseconds: number } | undefined) => {
    if (!timestamp) {
      return '12:00 AM';
    }
    
    try {
      // Convertir timestamp de Firebase si es necesario
      const convertedTimestamp = convertFirebaseTimestamp(timestamp);
      if (!convertedTimestamp) {
        console.warn('⚠️ Fecha inválida en ConversationItem:', timestamp);
        return '12:00 AM';
      }
      
      const date = new Date(convertedTimestamp);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida en ConversationItem después de conversión:', convertedTimestamp);
        return '12:00 AM';
      }
      
      // Formato corto de hora: "12:00 AM" o "3:30 PM"
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.warn('⚠️ Error al formatear fecha en ConversationItem:', error, 'timestamp:', timestamp);
      return '12:00 AM';
    }
  }, []);

  // FASE 3: Optimización - Memoizar función de iniciales
  const getInitials = useCallback((name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // FASE 3: Optimización - Memoizar valores calculados
  const formattedTime = useMemo(() => 
    formatLastMessageTime(conversation.lastMessageAt), 
    [formatLastMessageTime, conversation.lastMessageAt]
  );

  const customerInitials = useMemo(() => {
    const customerName = profileName ||
                        conversation.contact?.profileName || 
                        conversation.contact?.name || 
                        conversation.customerName ||
                        profilePhone ||
                        conversation.customerPhone;
    return getInitials(customerName);
  }, [getInitials, profileName, profilePhone, conversation.contact?.profileName, conversation.contact?.name, conversation.customerName, conversation.customerPhone]);

  const displayName = useMemo(() => (
    profileName ||
    conversation.contact?.profileName || 
    conversation.contact?.name || 
    conversation.customerName ||
    profilePhone ||
    conversation.customerPhone || 'Cliente sin nombre'
  ), [profileName, profilePhone, conversation.contact?.profileName, conversation.contact?.name, conversation.customerName, conversation.customerPhone]);

  const displayPhone = useMemo(() => (
    profilePhone ||
    conversation.contact?.phoneNumber ||
    conversation.customerPhone || 'Sin teléfono'
  ), [profilePhone, conversation.contact?.phoneNumber, conversation.customerPhone]);

  return (
    <div
      onClick={onClick}
      className={`
        conversation-item relative p-3 cursor-pointer transition-all duration-500 ease-out transform
        ${isSelected 
          ? 'selected bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-lg scale-[1.02]' 
          : 'bg-white hover:bg-gray-50 border-l-4 border-transparent hover:border-l-4 hover:border-blue-200 hover:shadow-md'
        }
        ${isNewMessage ? 'animate-slide-in' : ''}
        ${isHighlighted ? 'ring-2 ring-blue-200' : ''}
        ${isAnimating ? 'animate-scale-bounce' : ''}
        ${isNewConversationAnimating ? 'animate-new-conversation-enter bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 shadow-xl scale-[1.02] ring-2 ring-green-300 animate-new-conversation-pulse' : ''}
        lg:border-l-4 lg:border-transparent lg:hover:border-l-4 lg:hover:border-blue-200
        hover:scale-[1.01] active:scale-[0.99]
      `}
    >
      {/* Indicador de mensaje nuevo */}
      {isNewMessage && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
      )}

      {/* NUEVO: Indicador de nueva conversación */}
      {isNewConversationAnimating && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-ping" />
      )}

      {/* NUEVO: Badge de nueva conversación */}
      {isNewConversationAnimating && (
        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce font-bold">
          NUEVA
        </div>
      )}

      <div className="flex items-start space-x-2">
        {/* Avatar del cliente con fondo azul radiante */}
        <div className="flex-shrink-0">
          <div className={`
            avatar-purple-gradient w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs
            bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700
            shadow-lg hover:shadow-xl transition-all duration-300
            ${isNewMessage ? 'animate-pulse' : ''}
            ${isSelected ? 'ring-2 ring-blue-300 scale-110 animate-glow-pulse' : 'hover:scale-105'}
          `}>
            {customerInitials}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Header con nombre y tiempo */}
          <div className="flex items-start justify-between mb-1">
            <h3 className={`
              text-xs font-semibold truncate transition-colors duration-300 flex-1 mr-2
              ${(conversation.unreadCount || 0) > 0 ? 'text-gray-900' : 'text-gray-700'}
              ${isSelected ? 'text-blue-900' : ''}
            `}>
              {displayName}
            </h3>
            <span className={`
              text-xs flex-shrink-0 transition-colors duration-300 text-blue-600 font-medium
              ${isSelected ? 'text-blue-700' : ''}
            `}>
              {formattedTime}
            </span>
          </div>

          {/* Información del cliente */}
          <div className="flex items-center space-x-1 mb-1.5">
            <span className="text-xs text-gray-500 font-mono truncate">
              {displayPhone}
            </span>
          </div>

          {/* Último mensaje */}
          <div className="flex items-center justify-between">
            <p className={`
              text-xs truncate flex-1 transition-colors duration-300
              ${(conversation.unreadCount || 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}
              ${isSelected ? 'text-blue-900' : ''}
            `}>
              {conversation.lastMessage?.content || 'Sin mensajes'}
            </p>
            
            {/* Badge de mensajes no leídos */}
            {(conversation.unreadCount || 0) > 0 && (
              <div className="flex items-center space-x-1 ml-1">
                <span className={`
                  inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium
                  transition-all duration-300
                  ${isNewMessage ? 'animate-bounce bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}
                  ${isSelected ? 'bg-blue-200 text-blue-800' : ''}
                `}>
                  +{unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}); 