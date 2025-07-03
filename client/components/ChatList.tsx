import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConversationItem } from "./ConversationItem";
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
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [isUnrepliedOnly, setIsUnrepliedOnly] = useState(false);

  // Counters
  const allCount = 1;
  const unassignedCount = 1;
  const newLeadCount = 1;

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
            className="w-full justify-between h-8 bg-gray-700/60 hover:bg-gray-700 text-white font-medium"
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
            className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Mine</span>
            </div>
          </Button>

          {/* Unassigned Tab */}
          <Button
            variant="ghost"
            className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
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
            className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
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
                  className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
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
                  className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm">Hot Lead</span>
                  </div>
                </Button>

                {/* Payment */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💵</span>
                    <span className="text-sm">Payment</span>
                  </div>
                </Button>

                {/* Customer */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white"
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

          {/* Separator */}
          <div className="border-t border-gray-700 my-2" />

          {/* Blocked Contacts (hidden by default) */}
          <Button
            variant="ghost"
            className="w-full justify-start h-8 hover:bg-gray-700/60 text-gray-400 hover:text-white hidden"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Blocked Contacts</span>
            </div>
          </Button>

          {/* Chat List when appropriate */}
          <div className="mt-4 space-y-1">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-2 rounded-lg hover:bg-gray-700/60 cursor-pointer transition-colors"
                onClick={() => onChatSelect?.(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        conversation.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${conversation.contactName}&background=6b7280&color=ffffff`
                      }
                      alt={conversation.contactName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">
                        {conversation.contactName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-500">✓</span>
                      <p className="text-xs text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <Badge className="bg-gray-700 text-gray-300 text-xs px-2 py-0 h-5">
                        📱 New Lead
                      </Badge>
                      {conversation.isUnread && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}