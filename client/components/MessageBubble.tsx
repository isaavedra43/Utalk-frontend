import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Play,
} from "lucide-react";

interface MessageBubbleProps {
  id: string;
  content: string;
  sender: "agent" | "client";
  timestamp: string;
  status?: "sent" | "delivered" | "read" | "error";
  type?: "text" | "image" | "audio" | "file";
  fileUrl?: string;
  fileName?: string;
  senderName?: string;
  senderAvatar?: string;
  isTyping?: boolean;
}

export function MessageBubble({
  id,
  content,
  sender,
  timestamp,
  status = "read",
  type = "text",
  fileUrl,
  fileName,
  senderName,
  senderAvatar,
  isTyping = false,
}: MessageBubbleProps) {
  const isAgent = sender === "agent";

  const StatusIcon = () => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const renderContent = () => {
    if (isTyping) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
          <span className="text-gray-400 text-sm ml-2">typing...</span>
        </div>
      );
    }

    switch (type) {
      case "image":
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img
                src={fileUrl || "/placeholder.svg"}
                alt="Shared image"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {content && <p className="text-sm">{content}</p>}
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 max-w-xs">
            <button className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
              <Play className="h-4 w-4 text-white fill-white" />
            </button>
            <div className="flex-1">
              <div className="h-1 bg-gray-600 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                0:24 / 1:12
              </span>
            </div>
          </div>
        );
      case "file":
        return (
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 max-w-xs">
            <FileText className="h-8 w-8 text-blue-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {fileName || "Document.pdf"}
              </p>
              <p className="text-xs text-gray-400">245 KB</p>
            </div>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Download className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isAgent ? "justify-end" : "justify-start",
      )}
    >
      {!isAgent && (
        <Avatar className="h-8 w-8 mt-auto">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
            {senderName?.charAt(0) || "C"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[70%] space-y-1",
          isAgent ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isAgent
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-gray-800 text-gray-100 rounded-bl-md",
          )}
        >
          {renderContent()}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-xs text-gray-500",
            isAgent ? "justify-end" : "justify-start",
          )}
        >
          <span>{timestamp}</span>
          {isAgent && <StatusIcon />}
        </div>
      </div>

      {isAgent && (
        <Avatar className="h-8 w-8 mt-auto">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {senderName?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
