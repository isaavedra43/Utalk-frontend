import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const channelColors = {
  whatsapp: "#25D366",
  email: "#4285F4",
  facebook: "#1877F2",
  sms: "#FF6B35",
  webchat: "#8B5CF6",
};

const channelLabels = {
  whatsapp: "WhatsApp",
  email: "Email",
  facebook: "Facebook",
  sms: "SMS",
  webchat: "WebChat",
};

export function ChatThread({
  conversationId,
  onBack,
  className,
}: ChatThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isContentEditable, setIsContentEditable] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  // Get conversation data
  const { conversations, selectedConversation } = useConversations();
  const conversation = selectedConversation || conversations.find(c => c.id === conversationId);

  // Get messages data
  const {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    sendImage,
    sendDocument,
    handleTyping,
    stopTyping,
    messagesEndRef,
    sendError,
  } = useMessages(conversationId || null);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage(newMessage);
      setNewMessage("");
      
      // Clear contentEditable
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle content editable input
  const handleContentEditableInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    setNewMessage(content);
    
    // Handle typing indicator
    if (content.trim()) {
      handleTyping();
    } else {
      stopTyping();
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId) return;

    try {
      if (file.type.startsWith('image/')) {
        await sendImage(file, newMessage || undefined);
      } else {
        await sendDocument(file, newMessage || undefined);
      }
      
      setNewMessage("");
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = "";
      }
    } catch (error) {
      console.error("Failed to send file:", error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message status icon
  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'failed':
        return '✗';
      default:
        return '';
    }
  };

  // Show placeholder when no conversation selected
  if (!conversationId || !conversation) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center text-gray-400",
          className,
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Mail className="h-8 w-8 text-gray-400" />
          </div>
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
        style={{ background: "#18181B", fontSize: "14px", lineHeight: "1.4em" }}
      >
        {/* Header */}
        <div
          className="flex items-center px-6 border-b border-gray-800"
          style={{ height: "64px", background: "#18181B" }}
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
                <h2
                  className="text-lg font-bold text-[#E4E4E7]"
                  style={{ fontSize: "16px" }}
                >
                  {conversation.clientName}
                </h2>
                <p className="text-xs text-gray-400">
                  {conversation.status === 'active' ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Priority indicator */}
            {conversation.priority === 'high' && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="Alta prioridad"></div>
            )}
            
            {/* Channel badge */}
            <span
              className="px-3 py-1 rounded text-sm font-medium text-white"
              style={{
                backgroundColor: channelColors[conversation.channel] || "#7C3AED",
                fontSize: "12px",
              }}
            >
              {channelLabels[conversation.channel] || conversation.channel}
            </span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4">
            <Alert className="bg-red-900/20 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar mensajes: {error.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Send Error */}
        {sendError && (
          <div className="p-4">
            <Alert className="bg-red-900/20 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al enviar mensaje: {sendError.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Cargando mensajes...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && messages.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No hay mensajes aún</p>
                <p className="text-xs text-gray-500 mt-1">Envía el primer mensaje para comenzar la conversación</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {!isLoading && messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.direction === "outbound" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-4 py-3",
                  message.direction === "outbound"
                    ? "bg-[#7C3AED] text-white"
                    : "bg-[#27272A] text-[#E4E4E7]",
                )}
                style={{ fontSize: "14px" }}
              >
                {/* Media content */}
                {message.type === 'image' && message.mediaUrl && (
                  <div className="mb-2">
                    <img
                      src={message.mediaUrl}
                      alt="Imagen"
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}
                
                {message.type === 'document' && message.mediaUrl && (
                  <div className="mb-2 p-2 bg-black/20 rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Documento</span>
                  </div>
                )}

                {/* Text content */}
                {message.content && (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}

                {/* Timestamp and status */}
                <div
                  className={cn(
                    "text-xs mt-1 flex items-center gap-1",
                    message.direction === "outbound" ? "text-purple-100 justify-end" : "text-[#9CA3AF]",
                  )}
                  style={{ fontSize: "10px" }}
                >
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.direction === "outbound" && (
                    <span className={cn(
                      "text-xs",
                      message.status === 'read' ? 'text-blue-300' : 
                      message.status === 'delivered' ? 'text-gray-300' :
                      message.status === 'failed' ? 'text-red-300' : 'text-gray-400'
                    )}>
                      {getMessageStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex justify-end">
              <div className="bg-[#7C3AED] rounded-xl px-4 py-3 opacity-70">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
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
          style={{ background: "#18181B" }}
        >
          {/* Action Buttons Row */}
          <div
            className="flex items-center justify-between px-6 py-2 border-b border-gray-800"
            style={{ background: "#18181B" }}
          >
            {/* Minimalist Action Icons */}
            <div className="flex items-center gap-1">
              <button
                title="Enviar Campaña"
                className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors"
                style={{ padding: "8px" }}
                disabled
              >
                <Mail
                  className="w-6 h-6"
                  style={{ width: "24px", height: "24px" }}
                />
              </button>

              <button
                title="Resumir (IA)"
                className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors"
                style={{ padding: "8px" }}
                disabled
              >
                <Zap
                  className="w-6 h-6"
                  style={{ width: "24px", height: "24px" }}
                />
              </button>

              <button
                title="Agregar Nota"
                className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors"
                style={{ padding: "8px" }}
                disabled
              >
                <FileText
                  className="w-6 h-6"
                  style={{ width: "24px", height: "24px" }}
                />
              </button>
            </div>

            {/* AI Assist Toggle - Square Button */}
            <button
              className={cn(
                "flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-[#7C3AED] text-white hover:bg-purple-700",
              )}
              style={{ width: "32px", height: "32px" }}
              disabled
            >
              <span style={{ fontSize: "16px" }}>✨</span>
            </button>
          </div>

          {/* Message Input Area */}
          <div className="px-6 py-3">
            <div
              className="bg-[#27272A] border border-[#3A3A40] rounded-lg overflow-hidden"
              style={{ borderRadius: "8px" }}
            >
              {/* Text Input */}
              <div className="px-4 py-3">
                <div
                  ref={contentEditableRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  className="min-h-8 max-h-40 overflow-y-auto text-[#E4E4E7] text-sm leading-5 outline-none"
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "14px",
                  }}
                  onInput={handleContentEditableInput}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe un mensaje…"
                  data-placeholder="Escribe un mensaje…"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-[#3A3A40]">
                <div className="flex items-center gap-1">
                  {/* File Upload */}
                  <label className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf,.doc,.docx,.txt"
                    />
                    <Paperclip
                      className="w-6 h-6"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </label>

                  {/* Image Upload */}
                  <label className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                    <Image
                      className="w-6 h-6"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </label>

                  <button
                    className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                    style={{ padding: "8px" }}
                  >
                    <Smile
                      className="w-6 h-6"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </button>
                  <button
                    className="p-2 text-[#9CA3AF] hover:text-[#D4D4D8] hover:bg-gray-700 rounded-lg transition-colors"
                    disabled
                    style={{ padding: "8px" }}
                  >
                    <Mic
                      className="w-6 h-6"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className={cn(
                    "flex items-center justify-center rounded-lg transition-colors",
                    newMessage.trim() && !isSending
                      ? "bg-[#7C3AED] text-white hover:bg-purple-700"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed",
                  )}
                  style={{ width: "32px", height: "32px" }}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
