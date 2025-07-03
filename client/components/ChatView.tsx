import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Bot,
  Package,
  Settings,
  Mic,
  ImageIcon,
  FileText,
  PanelRightClose,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  chatId?: string;
  className?: string;
  onShowAI?: () => void;
  onShowClientInfo?: () => void;
  onToggleRightPanel?: () => void;
}

// Mock conversation data
const mockConversation = {
  id: "1",
  contactName: "Israel Saavedra",
  channel: "whatsapp" as const,
  status: "En línea",
  tag: "order",
};

// Mock messages
const mockMessages = [
  {
    id: "1",
    content: "Hola, ¿cómo está el estado de mi pedido #AL-2024-0123?",
    sender: "customer",
    timestamp: "12:14 PM",
    isRead: true,
  },
  {
    id: "2",
    content:
      "Hola Israel, déjame revisar el estado de tu pedido. Un momento por favor.",
    sender: "agent",
    timestamp: "12:15 PM",
    isRead: true,
  },
  {
    id: "3",
    content:
      "Tu pedido está en proceso de empaquetado. Estimamos el envío para mañana por la mañana.",
    sender: "agent",
    timestamp: "12:16 PM",
    isRead: true,
  },
  {
    id: "4",
    content:
      "Perfecto, ¿me podrían enviar el número de tracking cuando esté listo?",
    sender: "customer",
    timestamp: "12:17 PM",
    isRead: false,
  },
];

export function ChatView({
  chatId,
  className,
  onShowAI,
  onShowClientInfo,
  onToggleRightPanel,
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getChannelName = () => {
    switch (mockConversation.channel) {
      case "whatsapp":
        return "WhatsApp";
      case "email":
        return "Email";
      case "facebook":
        return "Facebook";
      default:
        return "Chat";
    }
  };

  const getChannelColor = () => {
    switch (mockConversation.channel) {
      case "whatsapp":
        return "#25D366";
      case "email":
        return "#4285F4";
      case "facebook":
        return "#1877F2";
      default:
        return "#4F8EF7";
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show placeholder if no chat is selected
  if (!chatId) {
    return (
      <div
        className={cn("h-full flex items-center justify-center", className)}
        style={{ background: "transparent" }}
      >
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Package className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium mb-2">
            Ninguna conversación seleccionada
          </p>
          <p className="text-sm">
            Elige una conversación de la barra lateral para comenzar a escribir
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("h-full flex flex-col", className)}
      style={{ background: "transparent" }}
    >
      {/* Header de conversación */}
      <div
        className="flex items-center border-b"
        style={{
          height: "64px",
          padding: "0 16px",
          borderBottom: "1px solid #2E2E3F",
        }}
      >
        {/* Left - Avatar and Name with Status */}
        <div className="flex items-center" style={{ gap: "12px" }}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-700 text-gray-300 text-sm">
              {mockConversation.contactName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3
              className="font-semibold text-white"
              style={{ fontSize: "14px", lineHeight: "20px" }}
            >
              {mockConversation.contactName}
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400" style={{ fontSize: "12px" }}>
                En línea
              </span>
            </div>
          </div>
        </div>

        {/* Center - Breadcrumb */}
        <div className="flex-1 text-center" style={{ marginLeft: "16px" }}>
          <span
            className="text-gray-400"
            style={{ fontSize: "12px", color: "#A0A0A0" }}
          >
            Inbox &gt; Chats &gt; {mockConversation.contactName}
          </span>
        </div>

        {/* Right - Channel Tags and Actions */}
        <div className="flex items-center" style={{ gap: "8px" }}>
          {/* Channel Badge */}
          <Badge
            className="text-xs"
            style={{
              background: getChannelColor(),
              color: "#FFFFFF",
            }}
          >
            {getChannelName()}
          </Badge>

          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Panel Toggle Buttons */}
          <div className="flex items-center gap-1">
            {/* Mobile AI and Client Info buttons */}
            <div className="lg:hidden flex items-center gap-1">
              {onShowAI && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowAI}
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Desktop Right Panel Toggle */}
            <div className="hidden lg:flex">
              {onToggleRightPanel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRightPanel}
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo de mensajes */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "agent" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[60%] break-words",
                    message.sender === "agent" ? "text-white" : "text-gray-100",
                  )}
                  style={{
                    background:
                      message.sender === "agent" ? "#4F8EF7" : "#2E2E3F",
                    borderRadius: "12px",
                    padding: "12px",
                    wordBreak: "break-word",
                  }}
                >
                  <p style={{ fontSize: "14px", lineHeight: "20px" }}>
                    {message.content}
                  </p>
                  <div
                    className="text-right mt-1"
                    style={{
                      fontSize: "10px",
                      color:
                        message.sender === "agent"
                          ? "rgba(255,255,255,0.7)"
                          : "#A0A0A0",
                      marginTop: "4px",
                    }}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Footer de entrada de texto */}
      <div
        className="border-t flex items-center"
        style={{
          height: "80px",
          borderTop: "1px solid #2E2E3F",
          padding: "0 16px",
          gap: "12px",
        }}
      >
        {/* Botones de acciones */}
        <div className="flex items-center" style={{ gap: "8px" }}>
          {/* Adjuntar */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            style={{
              background: "#2E2E3F",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Imagen */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            style={{
              background: "#2E2E3F",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          {/* Audio */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            style={{
              background: "#2E2E3F",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Campo de texto */}
        <Textarea
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 resize-none"
          style={{
            background: "#252538",
            borderRadius: "8px",
            padding: "12px",
            color: "#FFFFFF",
            fontSize: "14px",
            border: "1px solid #2E2E3F",
            minHeight: "44px",
            maxHeight: "44px",
          }}
          rows={1}
        />

        {/* Botones IA */}
        <div className="flex items-center" style={{ gap: "8px" }}>
          {/* Resumir */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            style={{
              background: "#2E2E3F",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
            }}
          >
            <Bot className="h-3 w-3 mr-1" />
            Resumir
          </Button>

          {/* Sugerir */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            style={{
              background: "#2E2E3F",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
            }}
          >
            <Bot className="h-3 w-3 mr-1" />
            Sugerir
          </Button>
        </div>

        {/* Botón Enviar */}
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="text-white disabled:opacity-50"
          style={{
            background: "#3AD29F",
            borderRadius: "8px",
            padding: "12px 16px",
            border: "none",
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
