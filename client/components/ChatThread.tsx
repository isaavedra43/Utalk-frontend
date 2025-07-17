// =============================================
// ChatThread.tsx - Renderizado de mensajes de conversación
// =============================================
// Este componente obtiene los mensajes EXCLUSIVAMENTE de la API
// y renderiza usando la propiedad 'text' (o 'content' como fallback).
// No usa ningún store local. Todos los estados (cargando, vacío, error)
// están cubiertos y se loguea la estructura real recibida para debugging.
// =============================================

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage, useConversation } from "@/hooks/useMessages";
import { ChevronLeft, FileText, Zap, ChevronDown } from "lucide-react";

interface ChatThreadProps {
  conversationId?: string;
  onBack?: () => void;
  className?: string;
}

export function ChatThread({ conversationId, onBack, className }: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch de mensajes y conversación desde la API
  const { data: messagesResponse, isLoading, error } = useMessages(conversationId || "");
  const sendMessageMutation = useSendMessage();
  const { data: conversation } = useConversation(conversationId || "");

  // LOGS exhaustivos para debugging de estructura real
  useEffect(() => {
    console.group('🔍 [CHAT DEBUG] Datos de mensajes recibidos:');
    console.log('conversationId:', conversationId);
    console.log('messagesResponse:', messagesResponse);
    if (messagesResponse?.data) {
      messagesResponse.data.forEach((msg: any, idx: number) => {
        console.log(`Mensaje[${idx}]:`, msg);
      });
    }
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.groupEnd();
  }, [conversationId, messagesResponse, isLoading, error]);

  // Procesar mensajes: usar 'text' o 'content' como fallback
  const messages = (messagesResponse?.messages || []).map((msg: any) => ({
    ...msg,
    text: msg.text || msg.content || "",
  }));

  // Scroll automático al final al cambiar mensajes/conversación
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationId]);

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;
    sendMessageMutation.mutate({
      to: conversationId,
      body: newMessage,
    });
    setNewMessage("");
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

  // Render principal de mensajes
  return (
    <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
      {/* Header omitido para brevedad */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-gray-400">No hay mensajes en esta conversación</div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "agent" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-4 py-3",
                  message.sender === "agent"
                    ? "bg-[#7C3AED] text-white"
                    : "bg-[#27272A] text-[#E4E4E7]",
                )}
                style={{ fontSize: "14px" }}
              >
                <p>{message.text}</p>
                <div
                  className={cn(
                    "text-xs mt-1",
                    message.sender === "agent" ? "text-purple-100" : "text-[#9CA3AF]",
                  )}
                  style={{ fontSize: "10px" }}
                >
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input de mensaje omitido para brevedad */}
    </div>
  );
}

// =============================================
// FIN ChatThread.tsx - Todos los datos provienen de la API
// =============================================
