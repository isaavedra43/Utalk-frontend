// =============================================
// InboxList.tsx - Lista de conversaciones desde la API
// =============================================
// FIX CRÍTICO: Este componente usa las nuevas utilidades robustas de normalización
// para garantizar que todos los campos críticos tengan valores válidos y que la UI 
// nunca se quede en blanco por datos malformados o incompletos.
// =============================================

import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Mail, Facebook, Smartphone, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import { useConversations } from "@/hooks/useMessages";
import { safeString } from "@/lib/apiUtils";

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
}

/**
 * Función defensiva para obtener el ícono del canal
 * @param channel Canal de comunicación
 * @returns Componente de ícono válido
 */
function getChannelIcon(channel: any) {
  const safeChannel = safeString(channel, 'whatsapp').toLowerCase();
  
  switch (safeChannel) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'facebook':
      return <Facebook className="w-4 h-4" />;
    case 'sms':
      return <Smartphone className="w-4 h-4" />;
    case 'whatsapp':
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

/**
 * Función defensiva para formatear tiempo
 * @param timestamp Timestamp a formatear
 * @returns String formateado de forma segura
 */
function safeFormatTime(timestamp: any): string {
  try {
    const safeTimestamp = safeString(timestamp, new Date().toISOString());
    const date = new Date(safeTimestamp);
    
    if (isNaN(date.getTime())) {
      console.warn('⚠️ [safeFormatTime] Timestamp inválido, usando fecha actual:', timestamp);
      return new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('❌ [safeFormatTime] Error al formatear tiempo:', { error, timestamp });
    return new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

/**
 * Función defensiva para truncar texto
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @returns Texto truncado de forma segura
 */
function safeTruncate(text: any, maxLength: number = 50): string {
  const safeText = safeString(text, "Sin mensaje");
  
  if (safeText.length <= maxLength) {
    return safeText;
  }
  
  try {
    return safeText.substring(0, maxLength) + "...";
  } catch (error) {
    console.error('❌ [safeTruncate] Error al truncar texto:', { error, text });
    return "Error al cargar mensaje...";
  }
}

export function InboxList({ selectedConversationId, onConversationSelect }: InboxListProps) {
  // 🔧 Hook que ya retorna datos completamente normalizados
  const { data: conversationsResponse, isLoading, error } = useConversations();

  // 🛡️ EXTRACCIÓN DEFENSIVA DE DATOS NORMALIZADOS
  const conversations = conversationsResponse?.conversations || [];
  
  console.group('🔍 [InboxList] Estado actual de conversaciones');
  console.log('📥 Respuesta completa:', conversationsResponse);
  console.log('📊 Conversaciones extraídas:', conversations.length);
  console.log('🔄 isLoading:', isLoading);
  console.log('❌ error:', error);
  console.groupEnd();

  // Log de cambios en conversaciones para debugging
  useEffect(() => {
    console.log('🔄 [InboxList] Conversaciones actualizadas:', {
      count: conversations.length,
      firstConv: conversations[0] ? {
        id: conversations[0].id,
        phone: conversations[0].customerPhone,
        lastMessage: conversations[0].lastMessage,
        channel: conversations[0].channel
      } : null
    });
  }, [conversations]);

  // 🔄 ESTADOS DE LOADING Y ERROR
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto mb-3" />
          <p className="text-[#E4E4E7] text-sm">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [InboxList] Error al cargar conversaciones:', error);
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm mb-2">Error al cargar conversaciones</p>
          <p className="text-[#9CA3AF] text-xs">
            {error instanceof Error ? error.message : "Error desconocido"}
          </p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#E4E4E7] text-sm mb-1">No hay conversaciones</p>
          <p className="text-[#9CA3AF] text-xs">Las nuevas conversaciones aparecerán aquí</p>
        </div>
      </div>
    );
  }

  // 🎯 RENDER PRINCIPAL CON VALIDACIONES DEFENSIVAS
  return (
    <div className="h-full bg-[#0A0A0A] border-r border-[#27272A]">
      {/* Header */}
      <div className="p-4 border-b border-[#27272A]">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-[#E4E4E7] font-medium">
            Conversaciones ({conversations.length})
          </h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-9 pr-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#E4E4E7] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => {
            // 🛡️ VALIDACIONES DEFENSIVAS PARA CADA CONVERSACIÓN
            const safeId = safeString(conversation.id, `error_${Date.now()}`);
            const safePhone = safeString(conversation.customerPhone, "Cliente sin teléfono");
            const safeLastMessage = safeTruncate(conversation.lastMessage, 60);
            const safeTime = safeFormatTime(conversation.lastMessageAt);
            const isSelected = selectedConversationId === safeId;
            const isUnread = conversation.isUnread === true;

            return (
              <div
                key={safeId}
                onClick={() => onConversationSelect(safeId)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer border transition-colors mb-1",
                  isSelected
                    ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                    : "bg-[#18181B] border-[#27272A] text-[#E4E4E7] hover:bg-[#27272A]"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Channel Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected ? "bg-white/20" : "bg-[#27272A]"
                  )}>
                    {getChannelIcon(conversation.channel)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        isSelected ? "text-white" : "text-[#E4E4E7]"
                      )}>
                        {safePhone}
                      </p>
                      <span className={cn(
                        "text-xs",
                        isSelected ? "text-white/70" : "text-[#9CA3AF]"
                      )}>
                        {safeTime}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate",
                      isSelected ? "text-white/80" : "text-[#9CA3AF]"
                    )}>
                      {safeLastMessage}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {isUnread && !isSelected && (
                    <div className="flex-shrink-0 w-2 h-2 bg-[#7C3AED] rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// =============================================
// FIN InboxList.tsx - Componente completamente robusto
// =============================================