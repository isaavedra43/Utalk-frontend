import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  MessageCircle,
  Phone,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatListColumnProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
  selectedSection: string | null;
  className?: string;
}

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    contactName: "Mauricio Ás",
    lastMessage: "Buenas tardes. ¿En qué puedo ayudarte hoy?",
    timestamp: "2:01 PM",
    isUnread: false,
    isOutgoing: true,
    channel: "facebook" as const,
    lifecycleStage: "New Lead",
    avatarUrl:
      "https://cdn.respond.io/resize/app/contact/avatar/294091427.jpg?height=64&width=64",
    userAvatarUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocKZOlRON0_cmW4dznGNyYGSYNfXD8Oe8LLdGFECtk-tlfKFDA=s96-c",
  },
  {
    id: "2",
    contactName: "Israel Saavedra",
    lastMessage: "Hola",
    timestamp: "12:14 PM",
    isUnread: true,
    isOutgoing: false,
    channel: "facebook" as const,
    lifecycleStage: "New Lead",
    avatarUrl:
      "https://cdn.respond.io/resize/app/contact/avatar/294038878.jpg?height=64&width=64",
    userAvatarUrl: null,
  },
];

export function ChatListColumn({
  selectedChatId,
  onChatSelect,
  selectedSection,
  className,
}: ChatListColumnProps) {
  const [activeTab, setActiveTab] = useState("chats");
  const [isUnrepliedOnly, setIsUnrepliedOnly] = useState(false);

  // Don't show if no section is selected
  if (!selectedSection) {
    return null;
  }

  // Filter conversations based on section and filters
  const getFilteredConversations = () => {
    let filtered = mockConversations;

    // Filter by tab (chats vs calls)
    if (activeTab === "calls") {
      return [];
    }

    // Filter by unreplied only if toggle is on
    if (isUnrepliedOnly) {
      filtered = filtered.filter((conv) => conv.isUnread);
    }

    return filtered;
  };

  const conversations = getFilteredConversations();

  return (
    <div
      className={cn("flex flex-col", className)}
      style={{
        width: "360px",
        marginLeft: "16px",
        marginRight: "16px",
        fontFamily: "Inter, sans-serif",
        height: "100%",
      }}
    >
      {/* Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header with Tabs */}
        <div
          style={{
            height: "48px",
            background: "#252538",
            display: "flex",
            padding: "0 16px",
            alignItems: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab("chats")}
              className={cn(
                "flex-1 h-12 flex items-center justify-center cursor-pointer transition-colors relative",
              )}
              style={{
                color: activeTab === "chats" ? "#FFFFFF" : "#A0A0A0",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Chats
              {activeTab === "chats" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "3px",
                    background: "#4F8EF7",
                  }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("calls")}
              className={cn(
                "flex-1 h-12 flex items-center justify-center cursor-pointer transition-colors relative",
              )}
              style={{
                color: activeTab === "calls" ? "#FFFFFF" : "#A0A0A0",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Llamadas
              {activeTab === "calls" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "3px",
                    background: "#4F8EF7",
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            margin: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700 h-8"
            style={{ fontSize: "14px", padding: "4px 8px" }}
          >
            Abierto, Más Reciente
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="flex items-center gap-2">
              <Switch
                checked={isUnrepliedOnly}
                onCheckedChange={setIsUnrepliedOnly}
                className="data-[state=checked]:bg-blue-600"
                style={{ transform: "scale(0.8)" }}
              />
              <span
                className="text-gray-400"
                style={{ fontSize: "12px", whiteSpace: "nowrap" }}
              >
                Sin Responder
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 16px 16px 16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onChatSelect?.(conversation.id)}
                className={cn("cursor-pointer transition-all duration-200")}
                style={{
                  height: "72px",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#2E2E40",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#2A2A3C";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#2E2E40";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.avatarUrl ? (
                    <img
                      src={conversation.avatarUrl}
                      alt={conversation.contactName}
                      className="rounded-full object-cover"
                      style={{ width: "40px", height: "40px" }}
                    />
                  ) : (
                    <div
                      className="rounded-full bg-gray-600 flex items-center justify-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <span className="text-white text-sm font-medium">
                        {conversation.contactName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Channel indicator */}
                  <div
                    className="absolute bg-blue-500 rounded-full flex items-center justify-center"
                    style={{
                      width: "18px",
                      height: "18px",
                      bottom: "-4px",
                      right: "-4px",
                      border: "2px solid #1E1E2F",
                    }}
                  >
                    {conversation.channel === "facebook" && (
                      <img
                        src="https://cdn.respond.io/platform/web/assets/static/images/channels/circle/64/facebook.webp"
                        alt="Facebook"
                        style={{
                          width: "13px",
                          height: "13px",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top row: Name and timestamp */}
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="truncate"
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#FFFFFF",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {conversation.contactName}
                    </h3>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#A0A0A0",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {conversation.timestamp}
                    </span>
                  </div>

                  {/* Message with direction icon */}
                  <div className="flex items-center gap-2 mb-1">
                    {/* Direction icon */}
                    <div className="flex-shrink-0">
                      {conversation.isOutgoing ? (
                        <svg
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#4F8EF7",
                          }}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M5,17.59L15.59,7H9V5H19V15H17V8.41L6.41,19L5,17.59Z" />
                        </svg>
                      ) : (
                        <svg
                          style={{
                            width: "16px",
                            height: "16px",
                            color: "#FFA024",
                          }}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19,6.41L17.59,5L7,15.59V9H5V19H15V17H8.41L19,6.41Z" />
                        </svg>
                      )}
                    </div>

                    <p
                      className="truncate flex-1"
                      style={{
                        fontSize: "14px",
                        color: "#C0C0C0",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {/* Bottom row: Badges and indicators */}
                  <div className="flex items-center justify-between">
                    {/* Left side: Lifecycle Badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Badge
                        style={{
                          background: "#16171B",
                          color: "#FFFFFF",
                          fontSize: "10px",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        🆕 {conversation.lifecycleStage}
                      </Badge>

                      {/* WhatsApp or other channel badge if needed */}
                    </div>

                    {/* Right side: User avatar or indicators */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {/* User avatar for outgoing messages */}
                      {conversation.isOutgoing &&
                        conversation.userAvatarUrl && (
                          <img
                            src={conversation.userAvatarUrl}
                            alt="User Avatar"
                            className="rounded-full object-cover"
                            style={{ width: "20px", height: "20px" }}
                          />
                        )}

                      {/* Unread indicator */}
                      {conversation.isUnread && !conversation.isOutgoing && (
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: "20px",
                            height: "20px",
                            background: "#EF476F",
                          }}
                        >
                          <span
                            className="text-white font-bold"
                            style={{ fontSize: "10px" }}
                          >
                            !
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
