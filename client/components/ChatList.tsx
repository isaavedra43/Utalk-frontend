import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConversationItem } from "./ConversationItem";
import {
  Search,
  Filter,
  MoreHorizontal,
  Pin,
  MessageCircle,
  Facebook,
  Calendar,
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
    contactName: "GRUPO ALCON",
    lastMessage:
      "¡Gracias por la respuesta rápida! ¿Cuándo podemos esperar el envío?",
    timestamp: "hace 8h",
    isUnread: true,
    isPinned: true,
    tag: "order" as const,
    channel: "whatsapp" as "whatsapp" | "facebook",
    date: "2024-01-15",
    avatarUrl: undefined,
  },
  {
    id: "2",
    contactName: "TechCorp Solutions",
    lastMessage:
      "La integración funciona perfectamente ahora. ¡Excelente soporte!",
    timestamp: "hace 12h",
    isUnread: false,
    isPinned: false,
    tag: "support" as const,
    channel: "facebook" as "whatsapp" | "facebook",
    date: "2024-01-15",
  },
  {
    id: "3",
    contactName: "Global Logistics Inc",
    lastMessage: "¿Podrías actualizarme sobre el estado de la entrega?",
    timestamp: "hace 1d",
    isUnread: true,
    isPinned: false,
    tag: "order" as const,
    channel: "whatsapp" as "whatsapp" | "facebook",
    date: "2024-01-14",
  },
  {
    id: "4",
    contactName: "Innovation Labs",
    lastMessage:
      "Estamos interesados en explorar funciones adicionales para nuestra suscripción.",
    timestamp: "hace 2d",
    isUnread: false,
    isPinned: false,
    channel: "facebook" as "whatsapp" | "facebook",
    date: "2024-01-13",
  },
  {
    id: "5",
    contactName: "Metro Enterprises",
    lastMessage:
      "La demo fue impresionante. Programemos una reunión de seguimiento.",
    timestamp: "hace 3d",
    isUnread: false,
    isPinned: false,
    channel: "whatsapp" as "whatsapp" | "facebook",
    date: "2024-01-12",
  },
  {
    id: "6",
    contactName: "Digital Dynamics",
    lastMessage:
      "Teniendo problemas con la integración de API. ¿Puedes ayudar?",
    timestamp: "hace 4d",
    isUnread: true,
    isPinned: false,
    tag: "support" as const,
    channel: "facebook" as "whatsapp" | "facebook",
    date: "2024-01-11",
  },
];

export function ChatList({
  selectedChatId,
  onChatSelect,
  className,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState("all"); // "all", "unread", "read"
  const [channelFilter, setChannelFilter] = useState("all"); // "all", "whatsapp", "facebook"
  const [dateFilter, setDateFilter] = useState("all"); // "all", "today", "week", "month"

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "mine" && conv.isUnread) ||
      (activeTab === "unassigned" && !conv.isUnread);

    const matchesUnread =
      unreadFilter === "all" ||
      (unreadFilter === "unread" && conv.isUnread) ||
      (unreadFilter === "read" && !conv.isUnread);

    const matchesChannel =
      channelFilter === "all" || conv.channel === channelFilter;

    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const today = new Date();
      const convDate = new Date(conv.date);

      switch (dateFilter) {
        case "today":
          return convDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return convDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return convDate >= monthAgo;
        default:
          return true;
      }
    })();

    return (
      matchesSearch &&
      matchesTab &&
      matchesUnread &&
      matchesChannel &&
      matchesDate
    );
  });

  const unreadCount = mockConversations.filter((conv) => conv.isUnread).length;
  const unassignedCount = mockConversations.filter(
    (conv) => !conv.isUnread,
  ).length;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-gray-900 border-r border-gray-800",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="mine"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Mine
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="unassigned"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Unassigned
              <Badge
                variant="secondary"
                className="ml-1 bg-gray-600 text-white text-xs px-1.5 py-0"
              >
                {unassignedCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              All
              <Badge
                variant="secondary"
                className="ml-1 bg-gray-600 text-white text-xs px-1.5 py-0"
              >
                {mockConversations.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Pinned conversations first */}
          {filteredConversations
            .filter((conv) => conv.isPinned)
            .map((conversation) => (
              <div key={`pinned-${conversation.id}`} className="relative">
                <Pin className="absolute -left-1 top-1 h-3 w-3 text-amber-500 z-10" />
                <ConversationItem
                  {...conversation}
                  isActive={selectedChatId === conversation.id}
                  onClick={() => onChatSelect?.(conversation.id)}
                />
              </div>
            ))}

          {/* Regular conversations */}
          {filteredConversations
            .filter((conv) => !conv.isPinned)
            .map((conversation) => (
              <ConversationItem
                key={conversation.id}
                {...conversation}
                isActive={selectedChatId === conversation.id}
                onClick={() => onChatSelect?.(conversation.id)}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
