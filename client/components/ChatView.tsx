import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mail, Facebook, Smartphone, Send, Paperclip, Mic, ChevronLeft, Info, Bot, PanelRightClose } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { useSendMessage } from "@/hooks/useMessages";
import { useConversationStore } from "@/hooks/useConversationStore";
import { getSocket } from "@/lib/socket";
import { Loader2 } from "lucide-react";
import type { Message, Conversation } from "@/types/api";

interface ChatViewProps {
  chatId: string;
  onBack?: () => void;
  onShowClientInfo: () => void;
  onShowAI: () => void;
  onToggleRightPanel: () => void;
  isMobile: boolean;
}

export function ChatView({ chatId, onBack, onShowAI, onShowClientInfo, onToggleRightPanel, isMobile }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usar store global en lugar de hooks separados
  const { messagesByConversation, conversations } = useConversationStore();
  const sendMessageMutation = useSendMessage();

  const conversation = conversations.find(c => c.id === chatId);
  const messages = messagesByConversation[chatId] || [];

  // Implementar join/leave conversation con Socket.IO
  useEffect(() => {
    if (chatId) {
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("🔗 ChatView: Uniéndose a conversación:", chatId);
        socket.emit("join-conversation", chatId);
        
        return () => {
          console.log("🔗 ChatView: Saliendo de conversación:", chatId);
          socket.emit("leave-conversation", chatId);
        };
      } else {
        console.warn("⚠️ ChatView: Socket no conectado al intentar unirse a conversación");
      }
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !chatId) return;
    
    console.log("📤 ChatView: Enviando mensaje:", newMessage, "a conversación:", chatId);
    
    sendMessageMutation.mutate({ 
        conversationId: chatId, 
        messageData: { content: newMessage }
    });

    setNewMessage("");
  };
  
  const getChannelIcon = (channel: Conversation["channel"] | undefined) => {
    switch (channel) {
        case "whatsapp": return <MessageSquare className="h-3 w-3 mr-1" />;
        case "email": return <Mail className="h-3 w-3 mr-1" />;
        case "facebook": return <Facebook className="h-3 w-3 mr-1" />;
        case "sms": return <Smartphone className="h-3 w-3 mr-1" />;
        default: return null;
    }
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando conversación...</p>
          <p className="text-gray-500 text-sm mt-2">ID: {chatId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center p-3 border-b border-gray-800">
        {isMobile && onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={conversation?.avatar} />
          <AvatarFallback>{conversation?.name?.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-base font-semibold">{conversation?.name}</h2>
          <div className="flex items-center text-xs text-gray-400">
            {getChannelIcon(conversation?.channel)}
            {conversation?.channel}
          </div>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onShowClientInfo}><Info className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" onClick={onShowAI}><Bot className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" onClick={onToggleRightPanel}><PanelRightClose className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-gray-400">No hay mensajes en esta conversación</div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              id={message.id} 
              content={message.content} 
              sender={message.sender} 
              timestamp={message.timestamp} 
              status={message.status} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-800 border-gray-700"
          />
          <Button type="button" variant="ghost" size="icon">
            <Mic className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
