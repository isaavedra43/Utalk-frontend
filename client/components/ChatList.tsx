import { useState } from "react";
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
    lastMessage: "Hola",
    timestamp: "12:14 PM",
    isUnread: true,
    isPinned: false,
    tag: "new-lead" as const,
    channel: "facebook" as "whatsapp" | "facebook",
    date: "2024-01-15",
    avatarUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F2d1f4aff150c46d2aa10d890d5bc0fca%2Fac493c187ef4459383661e17488cac3a?format=webp&width=800",
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

  // Counters
  const allCount = 1;
  const unassignedCount = 1;
  const newLeadCount = 1;

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId);
  };

  return (
    <div className={cn("h-full flex bg-gray-900", className)}>
      {/* Inbox Sidebar */}
      <div className="w-64 min-w-[256px] max-w-[256px] flex flex-col border-r border-gray-800">
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
                <span className="text-sm">All</span>
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
                <span className="text-sm">Mine</span>
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
                <span className="text-sm">Unassigned</span>
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
                <span className="text-sm">Incoming Calls</span>
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
                    <span className="text-xs font-medium">Lifecycle</span>
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
        <div className="w-80 min-w-[320px] max-w-[320px] flex flex-col border-r border-gray-800">
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
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {mockConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors relative",
                    selectedChatId === conversation.id
                      ? "bg-gray-700/60"
                      : "hover:bg-gray-700/40",
                  )}
                  onClick={() => onChatSelect?.(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conversation.avatarUrl}
                        alt={conversation.contactName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-2 h-2 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {conversation.contactName}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {conversation.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-yellow-500 text-xs">✓</span>
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className="bg-gray-800 text-gray-300 text-xs px-2 py-0 h-5 flex items-center gap-1">
                          <span>🆕</span>
                          New Lead
                        </Badge>
                        {conversation.isUnread && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state for sections without conversations */}
              {selectedSection !== "all" && selectedSection !== "new-lead" && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <MessageCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">
                    No conversations in this section
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
