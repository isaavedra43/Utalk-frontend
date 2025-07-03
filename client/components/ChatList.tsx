import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Plus,
  MessageCircle,
  Phone,
  Users,
  Settings,
  Archive,
  Star,
  Flame,
  DollarSign,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationList } from "./ConversationList";

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  className?: string;
}

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    contactName: "Israel Saavedra",
    lastMessage:
      "Hola, ¿cómo está el estado de mi pedido #AL-2024-0123? ¿Cuándo podemos esperar la entrega?",
    timestamp: "12:14 PM",
    date: "2024-01-15",
    section: "Inbox > Chats",
    isUnread: true,
    channel: "facebook" as const,
    avatarUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F2d1f4aff150c46d2aa10d890d5bc0fca%2Fac493c187ef4459383661e17488cac3a?format=webp&width=800",
  },
  {
    id: "2",
    contactName: "María González",
    lastMessage:
      "Gracias por la información. ¿Podrían enviarme el catálogo completo?",
    timestamp: "11:45 AM",
    date: "2024-01-15",
    section: "Inbox > Chats",
    isUnread: false,
    channel: "whatsapp" as const,
    avatarUrl: undefined,
  },
  {
    id: "3",
    contactName: "Carlos Rodriguez",
    lastMessage:
      "Perfecto, ¡gracias por la respuesta rápida! Una pregunta más - ¿hay alguna forma de acelerar el envío si es necesario?",
    timestamp: "2:38 PM",
    date: "2024-01-14",
    section: "Inbox > Chats",
    isUnread: true,
    channel: "email" as const,
    avatarUrl: undefined,
  },
  {
    id: "4",
    contactName: "Ana Morales",
    lastMessage: "Recibido, procedo con el pago",
    timestamp: "Yesterday",
    date: "2024-01-14",
    section: "Inbox > Chats",
    isUnread: false,
    channel: "sms" as const,
    avatarUrl: undefined,
  },
];

