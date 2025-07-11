import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, MoreHorizontal, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
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

export function InboxList({
  selectedConversationId,
  onConversationSelect,
  className,
}: InboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todas");

  const filters = ["Todas", "Activas", "Pendientes", "Resueltas"];

  // Get filter value for API
  const getStatusFilter = (filter: string) => {
    switch (filter) {
      case "Activas":
        return "active";
      case "Pendientes":
        return "pending";
      case "Resueltas":
        return "resolved";
      default:
        return undefined;
    }
  };

  // Use conversations hook with filters
  const {
    conversations,
    isLoading,
    error,
    selectConversation,
    selectedConversationId: hookSelectedId,
    getUnreadCount,
    refresh,
  } = useConversations({
    search: searchQuery || undefined,
    status: getStatusFilter(selectedFilter),
    limit: 50,
  });

  // Handle conversation selection
  const handleConversationSelect = (id: string) => {
    selectConversation(id);
    onConversationSelect(id);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  // Generate avatar URL based on client name
  const getAvatarUrl = (name: string) => {
    const seed = name.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  return (
    <div
      className={cn("h-full flex flex-col", className)}
      style={{
        width: "280px",
        background: "#1E1B29",
        fontSize: "14px",
        lineHeight: "1.4em",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{ height: "64px", padding: "0", background: "#1E1B29" }}
        className="flex items-center border-b border-gray-800"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversación…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#1E1B29] text-[#E4E4E7] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            style={{
              borderRadius: "6px",
              padding: "8px 8px 8px 36px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={refresh}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] cursor-pointer hover:text-white"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div
        className="px-0 py-3 border-b border-gray-800"
        style={{ height: "48px", display: "flex", alignItems: "center" }}
      >
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors",
                selectedFilter === filter
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[#1E1B29] text-[#E4E4E7] hover:bg-[#2A2640]",
              )}
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "6px",
                height: "32px",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4">
          <Alert className="bg-red-900/20 border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar conversaciones: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Cargando conversaciones...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredConversations.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 mb-2">
              {searchQuery ? "No se encontraron conversaciones" : "No hay conversaciones"}
            </p>
            <p className="text-xs text-gray-500">
              {searchQuery ? "Intenta con otros términos de búsqueda" : "Las nuevas conversaciones aparecerán aquí"}
            </p>
          </div>
        </div>
      )}

      {/* Conversation List */}
      {!isLoading && !error && filteredConversations.length > 0 && (
        <div
          className="flex-1 overflow-y-auto p-0"
          style={{ gap: "8px", paddingTop: "8px" }}
        >
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation.id)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-150",
                selectedConversationId === conversation.id
                  ? "bg-[#1E1B29] border-l-4 border-l-[#7C3AED]"
                  : "bg-[#1E1B29] hover:bg-[#2A2640]",
              )}
              style={{
                height: "72px",
                padding: "12px",
                marginBottom: "8px",
                borderRadius: "8px",
              }}
            >
              <div className="flex items-center gap-3 h-full">
                {/* Avatar */}
                <img
                  src={getAvatarUrl(conversation.clientName)}
                  alt={conversation.clientName}
                  className="rounded-full"
                  style={{ width: "32px", height: "32px" }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* First Line: Name + Channel */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-semibold text-[#E4E4E7] truncate"
                      style={{ fontSize: "14px" }}
                    >
                      {conversation.clientName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{
                        backgroundColor: channelColors[conversation.channel] || "#7C3AED",
                        fontSize: "10px",
                      }}
                    >
                      {channelLabels[conversation.channel] || conversation.channel}
                    </span>
                  </div>

                  {/* Second Line: Last Message */}
                  <p
                    className="text-[#9CA3AF] truncate"
                    style={{ fontSize: "12px" }}
                  >
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Right Side: Timestamp + Unread Badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[#9CA3AF]" style={{ fontSize: "10px" }}>
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <div
                      className="bg-[#EF4444] text-white rounded-full flex items-center justify-center font-bold"
                      style={{
                        width: "16px",
                        height: "16px",
                        fontSize: "10px",
                      }}
                    >
                      {conversation.unreadCount}
                    </div>
                  )}
                  {/* Priority indicator */}
                  {conversation.priority === 'high' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && conversations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{conversations.length} conversaciones</span>
            <span>{getUnreadCount()} sin leer</span>
          </div>
        </div>
      )}
    </div>
  );
}
