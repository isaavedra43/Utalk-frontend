// =============================================
// ChatThread.tsx - Renderizado de mensajes de conversación
// =============================================
// Este componente obtiene los mensajes normalizados del hook y renderiza 
// con validaciones defensivas para garantizar que la UI nunca se quede en blanco
// por datos malformados o incompletos.
// =============================================

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage, useConversation } from "@/hooks/useMessages";
import { safeString } from "@/lib/apiUtils";
import { ChevronLeft, FileText, Zap, ChevronDown } from "lucide-react";

interface ChatThreadProps {
  conversationId?: string;
  onBack?: () => void;
  className?: string;
}

/**
 * Función defensiva para formatear tiempo de mensaje
 * @param timestamp Timestamp a formatear
 * @returns String formateado de forma segura
 */
function safeFormatMessageTime(timestamp: any): string {
  try {
    const safeTimestamp = safeString(timestamp, new Date().toISOString());
    const date = new Date(safeTimestamp);
    
    if (isNaN(date.getTime())) {
      console.warn('⚠️ [safeFormatMessageTime] Timestamp inválido, usando fecha actual:', timestamp);
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
    console.error('❌ [safeFormatMessageTime] Error al formatear tiempo:', { error, timestamp });
    return new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

/**
 * Función defensiva para obtener el contenido del mensaje
 * @param message Mensaje a procesar
 * @returns Contenido seguro del mensaje
 */
function safeGetMessageContent(message: any): string {
  const content = message?.text || message?.content || message?.body || message?.message;
  return safeString(content, "Mensaje sin contenido");
}

/**
 * Función defensiva para validar el sender del mensaje
 * @param sender Sender a validar
 * @returns Sender válido
 */
function safeGetSender(sender: any): 'agent' | 'client' {
  const safeSender = safeString(sender, 'client').toLowerCase();
  return (safeSender === 'agent') ? 'agent' : 'client';
}

export function ChatThread({ conversationId, onBack, className }: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch de mensajes y conversación desde la API (ya normalizados)
  const { data: messagesResponse, isLoading, error } = useMessages(conversationId || "");
  const sendMessageMutation = useSendMessage();
  const { data: conversation } = useConversation(conversationId || "");

  // 🛡️ EXTRACCIÓN DEFENSIVA DE MENSAJES NORMALIZADOS
  const messages = messagesResponse?.messages || [];

  // LOGS exhaustivos para debugging de estructura real
  useEffect(() => {
    console.group('🔍 [CHAT DEBUG] Datos de mensajes recibidos:');
    console.log('conversationId:', conversationId);
    console.log('messagesResponse:', messagesResponse);
    console.log('messages extraídos:', messages.length);
    if (messages.length > 0) {
      console.log('Primer mensaje de ejemplo:', {
        id: messages[0]?.id,
        content: safeGetMessageContent(messages[0]),
        sender: safeGetSender(messages[0]?.sender),
        timestamp: messages[0]?.timestamp
      });
    }
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.groupEnd();
  }, [conversationId, messagesResponse, isLoading, error, messages]);

  // Scroll automático al final al cambiar mensajes/conversación
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.warn('⚠️ [ChatThread] Error en scroll automático:', error);
    }
  }, [messages, conversationId]);

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;
    
    try {
      sendMessageMutation.mutate({
        to: conversationId,
        body: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      console.error('❌ [ChatThread] Error al enviar mensaje:', error);
    }
  };

  // Renderizado de estados
  if (!conversationId) {
    return (
      <div className={cn("h-full flex items-center justify-center text-gray-400", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
          <p>Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("h-full flex items-center justify-center text-gray-400", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Cargando mensajes...</h3>
          <p>Conectando con el servidor</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error al cargar mensajes:', error);
    return (
      <div className={cn("h-full flex items-center justify-center text-red-400", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Error al cargar mensajes</h3>
          <p>No se pudieron cargar los mensajes de esta conversación</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : "Error desconocido"}
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={cn("h-full flex items-center justify-center text-gray-400", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Conversación no encontrada</h3>
          <p>La conversación seleccionada no existe o no tienes permisos para verla</p>
        </div>
      </div>
    );
  }

  // 🎯 RENDER PRINCIPAL CON VALIDACIONES DEFENSIVAS
  return (
    <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
      {/* Header simplificado */}
      <div className="p-4 border-b border-[#27272A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#E4E4E7]" />
          </button>
          <div className="flex-1">
            <h2 className="text-[#E4E4E7] font-medium">
              {safeString(conversation.customerPhone, "Cliente sin teléfono")}
            </h2>
            <p className="text-[#9CA3AF] text-sm">
              {safeString(conversation.channel, "whatsapp").charAt(0).toUpperCase() + 
               safeString(conversation.channel, "whatsapp").slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de mensajes con validaciones defensivas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-[#9CA3AF] text-sm">No hay mensajes en esta conversación</div>
          </div>
        ) : (
          messages.map((message) => {
            // 🛡️ VALIDACIONES DEFENSIVAS PARA CADA MENSAJE
            const safeId = safeString(message?.id, `temp_msg_${Date.now()}_${Math.random()}`);
            const messageContent = safeGetMessageContent(message);
            const messageSender = safeGetSender(message?.sender);
            const messageTime = safeFormatMessageTime(message?.timestamp);
            
            return (
              <div
                key={safeId}
                className={cn(
                  "flex",
                  messageSender === "agent" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-xl px-4 py-3",
                    messageSender === "agent"
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[#27272A] text-[#E4E4E7]",
                  )}
                  style={{ fontSize: "14px" }}
                >
                  <p>{messageContent}</p>
                  <div
                    className={cn(
                      "text-xs mt-1",
                      messageSender === "agent" ? "text-purple-100" : "text-[#9CA3AF]",
                    )}
                    style={{ fontSize: "10px" }}
                  >
                    {messageTime}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje con validación defensiva */}
      <div className="p-4 border-t border-[#27272A] bg-[#0A0A0A]">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#E4E4E7] placeholder-[#9CA3AF] text-sm focus:outline-none focus:border-[#7C3AED]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#4C1D95] disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// FIN ChatThread.tsx - Completamente robusto con validaciones defensivas
// =============================================
