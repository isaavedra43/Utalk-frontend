import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, MoreHorizontal, ChevronDown } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  channel: "whatsapp" | "email" | "facebook";
}

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
  className?: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "María González",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    lastMessage: "¿Podrían enviarme más información sobre el producto?",
    timestamp: "10:30",
    unreadCount: 2,
    channel: "whatsapp",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    lastMessage: "Gracias por la respuesta, me ayudó mucho",
    timestamp: "09:45",
    unreadCount: 0,
    channel: "email",
  },
  {
    id: "3",
    name: "Ana Martínez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
    lastMessage: "¿Tienen disponibilidad para mañana?",
    timestamp: "09:12",
    unreadCount: 1,
    channel: "facebook",
  },
  {
    id: "4",
    name: "Luis Fernández",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luis",
    lastMessage: "Perfecto, nos vemos el viernes entonces",
    timestamp: "Ayer",
    unreadCount: 0,
    channel: "whatsapp",
  },
  {
    id: "5",
    name: "Carmen López",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carmen",
    lastMessage: "¿Podrían llamarme cuando tengan un momento?",
    timestamp: "Ayer",
    unreadCount: 3,
    channel: "email",
  },
];

const channelColors = {
  whatsapp: "#25D366",
  email: "#4285F4",
  facebook: "#1877F2",
};

const channelLabels = {
  whatsapp: "WhatsApp",
  email: "Email",
  facebook: "Facebook",
};

export function InboxList({
  selectedConversationId,
  onConversationSelect,
  className,
}: InboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todas");

  const filters = ["Todas", "Sin asignar", "Con etiqueta", "Favoritos"];

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={cn("h-full flex flex-col", className)}
      style={{ width: "300px", background: "#1F1F23" }}
    >
      {/* Header */}
      <div
        style={{ height: "64px", padding: "0 16px", background: "#1F1F23" }}
        className="flex items-center border-b border-gray-800"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversación…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#2C2C32] text-[#E0E0E0] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderRadius: "8px", padding: "8px 8px 8px 36px" }}
          />
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A8] cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Quick Filters */}
      <div
        className="px-4 py-3 border-b border-gray-800"
        style={{ height: "40px", display: "flex", alignItems: "center" }}
      >
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors",
                selectedFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-[#2C2C32] text-[#E0E0E0] hover:bg-[#34343A]",
              )}
              style={{
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "6px",
                background: selectedFilter === filter ? "#4A90E2" : "#2C2C32",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2" style={{ gap: "8px" }}>
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all duration-150",
              selectedConversationId === conversation.id
                ? "bg-[#34343A] border-l-4 border-l-[#4A90E2]"
                : "bg-[#2C2C32] hover:bg-[#34343A]",
            )}
            style={{
              height: "72px",
              padding: "8px 12px",
              marginBottom: "8px",
              borderRadius: "8px",
            }}
          >
            <div className="flex items-center gap-3 h-full">
              {/* Avatar */}
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="rounded-full"
                style={{ width: "40px", height: "40px" }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* First Line: Name + Channel */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-bold text-white truncate"
                    style={{ fontSize: "16px" }}
                  >
                    {conversation.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor: channelColors[conversation.channel],
                      fontSize: "10px",
                    }}
                  >
                    {channelLabels[conversation.channel]}
                  </span>
                </div>

                {/* Second Line: Last Message */}
                <p
                  className="text-[#C0C0C8] truncate"
                  style={{ fontSize: "14px" }}
                >
                  {conversation.lastMessage}
                </p>
              </div>

              {/* Right Side: Timestamp + Unread Badge */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#80808A]" style={{ fontSize: "12px" }}>
                  {conversation.timestamp}
                </span>
                {conversation.unreadCount > 0 && (
                  <div
                    className="bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
                    style={{
                      width: "16px",
                      height: "16px",
                      fontSize: "10px",
                    }}
                  >
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
