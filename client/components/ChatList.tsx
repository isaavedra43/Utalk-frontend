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
      {/* Header - More compact */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Conversaciones</h2>
          <div className="flex items-center gap-1">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "w-7 h-7 p-0 text-gray-400 hover:text-white",
                    showFilters && "bg-blue-600/20 text-blue-400",
                  )}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white p-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Filtros</h3>

                  {/* Unread Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">
                      Estado de lectura:
                    </label>
                    <Select
                      value={unreadFilter}
                      onValueChange={setUnreadFilter}
                    >
                      <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all" className="text-white text-xs">
                          Todos
                        </SelectItem>
                        <SelectItem
                          value="unread"
                          className="text-white text-xs"
                        >
                          Sin leer
                        </SelectItem>
                        <SelectItem value="read" className="text-white text-xs">
                          Leídos
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Canal:</label>
                    <Select
                      value={channelFilter}
                      onValueChange={setChannelFilter}
                    >
                      <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all" className="text-white text-xs">
                          Todos los canales
                        </SelectItem>
                        <SelectItem
                          value="whatsapp"
                          className="text-white text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3 text-green-500" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="facebook"
                          className="text-white text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Facebook className="h-3 w-3 text-blue-500" />
                            Facebook
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Filter */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Fecha:</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all" className="text-white text-xs">
                          Todas las fechas
                        </SelectItem>
                        <SelectItem
                          value="today"
                          className="text-white text-xs"
                        >
                          Hoy
                        </SelectItem>
                        <SelectItem value="week" className="text-white text-xs">
                          Esta semana
                        </SelectItem>
                        <SelectItem
                          value="month"
                          className="text-white text-xs"
                        >
                          Este mes
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear filters */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnreadFilter("all");
                      setChannelFilter("all");
                      setDateFilter("all");
                    }}
                    className="w-full h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="ghost"
              className="w-7 h-7 p-0 text-gray-400 hover:text-white"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search - More compact */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 text-xs"
          />
        </div>

        {/* Tabs - More compact */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 h-8">
            <TabsTrigger
              value="mine"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white h-6"
            >
              Míos
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-blue-600 text-white text-xs px-1 py-0 h-4"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="unassigned"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white h-6"
            >
              Sin asignar
              <Badge
                variant="secondary"
                className="ml-1 bg-gray-600 text-white text-xs px-1 py-0 h-4"
              >
                {unassignedCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white h-6"
            >
              Todos
              <Badge
                variant="secondary"
                className="ml-1 bg-gray-600 text-white text-xs px-1 py-0 h-4"
              >
                {mockConversations.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List - More compact */}
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {/* Show filter results count */}
          {(unreadFilter !== "all" ||
            channelFilter !== "all" ||
            dateFilter !== "all") && (
            <div className="px-2 py-1 text-xs text-gray-400">
              {filteredConversations.length} conversación
              {filteredConversations.length !== 1 ? "es" : ""} encontrada
              {filteredConversations.length !== 1 ? "s" : ""}
            </div>
          )}

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

          {/* Empty state */}
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No hay conversaciones</p>
              <p className="text-xs">que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
