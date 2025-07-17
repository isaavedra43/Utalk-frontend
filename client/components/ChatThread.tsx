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
import { useContactByPhone } from "@/hooks/useContactIntegration";
import { usePermissions, PermissionGate } from "@/hooks/usePermissions";
import { safeString } from "@/lib/apiUtils";
import { ChevronLeft, FileText, Zap, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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

  // 🟢 Hooks con nuevos contratos
  const { data: messagesResponse, isLoading, error } = useMessages(conversationId || "");
  const { data: conversation } = useConversation(conversationId || "");
  const sendMessageMutation = useSendMessage();
  const { canSendMessages, isViewer, role } = usePermissions();

  // 🟢 Obtener información del contacto a partir de la conversación
  const { contact, displayName, avatar } = useContactByPhone(conversation?.customerPhone || '');
  
  const messages = messagesResponse?.data || [];

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
    
    // 🔧 VALIDACIÓN DE PERMISOS: Solo permitir envío si tiene permisos
    if (!canSendMessages) {
      toast({
        variant: "destructive",
        title: "Permisos insuficientes",
        description: `Como ${role}, solo puedes ver mensajes pero no enviarlos.`,
      });
      return;
    }
    
    try {
      sendMessageMutation.mutate({
        conversationId: conversationId!,
        content: newMessage,
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

  // 🎯 RENDER PRINCIPAL CON PERMISOS
  return (
    <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
      {/* Header con nombre de contacto enriquecido */}
      <div className="p-4 border-b border-[#27272A] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#E4E4E7]" />
          </button>
          <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0">
             {avatar && <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full" />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-[#E4E4E7]">
              {displayName}
            </h3>
            <p className="text-xs text-[#71717A]">
              {conversation?.channel} • {conversation?.customerPhone}
            </p>
          </div>
          
          {/* 🔧 INDICADOR DE PERMISOS para viewers */}
          {isViewer && (
            <div className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-md">
              Solo lectura
            </div>
          )}
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#71717A]">
            <div className="text-center">
              <h4 className="text-sm font-medium mb-1">No hay mensajes</h4>
              <p className="text-xs">Esta conversación aún no tiene mensajes</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                // 🟢 Usar sender.name para determinar si el mensaje es del agente
                message.sender.name.toLowerCase() !== 'cliente' // Asumiendo que el cliente no se llama 'cliente'
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-[#27272A] text-[#E4E4E7]"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {safeFormatMessageTime(message.timestamp)}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔧 ÁREA DE ENVÍO: Solo mostrar si tiene permisos */}
      <PermissionGate 
        permissions="send_messages"
        fallback={
          <div className="p-4 border-t border-[#27272A] bg-[#111111]">
            <div className="flex items-center justify-center p-3 bg-amber-500/20 rounded-lg">
              <div className="text-center">
                <div className="text-amber-300 text-sm font-medium mb-1">
                  👁️ Modo solo lectura
                </div>
                <p className="text-amber-200 text-xs">
                  Como {role}, puedes ver mensajes pero no enviarlos.
                </p>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-4 border-t border-[#27272A] bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 bg-[#27272A] border border-[#3F3F46] rounded-lg text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:border-blue-500"
              disabled={sendMessageMutation.isPending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Enviar"
              )}
            </button>
          </div>
        </div>
      </PermissionGate>
    </div>
  );
}

// =============================================
// FIN ChatThread.tsx - Completamente robusto con validaciones defensivas
// =============================================
