import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Facebook,
  Filter,
  MailOpen,
  MessageCircle,
  MoreHorizontal,
  Search,
  User,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useMessages";
import { useConversationStore } from "@/hooks/useConversationStore";
import { Loader2 } from "lucide-react";

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  className?: string;
}

export function ChatList({
  selectedChatId,
  onChatSelect,
  className,
}: ChatListProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>("all");
  const [activeTab, setActiveTab] = useState("chats");
  const [isUnrepliedOnly, setIsUnrepliedOnly] = useState(false);
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(true);
  const [isTeamInboxOpen, setIsTeamInboxOpen] = useState(false);
  const [isCustomInboxOpen, setIsCustomInboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hook para obtener conversaciones reales
  const { data: conversationsResponse, isLoading: isLoadingConversations } = useConversations({
    search: searchQuery,
  });

  // Store global para conversaciones
  const { conversations } = useConversationStore();
  
  // Usar datos del store (que se sincronizan con el hook) o del response
  const allConversations = conversations.length > 0 ? conversations : (conversationsResponse?.data || []);

  // Filter conversations based on section and unreplied toggle
  const filteredConversations = allConversations.filter((conv) => {
    if (isUnrepliedOnly && !conv.isUnread) {
      return false;
    }
    
    // Additional filtering based on selectedSection could go here
    return true;
  });

  // Counters based on real data
  const allCount = allConversations.length;
  const unrepliedCount = allConversations.filter(conv => conv.isUnread).length;

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Sidebar de Bandejas */}
      <div
        className="flex-1 flex flex-col"
        style={{ paddingTop: "16px", paddingBottom: "16px" }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2
            className="text-white font-semibold mb-2"
            style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px" }}
          >
            📥 Inbox
          </h2>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {/* Main Sections */}
          <div className="space-y-2">
            {/* All */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("all")}
              className={cn(
                "w-full justify-between p-3 rounded-lg transition-colors",
                selectedSection === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
              style={{ lineHeight: "24px" }}
            >
              <div className="flex items-center" style={{ gap: "12px" }}>
                <Archive className="h-4 w-4" />
                <span style={{ fontSize: "14px" }}>Todos</span>
              </div>
              <Badge className="bg-gray-600 text-white text-xs">
                {allCount}
              </Badge>
            </Button>

            {/* Mine */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("mine")}
              className={cn(
                "w-full justify-between p-3 rounded-lg transition-colors",
                selectedSection === "mine"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
              style={{ lineHeight: "24px" }}
            >
              <div className="flex items-center" style={{ gap: "12px" }}>
                <User className="h-4 w-4" />
                <span style={{ fontSize: "14px" }}>Míos</span>
              </div>
            </Button>

            {/* Unassigned */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("unassigned")}
              className={cn(
                "w-full justify-between p-3 rounded-lg transition-colors",
                selectedSection === "unassigned"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
              style={{ lineHeight: "24px" }}
            >
              <div className="flex items-center" style={{ gap: "12px" }}>
                <MessageCircle className="h-4 w-4" />
                <span style={{ fontSize: "14px" }}>Sin Asignar</span>
              </div>
              <Badge className="bg-red-600 text-white text-xs">
                {unrepliedCount}
              </Badge>
            </Button>

            {/* Incoming Calls */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("calls")}
              className={cn(
                "w-full justify-between p-3 rounded-lg transition-colors",
                selectedSection === "calls"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
              )}
              style={{ lineHeight: "24px" }}
            >
              <div className="flex items-center" style={{ gap: "12px" }}>
                <Phone className="h-4 w-4" />
                <span style={{ fontSize: "14px" }}>Llamadas Entrantes</span>
              </div>
            </Button>
          </div>

          {/* Lifecycle Section */}
          <div style={{ marginBottom: "24px" }}>
            <Collapsible
              open={isLifecycleOpen}
              onOpenChange={setIsLifecycleOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                  style={{ lineHeight: "24px" }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    🔄 Ciclo de Vida
                  </span>
                  {isLifecycleOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {/* New Lead */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("new-lead")}
                  className={cn(
                    "w-full justify-between p-3 rounded-lg transition-colors ml-4",
                    selectedSection === "new-lead"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <div className="flex items-center" style={{ gap: "12px" }}>
                    <span>🆕</span>
                    <span style={{ fontSize: "14px" }}>Nuevo Prospecto</span>
                  </div>
                  <Badge className="bg-green-600 text-white text-xs">
                    {unrepliedCount}
                  </Badge>
                </Button>

                {/* Hot Lead */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("hot-lead")}
                  className={cn(
                    "w-full justify-between p-3 rounded-lg transition-colors ml-4",
                    selectedSection === "hot-lead"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <div className="flex items-center" style={{ gap: "12px" }}>
                    <span>🔥</span>
                    <span style={{ fontSize: "14px" }}>Prospecto Caliente</span>
                  </div>
                </Button>

                {/* Payment */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("payment")}
                  className={cn(
                    "w-full justify-between p-3 rounded-lg transition-colors ml-4",
                    selectedSection === "payment"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <div className="flex items-center" style={{ gap: "12px" }}>
                    <span>💵</span>
                    <span style={{ fontSize: "14px" }}>Pago</span>
                  </div>
                </Button>

                {/* Customer */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("customer")}
                  className={cn(
                    "w-full justify-between p-3 rounded-lg transition-colors ml-4",
                    selectedSection === "customer"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-800",
                  )}
                >
                  <div className="flex items-center" style={{ gap: "12px" }}>
                    <span>🤩</span>
                    <span style={{ fontSize: "14px" }}>Cliente</span>
                  </div>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Chat List Section - Only show when section is selected */}
      {selectedSection && (
        <div
          className="flex-1 mt-6"
          style={{
            background: "#252538",
            borderRadius: "12px",
            padding: "16px",
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          {/* Header with Tabs */}
          <div className="border-b border-gray-700 mb-4">
            {/* Tab Navigation */}
            <div className="flex mb-4">
              <button
                onClick={() => setActiveTab("chats")}
                className={cn(
                  "flex-1 px-3 py-2 text-center rounded-lg transition-colors",
                  activeTab === "chats"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700",
                )}
                style={{ fontSize: "16px", fontWeight: "600" }}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab("calls")}
                className={cn(
                  "flex-1 px-3 py-2 text-center rounded-lg transition-colors ml-2",
                  activeTab === "calls"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700",
                )}
                style={{ fontSize: "16px", fontWeight: "600" }}
              >
                Llamadas
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
                style={{ fontSize: "14px" }}
              >
                Abierto, Más Reciente
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>

              <div className="flex items-center" style={{ gap: "12px" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Sin Responder</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-7 h-7 p-0 text-gray-400 hover:text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="space-y-3">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="text-center text-gray-400">No hay conversaciones.</p>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onChatSelect(conversation.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all duration-200",
                    "flex items-center gap-3",
                    selectedChatId === conversation.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-100",
                  )}
                  style={{
                    background:
                      selectedChatId === conversation.id ? "#4F8EF7" : "#2E2E40",
                    borderRadius: "8px",
                    padding: "12px 16px",
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name || 'Contact'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(conversation.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Channel indicator */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-2 h-2 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {conversation.name || 'Unknown Contact'}
                      </h3>
                      <span className="text-xs opacity-70">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-xs opacity-70 truncate">
                      {conversation.lastMessage || 'No messages'}
                    </p>
                  </div>

                  {/* Lifecycle Badge */}
                  <div className="flex-shrink-0">
                    <Badge
                      className="text-xs"
                      style={{
                        background: "#3AD29F",
                        color: "#FFFFFF",
                        fontSize: "10px",
                      }}
                    >
                      Lead
                    </Badge>
                  </div>

                  {/* Unread indicator */}
                  {conversation.isUnread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
