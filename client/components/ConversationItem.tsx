import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Package, Settings } from "lucide-react";

interface ConversationItemProps {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  isUnread?: boolean;
  isPinned?: boolean;
  tag?: "order" | "support";
  avatarUrl?: string;
  onClick?: () => void;
}

export function ConversationItem({
  id,
  contactName,
  lastMessage,
  timestamp,
  isActive = false,
  isUnread = false,
  isPinned = false,
  tag,
  avatarUrl,
  onClick,
}: ConversationItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const TagIcon = tag === "order" ? Package : Settings;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group hover:bg-gray-800/50",
        isActive && "bg-blue-600/20 border border-blue-600/30",
        isPinned && "border-l-2 border-l-amber-500",
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={contactName} />
          <AvatarFallback className="bg-gray-700 text-gray-300 text-sm">
            {getInitials(contactName)}
          </AvatarFallback>
        </Avatar>
        {isUnread && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-gray-900"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={cn(
              "text-sm font-medium truncate",
              isUnread ? "text-white" : "text-gray-300",
            )}
          >
            {contactName}
          </h4>
          <div className="flex items-center gap-1">
            {tag && <TagIcon className="h-3 w-3 text-gray-400" />}
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timestamp}
            </span>
          </div>
        </div>
        <p
          className={cn(
            "text-xs truncate",
            isUnread ? "text-gray-300" : "text-gray-400",
          )}
        >
          {lastMessage}
        </p>
      </div>

      {isUnread && (
        <Badge
          variant="secondary"
          className="bg-blue-600 text-white text-xs px-2 py-0.5"
        >
          New
        </Badge>
      )}
    </div>
  );
}
