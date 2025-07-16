import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Facebook,
  MessageCircle,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useMessages";
import { useConversationStore } from "@/hooks/useConversationStore";
import { Loader2 } from "lucide-react";

interface ChatListColumnProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  selectedSection?: string | null;
  className?: string;
}

export function ChatListColumn({
  selectedChatId,
  onChatSelect,
  selectedSection,
  className,
}: ChatListColumnProps) {
  const [isUnrepliedOnly, setIsUnrepliedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hook para obtener conversaciones reales
  const { data: conversationsResponse, isLoading: isLoadingConversations } = useConversations({
    search: searchQuery,
  });

  // Store global para conversaciones
  const { conversations } = useConversationStore();
  
  // Usar datos del store (que se sincronizan con el hook) o del response
  const allConversations = conversations.length > 0 ? conversations : (conversationsResponse?.data || []);

  // Don't show if no section is selected
  if (!selectedSection) {
    return (
      <div className="flex-shrink-0 w-80 bg-gray-900 border-r border-gray-800 flex items-center justify-center">
        <p className="text-gray-500 text-center px-4">
          Selecciona una sección para ver las conversaciones
        </p>
      </div>
    );
  }

  // Filter conversations based on unreplied toggle and search
  const filteredConversations = allConversations.filter((conv) => {
    if (isUnrepliedOnly && !conv.isUnread) {
      return false;
    }
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="flex-shrink-0 w-80 bg-gray-900 border-r border-gray-800">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-gray-400 text-sm">Cargando conversaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-shrink-0 w-80 bg-gray-900 border-r border-gray-800 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Conversaciones</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUnrepliedOnly(!isUnrepliedOnly)}
            className={cn(
              "text-xs",
              isUnrepliedOnly
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white",
            )}
          >
            <Filter className="h-3 w-3 mr-1" />
            Sin responder
          </Button>
          <span className="text-xs text-gray-400">
            {filteredConversations.length} conversaciones
          </span>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onChatSelect(conversation.id)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800",
                  selectedChatId === conversation.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-100",
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with channel indicator */}
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {conversation.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Channel indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                      {getChannelIcon(conversation.channel)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs opacity-70">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs opacity-70 truncate">
                      {conversation.lastMessage || 'No hay mensajes'}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {conversation.isUnread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
