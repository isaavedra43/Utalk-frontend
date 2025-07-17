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
import { useContactIntegration } from "@/hooks/useContactIntegration";
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

export function InboxList({
  selectedConversationId,
  onConversationSelect,
}: InboxListProps) {
  // Obtener conversaciones y integrar con contactos
  const { data: conversationsResponse, isLoading, error } = useConversations();
  const { enrichConversations, getIntegrationStats } = useContactIntegration();

  // 🔧 ENRIQUECER CONVERSACIONES CON DATOS DE CONTACTOS
  const conversations = conversationsResponse?.conversations || [];
  const enrichedConversations = enrichConversations(conversations);

  // Obtener estadísticas de integración para mostrar información útil
  const integrationStats = getIntegrationStats();

  console.log('📊 [InboxList] Estadísticas de integración de contactos:', integrationStats);

  // 🛡️ EXTRACCIÓN DEFENSIVA DE DATOS NORMALIZADOS
  // const conversations = conversationsResponse?.conversations || [];
  
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
      <div className="h-full flex flex-col bg-[#0C0C0C]">
        <div className="p-4 border-b border-[#27272A]">
          <h2 className="text-white font-medium">Conversaciones</h2>
          <p className="text-[#9CA3AF] text-sm">Cargando...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-[#0C0C0C]">
        <div className="p-4 border-b border-[#27272A]">
          <h2 className="text-white font-medium">Conversaciones</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#9CA3AF]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Error al cargar conversaciones</p>
          </div>
        </div>
      </div>
    );
  }

  if (enrichedConversations.length === 0) {
    return (
      <div className="h-full flex flex-col bg-[#0C0C0C]">
        <div className="p-4 border-b border-[#27272A]">
          <h2 className="text-white font-medium">Conversaciones</h2>
          <p className="text-[#9CA3AF] text-sm">Sin conversaciones</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#9CA3AF]">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 RENDER PRINCIPAL CON VALIDACIONES DEFENSIVAS
  return (
    <div className="h-full flex flex-col bg-[#0C0C0C]">
      {/* Header con estadísticas de integración */}
      <div className="p-4 border-b border-[#27272A]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-medium">Conversaciones</h2>
          <span className="text-[#9CA3AF] text-sm">
            {enrichedConversations.length}
          </span>
        </div>
        
        {/* 🔧 ESTADÍSTICAS DE INTEGRACIÓN DE CONTACTOS */}
        {integrationStats.totalContacts > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{integrationStats.conversationsWithContacts} con contacto</span>
            </div>
            {integrationStats.conversationsWithoutContacts > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>{integrationStats.conversationsWithoutContacts} sin contacto</span>
              </div>
            )}
            <span className="text-[#71717A]">
              ({integrationStats.integrationRate}% integración)
            </span>
          </div>
        )}
      </div>

      {/* Lista de conversaciones enriquecidas */}
      <div className="flex-1 overflow-y-auto">
        {enrichedConversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId;
          
          // 🔧 USAR DATOS ENRIQUECIDOS DE CONTACTOS
          const displayName = (conversation as any).displayName || conversation.name || `Cliente ${conversation.customerPhone}`;
          const contactInfo = (conversation as any).contactInfo;
          const contactStatus = (conversation as any).contactStatus;
          const contactEmail = (conversation as any).contactEmail;

          return (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={cn(
                "p-4 cursor-pointer transition-colors hover:bg-[#18181B]",
                isSelected ? "bg-[#18181B] border-r-2 border-blue-500" : "border-r-2 border-transparent"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar con estado de contacto */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-[#27272A] rounded-full flex items-center justify-center">
                    {conversation.avatar ? (
                      <img 
                        src={conversation.avatar} 
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[#9CA3AF] text-sm font-medium">
                        {displayName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Indicador de contacto */}
                  {contactInfo && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0C0C0C] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Nombre enriquecido */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white text-sm font-medium truncate">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Icono de canal */}
                      <div className="text-[#9CA3AF]">
                        {getChannelIcon(conversation.channel)}
                      </div>
                      <span className="text-[#9CA3AF] text-xs">
                        {safeFormatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                  </div>

                  {/* Información de contacto adicional */}
                  {contactInfo && (
                    <div className="flex items-center gap-2 mb-1">
                      {contactEmail && (
                        <span className="text-[#71717A] text-xs truncate">
                          {contactEmail}
                        </span>
                      )}
                      {contactStatus && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          contactStatus === 'customer' ? 'bg-green-500/20 text-green-300' :
                          contactStatus === 'payment' ? 'bg-blue-500/20 text-blue-300' :
                          contactStatus === 'hot-lead' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-gray-500/20 text-gray-300'
                        )}>
                          {contactStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Último mensaje */}
                  <p className="text-[#9CA3AF] text-sm truncate">
                    {safeString(conversation.lastMessage, "Sin mensaje")}
                  </p>

                  {/* Indicadores de estado */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {/* Teléfono (solo si no hay contacto) */}
                      {!contactInfo && conversation.customerPhone && (
                        <span className="text-[#71717A] text-xs">
                          {conversation.customerPhone}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {conversation.isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔧 FOOTER CON INFORMACIÓN DE CONTACTOS */}
      {integrationStats.totalContacts > 0 && integrationStats.conversationsWithoutContacts > 0 && (
        <div className="p-3 border-t border-[#27272A] bg-[#111111]">
          <div className="text-center">
            <p className="text-[#71717A] text-xs">
              {integrationStats.conversationsWithoutContacts} conversaciones podrían beneficiarse de contactos
            </p>
            <button className="text-blue-400 text-xs hover:text-blue-300 mt-1">
              Crear contactos automáticamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// FIN InboxList.tsx - Componente completamente robusto
// =============================================