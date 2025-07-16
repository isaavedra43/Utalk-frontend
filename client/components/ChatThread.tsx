import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Paperclip,
  Image,
  Smile,
  Mic,
  Send,
  ChevronDown,
  FileText,
  Zap,
} from "lucide-react";
import { useConversationStore } from "@/hooks/useConversationStore";
import { getSocket } from "@/lib/socket";
import { useMessages, useSendMessage } from "@/hooks/useMessages";

// CSS for contentEditable placeholder
const styles = `
  [contenteditable][data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: #9CA3AF;
    pointer-events: none;
  }
  [contenteditable]:focus {
    outline: none;
  }
`;

interface ChatThreadProps {
  conversationId?: string;
  onBack?: () => void;
  className?: string;
}

export function ChatThread({
  conversationId,
  onBack,
  className,
}: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usar store global en lugar de mock data
  const { messagesByConversation, conversations } = useConversationStore();
  const messages = conversationId ? messagesByConversation[conversationId] || [] : [];
  const conversation = conversations.find(c => c.id === conversationId);

  // Hooks para datos reales
  const { data: messagesResponse, isLoading } = useMessages(conversationId || "", {
    enabled: !!conversationId
  });
  const sendMessageMutation = useSendMessage();

  // Implementar join/leave conversation con Socket.IO
  useEffect(() => {
    if (conversationId) {
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("🔗 Uniéndose a conversación:", conversationId);
        socket.emit("join-conversation", conversationId);
        
        return () => {
          console.log("🔗 Saliendo de conversación:", conversationId);
          socket.emit("leave-conversation", conversationId);
        };
      } else {
        console.warn("⚠️ Socket no conectado al intentar unirse a conversación");
      }
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;

    console.log("📤 Enviando mensaje:", newMessage, "a conversación:", conversationId);
    
    sendMessageMutation.mutate({ 
      conversationId, 
      messageData: { content: newMessage } 
    });
    
    setNewMessage("");
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    setNewMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center text-gray-400",
          className,
        )}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            Selecciona una conversación
          </h3>
          <p>Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center text-gray-400",
          className,
        )}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">
            Cargando conversación...
          </h3>
          <p>Conectando con el servidor</p>
        </div>
      </div>
    );
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "whatsapp": return "#25D366";
      case "email": return "#4285F4";
      case "facebook": return "#1877F2";
      default: return "#6B7280";
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "whatsapp": return "WhatsApp";
      case "email": return "Email";
      case "facebook": return "Facebook";
      default: return channel;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F25] bg-[#0D0D12]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#1F1F25] rounded-lg transition-colors lg:hidden"
            >
              <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {conversation.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-[#E4E4E7] font-semibold text-base">
                  {conversation.name}
                </h2>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getChannelColor(conversation.channel) }}
                  />
                  <span className="text-[#9CA3AF] text-sm">
                    {getChannelLabel(conversation.channel)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#1F1F25] rounded-lg transition-colors">
              <FileText className="h-4 w-4 text-[#9CA3AF]" />
            </button>
            <button className="p-2 hover:bg-[#1F1F25] rounded-lg transition-colors">
              <Zap className="h-4 w-4 text-[#9CA3AF]" />
            </button>
            <button className="p-2 hover:bg-[#1F1F25] rounded-lg transition-colors">
              <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center">
              <div className="text-gray-400">Cargando mensajes...</div>
            </div>
          ) : messages.length === 0 ? (
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
                  <p>{message.content}</p>
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

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#27272A] rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#9CA3AF] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="p-4 border-t border-[#1F1F25] bg-[#0D0D12]">
          <div className="flex items-end gap-3">
            <div className="flex gap-2">
              <button className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#1F1F25] rounded-lg transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#1F1F25] rounded-lg transition-colors">
                <Image className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 relative">
              <div
                className="w-full min-h-[42px] max-h-32 px-4 py-3 bg-[#1F1F25] border border-[#3F3F46] rounded-xl text-[#E4E4E7] overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: "14px",
                }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder="Escribe un mensaje…"
              />
            </div>

            <div className="flex gap-2">
              <button className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#1F1F25] rounded-lg transition-colors">
                <Smile className="h-5 w-5" />
              </button>
              <button className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#1F1F25] rounded-lg transition-colors">
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="p-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
