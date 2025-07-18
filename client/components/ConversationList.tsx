import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageCircle, Phone, Mail } from "lucide-react";

interface Conversation {
  id: string;
  contactName: string;
  channel: "whatsapp" | "email" | "sms" | "facebook" | "instagram" | "telegram";
  lastMessage: string;
  timestamp: string;
  date: string;
  section: string;
  isUnread: boolean;
  avatarUrl?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelect?: (conversationId: string) => void;
  className?: string;
  hideSection?: boolean;
}

const channelColors = {
  whatsapp: "text-green-400",
  facebook: "text-blue-400",
  instagram: "text-pink-400",
  telegram: "text-blue-500",
  email: "text-blue-400",
  sms: "text-blue-400",
};

const channelNames = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "Email",
  sms: "SMS",
};

const channelIcons = {
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  instagram: MessageCircle,
  telegram: MessageCircle,
  email: Mail,
  sms: MessageCircle,
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelect,
  className,
  hideSection = false,
}: ConversationListProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Mobile carousel layout
  if (isMobile && conversations.length > 0) {
    return (
      <div
        className={cn("conversation-cards-container bg-[#1F1F25]", className)}
      >
        <div className="mobile-conversation-carousel">
          {conversations.map((conversation) => {
            const ChannelIcon = channelIcons[conversation.channel];
            const isSelected = selectedConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "mobile-conversation-card conversation-card cursor-pointer transition-all duration-200",
                  isSelected &&
                    "border-2 border-[#3178C6] ring-2 ring-blue-500/20",
                )}
                onClick={() => onSelect?.(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {conversation.avatarUrl ? (
                      <img
                        src={conversation.avatarUrl}
                        alt={conversation.contactName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {conversation.contactName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1E1E2D] rounded-full flex items-center justify-center border border-gray-700">
                      <ChannelIcon
                        className={cn(
                          "w-2.5 h-2.5",
                          channelColors[conversation.channel],
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">
                      {conversation.contactName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={cn(
                          "text-xs",
                          channelColors[conversation.channel],
                        )}
                      >
                        {channelNames[conversation.channel]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                  {conversation.isUnread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop vertical layout
  return (
    <div
      className={cn(
        "h-full bg-[#1F1F25] relative conversation-cards-container",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm text-center">
                No hay conversaciones disponibles
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const ChannelIcon = channelIcons[conversation.channel];
              const isSelected = selectedConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "conversation-card block w-full p-4 mb-3 bg-[#1F1F25] border border-[#333] rounded-lg cursor-pointer transition-all duration-200",
                    "hover:bg-[#2E2E42] hover:shadow-xl hover:border-[#444]",
                    "shadow-lg ring-1 ring-gray-800/50",
                    isSelected &&
                      "border-2 border-[#3178C6] bg-[#2E2E42] shadow-xl ring-2 ring-blue-500/20",
                  )}
                  style={{
                    boxShadow: isSelected
                      ? "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.3)"
                      : "0 4px 12px -2px rgba(0, 0, 0, 0.3), 0 2px 6px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  onClick={() => onSelect?.(conversation.id)}
                >
                  {/* Top row - Section and timestamp */}
                  {!hideSection && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#AAA]">
                        {conversation.section}
                      </span>
                      <span className="text-sm text-[#CCC]">
                        {conversation.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Middle row - Avatar and contact info */}
                  <div className="flex items-center gap-3 mb-2">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conversation.avatarUrl ? (
                        <img
                          src={conversation.avatarUrl}
                          alt={conversation.contactName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {conversation.contactName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Channel indicator overlay */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1E1E2D] rounded-full flex items-center justify-center border border-gray-700">
                        <ChannelIcon
                          className={cn(
                            "w-2.5 h-2.5",
                            channelColors[conversation.channel],
                          )}
                        />
                      </div>
                    </div>

                    {/* Contact info column */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-base font-medium truncate">
                        {conversation.contactName}
                      </h3>
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          channelColors[conversation.channel],
                        )}
                      >
                        {channelNames[conversation.channel]}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {conversation.isUnread && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>

                  {/* Bottom row - Last message */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[#DDD] text-sm flex-1 truncate"
                      title={conversation.lastMessage}
                    >
                      {conversation.lastMessage}
                    </p>

                    {/* Show timestamp on mobile when section is hidden */}
                    {hideSection && (
                      <span className="text-sm text-[#CCC] ml-2 flex-shrink-0">
                        {conversation.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