export function ChatList({
  selectedChatId,
  onChatSelect,
  className,
}: ChatListProps) {
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(true);
  const [isTeamInboxOpen, setIsTeamInboxOpen] = useState(false);
  const [isCustomInboxOpen, setIsCustomInboxOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>("all");
  const [activeTab, setActiveTab] = useState("chats");
  const [isUnrepliedOnly, setIsUnrepliedOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Counters
  const allCount = 1;
  const unassignedCount = 1;
  const newLeadCount = 1;

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId);
  };

  // Filter conversations based on selected section and tab
  const getFilteredConversations = () => {
    if (!selectedSection) return [];

    let filtered = mockConversations;

    // Filter by tab (chats vs calls)
    if (activeTab === "calls") {
      // For now, return empty for calls tab since we only have chat conversations
      return [];
    }

    // Filter by section
    switch (selectedSection) {
      case "mine":
        // Filter conversations assigned to current user
        filtered = filtered.filter((conv) => conv.section.includes("Mine"));
        break;
      case "unassigned":
        // Filter unassigned conversations
        filtered = filtered.filter((conv) =>
          conv.section.includes("Unassigned"),
        );
        break;
      case "new-lead":
        // Filter new lead conversations
        filtered = filtered.filter((conv) => conv.section.includes("New Lead"));
        break;
      case "hot-lead":
        // Filter hot lead conversations
        filtered = filtered.filter((conv) => conv.section.includes("Hot Lead"));
        break;
      case "payment":
        // Filter payment conversations
        filtered = filtered.filter((conv) => conv.section.includes("Payment"));
        break;
      case "customer":
        // Filter customer conversations
        filtered = filtered.filter((conv) => conv.section.includes("Customer"));
        break;
      case "calls":
        // Filter call conversations
        filtered = filtered.filter((conv) => conv.section.includes("Calls"));
        break;
      case "all":
      default:
        // Return all conversations for "all" section
        break;
    }

    // Filter by unreplied only if toggle is on
    if (isUnrepliedOnly) {
      filtered = filtered.filter((conv) => conv.isUnread);
    }

    return filtered;
  };

  return (
    <div className={cn("h-full flex bg-gray-900 relative", className)}>
      {/* Inbox Sidebar */}
      <div className="w-64 min-w-[256px] max-w-[256px] flex flex-col border-r border-gray-800 bg-[#1F1F25] z-20 relative shadow-lg">
        {/* Header */}
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">Inbox</h2>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="w-7 h-7 p-0 text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-7 h-7 p-0 text-gray-400 hover:text-white"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-2 py-2 space-y-1">
            {/* All Tab */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("all")}
              className={cn(
                "w-full justify-between h-8 hover:bg-gray-700 text-white font-medium",
                selectedSection === "all"
                  ? "bg-gray-700/60"
                  : "hover:bg-gray-700/60",
              )}
            >
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span className="text-sm">Todos</span>
              </div>
              <Badge className="bg-gray-600 text-white text-xs px-2 py-0 h-5">
                {allCount}
              </Badge>
            </Button>

            {/* Mine Tab */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("mine")}
              className={cn(
                "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                selectedSection === "mine" ? "bg-gray-700/60 text-white" : "",
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Míos</span>
              </div>
            </Button>

            {/* Unassigned Tab */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("unassigned")}
              className={cn(
                "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                selectedSection === "unassigned"
                  ? "bg-gray-700/60 text-white"
                  : "",
              )}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Sin Asignar</span>
              </div>
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0 h-5">
                {unassignedCount}
              </Badge>
            </Button>

            {/* Incoming Calls */}
            <Button
              variant="ghost"
              onClick={() => handleSectionClick("calls")}
              className={cn(
                "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                selectedSection === "calls" ? "bg-gray-700/60 text-white" : "",
              )}
            >
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Llamadas Entrantes</span>
              </div>
            </Button>

            {/* Lifecycle Section */}
            <div className="mt-4">
              <Collapsible
                open={isLifecycleOpen}
                onOpenChange={setIsLifecycleOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                  >
                    <span className="text-xs font-medium">Ciclo de Vida</span>
                    {isLifecycleOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {/* New Lead */}
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionClick("new-lead")}
                    className={cn(
                      "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                      selectedSection === "new-lead"
                        ? "bg-gray-700/60 text-white"
                        : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🆕</span>
                      <span className="text-sm">New Lead</span>
                    </div>
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-0 h-5">
                      {newLeadCount}
                    </Badge>
                  </Button>

                  {/* Hot Lead */}
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionClick("hot-lead")}
                    className={cn(
                      "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                      selectedSection === "hot-lead"
                        ? "bg-gray-700/60 text-white"
                        : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm">Hot Lead</span>
                    </div>
                  </Button>

                  {/* Payment */}
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionClick("payment")}
                    className={cn(
                      "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                      selectedSection === "payment"
                        ? "bg-gray-700/60 text-white"
                        : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">💵</span>
                      <span className="text-sm">Payment</span>
                    </div>
                  </Button>

                  {/* Customer */}
                  <Button
                    variant="ghost"
                    onClick={() => handleSectionClick("customer")}
                    className={cn(
                      "w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                      selectedSection === "customer"
                        ? "bg-gray-700/60 text-white"
                        : "",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤩</span>
                      <span className="text-sm">Customer</span>
                    </div>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Team Inbox Section */}
            <div className="mt-4">
              <Collapsible
                open={isTeamInboxOpen}
                onOpenChange={setIsTeamInboxOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                  >
                    <span className="text-xs font-medium">Team Inbox</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 text-gray-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      {isTeamInboxOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 px-2">
                  <div className="text-xs text-gray-500 py-2">
                    No inboxes created
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Custom Inbox Section */}
            <div className="mt-4">
              <Collapsible
                open={isCustomInboxOpen}
                onOpenChange={setIsCustomInboxOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                  >
                    <span className="text-xs font-medium">Custom Inbox</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 text-gray-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      {isCustomInboxOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 px-2">
                  <div className="text-xs text-gray-500 py-2">
                    No inboxes created
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Conversations Panel */}
      {selectedSection && (
        <div className="w-80 min-w-[320px] max-w-[320px] flex flex-col border-r border-gray-800 bg-[#1F1F25] z-15 relative shadow-lg ml-4">
          {/* Header with Tabs */}
          <div className="border-b border-gray-800">
            {/* Tab Navigation */}
            <div className="flex h-11 border-b border-gray-700/50">
              <button
                onClick={() => setActiveTab("chats")}
                className={cn(
                  "flex-1 px-3 text-sm font-medium relative transition-colors",
                  activeTab === "chats"
                    ? "text-blue-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Chats
                {activeTab === "chats" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("calls")}
                className={cn(
                  "flex-1 px-3 text-sm font-medium relative transition-colors",
                  activeTab === "calls"
                    ? "text-blue-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-white",
                )}
              >
                Calls
              </button>
            </div>

            {/* Controls */}
            <div className="p-3 space-y-3">
              {/* Separator */}
              <div className="h-px bg-gray-700/50" />

              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/60"
                  >
                    Open, Newest
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isUnrepliedOnly}
                      onCheckedChange={setIsUnrepliedOnly}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-xs text-gray-400">Unreplied</span>
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
          </div>

          {/* Conversations List */}
          <ConversationList
            conversations={getFilteredConversations()}
            selectedConversationId={selectedChatId}
            onSelect={onChatSelect}
            className="flex-1"
            hideSection={isMobile} // Hide section on mobile
          />
        </div>
      )}
    </div>
  );
}
