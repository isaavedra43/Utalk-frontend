import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageBubble } from "./MessageBubble";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Mic,
  Square,
  Package,
  Settings,
  Eye,
  EyeOff,
  FileText,
  MessageCircle,
  Facebook,
  Search,
  Hash,
  Megaphone,
  Zap,
  Clock,
  CheckCircle,
  Star,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  chatId?: string;
  className?: string;
}

// Mock conversation data
const mockConversation = {
  id: "1",
  contactName: "GRUPO ALCON",
  tag: "order" as const,
  status: "open",
  messages: [
    {
      id: "1",
      content:
        "Hi there! I wanted to check on the status of order #AL-2024-0123. When can we expect delivery?",
      sender: "client" as const,
      timestamp: "2:30 PM",
      status: "read" as const,
      senderName: "Carlos Martinez",
    },
    {
      id: "2",
      content:
        "Hello Carlos! Thank you for reaching out. Let me check the details of your order right away.",
      sender: "agent" as const,
      timestamp: "2:32 PM",
      status: "read" as const,
      senderName: "Sarah Chen",
    },
    {
      id: "3",
      content:
        "I've reviewed your order and it's currently in our fulfillment center. The estimated delivery date is March 15th, 2024. You'll receive tracking information once it ships.",
      sender: "agent" as const,
      timestamp: "2:35 PM",
      status: "read" as const,
      senderName: "Sarah Chen",
    },
    {
      id: "4",
      content:
        "That's perfect timing! Thanks for the quick response. One more question - is there any way to expedite shipping if needed?",
      sender: "client" as const,
      timestamp: "2:38 PM",
      status: "read" as const,
      senderName: "Carlos Martinez",
    },
    {
      id: "5",
      content:
        "Absolutely! We offer expedited shipping options. Let me check what's available for your location and get back to you with pricing options.",
      sender: "agent" as const,
      timestamp: "2:40 PM",
      status: "delivered" as const,
      senderName: "Sarah Chen",
    },
  ],
};

export function ChatView({ chatId, className }: ChatViewProps) {
  const [message, setMessage] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Here you would typically send the message to your backend
    console.log("Sending message:", message, "Private note:", isPrivateNote);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement audio recording logic
  };

  if (!chatId) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-center bg-gray-950",
          className,
        )}
      >
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Package className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium mb-2">No conversation selected</p>
          <p className="text-sm">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const TagIcon = mockConversation.tag === "order" ? Package : Settings;

  return (
    <div className={cn("h-full flex flex-col bg-gray-950", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-700 text-gray-300">
              CA
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">
                {mockConversation.contactName}
              </h3>
              <TagIcon className="h-4 w-4 text-gray-400" />
              <Badge
                variant="outline"
                className="border-green-500 text-green-400 text-xs"
              >
                {mockConversation.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              Customer • Last seen 5 minutes ago
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-gray-800 border-gray-700"
          >
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              Resolve
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              Assign to Agent
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              Add to Priority
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
              Close Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {mockConversation.messages.map((msg) => (
            <MessageBubble key={msg.id} {...msg} />
          ))}

          {/* Typing indicator */}
          <MessageBubble
            id="typing"
            content=""
            sender="client"
            timestamp=""
            senderName="Carlos Martinez"
            isTyping={true}
          />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        {/* Private note toggle */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={isPrivateNote ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPrivateNote(!isPrivateNote)}
            className={cn(
              "text-xs",
              isPrivateNote
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "text-gray-400 hover:text-white",
            )}
          >
            {isPrivateNote ? (
              <EyeOff className="h-3 w-3 mr-1" />
            ) : (
              <Eye className="h-3 w-3 mr-1" />
            )}
            Private Note
          </Button>
          {isPrivateNote && (
            <span className="text-xs text-amber-400">
              Only visible to agents
            </span>
          )}
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder={
                isPrivateNote ? "Add a private note..." : "Type a message..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className={cn(
                "pr-20 resize-none min-h-[40px] border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500",
                isPrivateNote
                  ? "bg-amber-950/30 border-amber-600/30"
                  : "bg-gray-800",
              )}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            className={cn(
              "p-2",
              isRecording
                ? "text-red-400 hover:text-red-300"
                : "text-gray-400 hover:text-white",
            )}
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{message.length} characters</span>
        </div>
      </div>
    </div>
  );
}
