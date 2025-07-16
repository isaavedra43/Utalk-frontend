import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mail, Facebook, Smartphone, Send, Paperclip, Mic, ChevronLeft, Info, Bot, PanelRightClose } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { useMessages, useConversation, useSendMessage } from "@/hooks/useMessages";
import { Loader2 } from "lucide-react";
import type { Message } from "@/types/api";

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

  const { data: conversation, isLoading: isLoadingConversation } = useConversation(chatId);
  const { data: messagesResponse, isLoading: isLoadingMessages } = useMessages(chatId);
  const sendMessageMutation = useSendMessage();

  const messages = messagesResponse?.data || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !chatId) return;
    
    sendMessageMutation.mutate({ 
        conversationId: chatId, 
        messageData: { content: newMessage }
    });

    setNewMessage("");
  };
  
  const getChannelIcon = (channel: Message["channel"] | undefined) => {
    switch (channel) {
        case "whatsapp": return <MessageSquare className="h-3 w-3 mr-1" />;
        case "email": return <Mail className="h-3 w-3 mr-1" />;
        case "facebook": return <Facebook className="h-3 w-3 mr-1" />;
        case "sms": return <Smartphone className="h-3 w-3 mr-1" />;
        default: return null;
    }
  }

  if (isLoadingConversation || isLoadingMessages) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-gray-800 border-gray-700 rounded-full pl-12 pr-24"
            disabled={sendMessageMutation.isPending}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
            <Button type="button" variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-gray-400" /></Button>
            <Button type="button" variant="ghost" size="icon"><Mic className="h-5 w-5 text-gray-400" /></Button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" disabled={sendMessageMutation.isPending}>
              {sendMessageMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
