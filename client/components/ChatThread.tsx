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
  Mail,
  FileText,
  Zap,
} from "lucide-react";

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

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isAgent: boolean;
  avatar?: string;
}

interface ChatThreadProps {
  conversationId?: string;
  onBack?: () => void;
  className?: string;
}

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      text: "Hola, estoy interesada en sus productos. ¿Podrían enviarme más información?",
      timestamp: "10:25",
      isAgent: false,
    },
    {
      id: "m2",
      text: "¡Hola María! Por supuesto, será un placer ayudarte. ¿Te interesa algún producto en particular?",
      timestamp: "10:26",
      isAgent: true,
    },
    {
      id: "m3",
      text: "Sí, he visto sus cámaras de seguridad en la página web y me gustaría saber más sobre el modelo X-200",
      timestamp: "10:28",
      isAgent: false,
    },
    {
      id: "m4",
      text: "Excelente elección! El modelo X-200 es uno de nuestros más populares. Te envío la ficha técnica y precios especiales.",
      timestamp: "10:30",
      isAgent: true,
    },
  ],
  "2": [
    {
      id: "m5",
      text: "Muchas gracias por toda la información que me enviaron por email.",
      timestamp: "09:40",
      isAgent: false,
    },
    {
      id: "m6",
      text: "De nada Carlos! ¿Te ayudó a tomar una decisión? ¿Tienes alguna pregunta adicional?",
      timestamp: "09:42",
      isAgent: true,
    },
    {
      id: "m7",
      text: "Sí, me ayudó mucho. Creo que voy a proceder con la compra. ¿Cuál sería el siguiente paso?",
      timestamp: "09:45",
      isAgent: false,
    },
  ],
};

const mockConversations = {
  "1": { name: "María González", channel: "whatsapp" },
  "2": { name: "Carlos Ruiz", channel: "email" },
  "3": { name: "Ana Martínez", channel: "facebook" },
  "4": { name: "Luis Fernández", channel: "whatsapp" },
  "5": { name: "Carmen López", channel: "email" },
};

const channelColors = {
  whatsapp: "#25D366",
  email: "#4285F4",
  facebook: "#1877F2",
};

const channelLabels = {
  whatsapp: "WhatsApp",
  email: "Email",
  facebook: "Facebook",
};

export function ChatThread({
  conversationId,
  onBack,
  className,
}: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversationId
    ? mockConversations[conversationId as keyof typeof mockConversations]
    : null;
  const messages = conversationId ? mockMessages[conversationId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Simulate sending message
    console.log("Sending message:", newMessage);
    setNewMessage("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId || !conversation) {
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        className={cn("h-full flex flex-col", className)}
        style={{ background: "#1F1F23" }}
      >
        {/* Header */}
        <div
          className="flex items-center px-6 border-b border-gray-800"
          style={{ height: "64px", background: "#1F1F23" }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">
                  Inbox &gt; Chats &gt; {conversation.name}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {conversation.name}
                </h2>
              </div>
            </div>
          </div>

          <span
            className="px-3 py-1 rounded text-sm font-medium text-white"
            style={{
              backgroundColor:
                channelColors[
                  conversation.channel as keyof typeof channelColors
                ],
            }}
          >
            {channelLabels[conversation.channel as keyof typeof channelLabels]}
          </span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isAgent ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-4 py-3",
                  message.isAgent
                    ? "bg-[#4A90E2] text-white"
                    : "bg-[#2C2C32] text-white",
                )}
                style={{ fontSize: "15px" }}
              >
                <p>{message.text}</p>
                <div
                  className={cn(
                    "text-xs mt-1",
                    message.isAgent ? "text-blue-100" : "text-[#80808A]",
                  )}
                  style={{ fontSize: "12px" }}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2C2C32] rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div
          className="border-t border-gray-800"
          style={{ background: "#1F1F23" }}
        >
          {/* Top Bar with Action Buttons */}
          <div
            className="flex items-center justify-between px-6 py-2 border-b border-gray-800"
            style={{ background: "#222225" }}
          >
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                title="Enviar Campaña"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>

              <button
                title="Resumir (IA)"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Zap className="w-5 h-5" />
              </button>

              <button
                title="Agregar Nota"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assist Toggle */}
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "bg-blue-600 text-white hover:bg-blue-700",
              )}
            >
              <span className="text-lg">✨</span>
              <span>AI Assist</span>
            </button>
          </div>

          {/* Message Input Area */}
          <div className="px-6 py-3">
            <div
              className="bg-[#2C2C32] border border-[#3A3A40] rounded-lg overflow-hidden"
              style={{ borderRadius: "8px" }}
            >
              {/* Text Input */}
              <div className="px-4 py-3">
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="min-h-8 max-h-40 overflow-y-auto text-white text-sm leading-5 outline-none"
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                  onInput={(e) => {
                    const content = e.currentTarget.textContent || "";
                    setNewMessage(content);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje…"
                  data-placeholder="Escribe un mensaje…"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-[#3A3A40]">
                <div className="flex items-center gap-1">
                  {/* Attachment Options */}
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    newMessage.trim()
                      ? "bg-[#4CAF50] text-white hover:bg-green-600"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed",
                  )}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
