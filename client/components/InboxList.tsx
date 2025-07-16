import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Mail, Facebook, Smartphone, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import { useConversations } from "@/hooks/useMessages";
import { useConversationStore } from "@/hooks/useConversationStore";

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
}

export function InboxList({ selectedConversationId, onConversationSelect }: InboxListProps) {
  const { data: initialData, isLoading } = useConversations();
  const { conversations, setConversations } = useConversationStore();

  useEffect(() => {
    if (initialData?.data) {
      setConversations(initialData.data);
    }
  }, [initialData, setConversations]);

  const getChannelIcon = (channel: Conversation["channel"]) => {
    switch (channel) {
        case "whatsapp": return <MessageSquare className="h-4 w-4 text-green-500" />;
        case "email": return <Mail className="h-4 w-4 text-blue-500" />;
        case "facebook": return <Facebook className="h-4 w-4 text-sky-600" />;
        case "sms": return <Smartphone className="h-4 w-4 text-purple-500" />;
        default: return null;
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar conversación..." className="pl-10 bg-gray-800 border-gray-700" />
            </div>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
                {conversations.map((convo) => (
                    <div
                        key={convo.id}
                        onClick={() => onConversationSelect(convo.id)}
                        className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors",
                            selectedConversationId === convo.id ? "bg-blue-600/20" : "hover:bg-gray-800/60"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm text-white truncate">{convo.name}</h3>
                            <p className="text-xs text-gray-400">{convo.timestamp}</p>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{convo.lastMessage}</p>
                        <div className="flex items-center justify-between mt-2">
                            {getChannelIcon(convo.channel)}
                            {convo.isUnread && (
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
