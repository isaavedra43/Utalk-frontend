import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  MessageSquare,
  Users,
  Search,
  Send,
  Paperclip,
  Mic,
  Image,
  FileText,
  Smile,
  MoreVertical,
  Pin,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit,
  Download,
  Share2,
  BookOpen,
  Phone,
  VideoIcon,
  Monitor,
  Bell,
  BellOff,
  UserPlus,
  Crown,
  Shield,
  Eye,
  EyeOff,
  CheckCheck,
  Clock,
  Heart,
  ThumbsUp,
  Laugh,
  AlertCircle,
  Zap,
  Brain,
  Languages,
  Calendar,
  Bot,
  Award,
  Target,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RealTimeCollaborationProps {
  className?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  pinnedMessages: string[];
  admins: string[];
  moderators: string[];
  createdAt: string;
  description?: string;
  avatar?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "busy" | "offline";
  role: "admin" | "moderator" | "member";
  isTyping?: boolean;
  lastSeen?: string;
  department?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file" | "audio" | "video" | "system";
  replyTo?: string;
  reactions: Reaction[];
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: string;
  status: "sending" | "sent" | "delivered" | "read";
  mentions: string[];
  attachments?: Attachment[];
  aiSummary?: string;
  sentiment?: "positive" | "negative" | "neutral";
  translation?: { [lang: string]: string };
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface QuickResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  isKnowledgeBase: boolean;
}

// Mock data
const mockUsers: User[] = [
  {
    id: "user1",
    name: "María García",
    avatar: "https://via.placeholder.com/40/4F46E5/white?text=MG",
    status: "online",
    role: "admin",
    department: "Ventas",
  },
  {
    id: "user2",
    name: "Carlos López",
    avatar: "https://via.placeholder.com/40/EF4444/white?text=CL",
    status: "away",
    role: "moderator",
    isTyping: true,
    department: "Marketing",
  },
  {
    id: "user3",
    name: "Ana Rodríguez",
    avatar: "https://via.placeholder.com/40/10B981/white?text=AR",
    status: "online",
    role: "member",
    department: "Soporte",
  },
  {
    id: "current",
    name: "Israel Saavedra",
    avatar: "https://via.placeholder.com/40/8B5CF6/white?text=IS",
    status: "online",
    role: "admin",
    department: "Desarrollo",
  },
];

const mockRooms: ChatRoom[] = [
  {
    id: "room1",
    name: "Equipo de Ventas",
    type: "group",
    participants: mockUsers.slice(0, 3),
    lastMessage: {
      id: "msg1",
      senderId: "user1",
      content: "¿Alguien puede revisar el presupuesto del cliente X?",
      timestamp: "14:30",
      type: "text",
      reactions: [{ emoji: "👍", users: ["user2"], count: 1 }],
      isPinned: false,
      isEdited: false,
      status: "read",
      mentions: [],
    },
    unreadCount: 2,
    isOnline: true,
    pinnedMessages: [],
    admins: ["user1"],
    moderators: ["user2"],
    createdAt: "2024-01-01",
    description: "Chat principal del equipo de ventas",
  },
  {
    id: "room2",
    name: "Carlos López",
    type: "direct",
    participants: [mockUsers[1], mockUsers[3]],
    lastMessage: {
      id: "msg2",
      senderId: "user2",
      content: "Revisé el documento que enviaste, excelente trabajo 👏",
      timestamp: "13:45",
      type: "text",
      reactions: [{ emoji: "❤️", users: ["current"], count: 1 }],
      isPinned: false,
      isEdited: false,
      status: "read",
      mentions: [],
    },
    unreadCount: 0,
    isOnline: true,
    pinnedMessages: [],
    admins: [],
    moderators: [],
    createdAt: "2024-01-15",
  },
];

const mockMessages: Message[] = [
  {
    id: "msg1",
    senderId: "user1",
    content: "Buenos días equipo, ¿cómo van las actividades de hoy?",
    timestamp: "09:15",
    type: "text",
    reactions: [
      { emoji: "👋", users: ["user2", "user3"], count: 2 },
      { emoji: "☀️", users: ["current"], count: 1 },
    ],
    isPinned: true,
    isEdited: false,
    status: "read",
    mentions: [],
    sentiment: "positive",
  },
  {
    id: "msg2",
    senderId: "user2",
    content: "Todo bien por aquí, @israel ¿ya revisaste el informe de ayer?",
    timestamp: "09:18",
    type: "text",
    reactions: [],
    isPinned: false,
    isEdited: false,
    status: "read",
    mentions: ["current"],
    sentiment: "neutral",
  },
  {
    id: "msg3",
    senderId: "current",
    content:
      "Sí, está perfecto. Solo tengo una pequeña sugerencia en la sección 3.",
    timestamp: "09:20",
    type: "text",
    reactions: [{ emoji: "👍", users: ["user2"], count: 1 }],
    isPinned: false,
    isEdited: false,
    status: "read",
    mentions: [],
    sentiment: "positive",
  },
  {
    id: "msg4",
    senderId: "user3",
    content: "Adjunto el resumen de llamadas del cliente ABC para revisión",
    timestamp: "10:30",
    type: "file",
    reactions: [],
    isPinned: false,
    isEdited: false,
    status: "read",
    mentions: [],
    attachments: [
      {
        id: "file1",
        name: "Resumen_Cliente_ABC.pdf",
        type: "pdf",
        size: "2.4 MB",
        url: "#",
      },
    ],
    aiSummary:
      "Documento contiene información de contacto del cliente ABC, historial de llamadas y próximas acciones recomendadas.",
  },
];

const quickResponses: QuickResponse[] = [
  {
    id: "qr1",
    title: "Saludo profesional",
    content:
      "Buenos días, gracias por contactarnos. ¿En qué puedo ayudarte hoy?",
    category: "saludos",
    isKnowledgeBase: false,
  },
  {
    id: "qr2",
    title: "Información de precios",
    content:
      "Nuestros precios actuales están disponibles en la sección de productos. ¿Te interesa algún producto específico?",
    category: "precios",
    isKnowledgeBase: true,
  },
  {
    id: "qr3",
    title: "Escalación a supervisor",
    content:
      "Entiendo tu situación. Voy a contactar a mi supervisor para revisar tu caso y te respondo a la brevedad.",
    category: "escalacion",
    isKnowledgeBase: false,
  },
];

export function RealTimeCollaboration({
  className,
}: RealTimeCollaborationProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("room1");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>(mockUsers);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<string | null>(
    null,
  );
  const [showSentimentAlert, setShowSentimentAlert] = useState(false);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentRoom = mockRooms.find((room) => room.id === selectedRoom);

  // Simulate real-time features
  useEffect(() => {
    // Simulate typing indicators
    const typingInterval = setInterval(() => {
      const typingUser = mockUsers.find((u) => u.isTyping);
      if (typingUser) {
        setTypingUsers([typingUser.id]);
        setTimeout(() => setTypingUsers([]), 2000);
      }
    }, 5000);

    // Simulate auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => clearInterval(typingInterval);
  }, [messages]);

  // Disruptive Features Implementation
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: "current",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
      reactions: [],
      isPinned: false,
      isEdited: false,
      status: "sending",
      mentions: extractMentions(newMessage),
      sentiment: analyzeSentiment(newMessage),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setReplyingTo(null);

    // Auto-suggestion simulation
    setTimeout(() => {
      generateAutoSuggestions(message.content);
    }, 1000);

    console.log("Message sent:", message);
  };

  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@\w+/g);
    return mentions ? mentions.map((m) => m.substring(1)) : [];
  };

  const analyzeSentiment = (
    content: string,
  ): "positive" | "negative" | "neutral" => {
    const negativeWords = ["problema", "error", "mal", "terrible", "horrible"];
    const positiveWords = [
      "excelente",
      "perfecto",
      "genial",
      "bien",
      "gracias",
    ];

    const isNegative = negativeWords.some((word) =>
      content.toLowerCase().includes(word),
    );
    const isPositive = positiveWords.some((word) =>
      content.toLowerCase().includes(word),
    );

    if (isNegative) {
      setShowSentimentAlert(true);
      return "negative";
    }
    return isPositive ? "positive" : "neutral";
  };

  const generateAutoSuggestions = (content: string) => {
    // Simulate AI-powered response suggestions
    console.log("Generating auto-suggestions for:", content);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
          if (existingReaction) {
            if (existingReaction.users.includes("current")) {
              existingReaction.users = existingReaction.users.filter(
                (u) => u !== "current",
              );
              existingReaction.count--;
            } else {
              existingReaction.users.push("current");
              existingReaction.count++;
            }
            return {
              ...msg,
              reactions: msg.reactions.filter((r) => r.count > 0),
            };
          } else {
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                { emoji, users: ["current"], count: 1 },
              ],
            };
          }
        }
        return msg;
      }),
    );
  };

  const handlePinMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg,
      ),
    );
    console.log(`Message ${messageId} pin toggled`);
  };

  const handleTranslateMessage = (messageId: string, targetLang: string) => {
    // Simulate translation
    setCurrentTranslation(messageId);
    setTimeout(() => {
      console.log(`Translating message ${messageId} to ${targetLang}`);
      setCurrentTranslation(null);
    }, 2000);
  };

  const handleCreateReminder = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setSelectedMessage(messageId);
      setReminderDialogOpen(true);
    }
  };

  const handleScreenShare = () => {
    console.log("Starting screen share session");
  };

  const handleVideoCall = () => {
    console.log("Starting video call");
  };

  const filteredMessages = messages.filter(
    (msg) =>
      searchQuery === "" ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedMessages = messages.filter((msg) => msg.isPinned);

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden flex", className)}>
      {/* Left Sidebar - Chat Rooms */}
      <div className="w-80 border-r border-gray-800 bg-gray-900/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Colaboración</h2>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Active Users */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">En línea</h3>
          <div className="flex flex-wrap gap-2">
            {activeUsers
              .filter((u) => u.status === "online")
              .map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                  </div>
                  <span className="text-xs text-white hidden lg:block">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Chat Rooms List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {mockRooms.map((room) => (
              <Button
                key={room.id}
                variant={selectedRoom === room.id ? "secondary" : "ghost"}
                onClick={() => setSelectedRoom(room.id)}
                className={cn(
                  "w-full justify-start p-3 h-auto",
                  selectedRoom === room.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800",
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    {room.type === "group" ? (
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <img
                        src={room.participants[0]?.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    {room.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {room.unreadCount > 0 && (
                        <Badge className="bg-red-600 text-white text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 truncate">
                      {room.lastMessage.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-50">
                        {room.lastMessage.timestamp}
                      </span>
                      {typingUsers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-400">
                            escribiendo...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-800">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-white font-medium">{mockRooms.length}</div>
              <div className="text-gray-400">Chats</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium">
                {activeUsers.filter((u) => u.status === "online").length}
              </div>
              <div className="text-gray-400">En línea</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium">
                {pinnedMessages.length}
              </div>
              <div className="text-gray-400">Fijados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Content - Chat Messages */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {currentRoom?.type === "group" ? (
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <img
                    src={currentRoom?.participants[0]?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {currentRoom?.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{currentRoom?.participants.length} participantes</span>
                  {currentRoom?.type === "group" && (
                    <>
                      <span>•</span>
                      <span>{currentRoom.description}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVideoCall}
                className="text-gray-400 hover:text-white"
              >
                <VideoIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleScreenShare}
                className="text-gray-400 hover:text-white"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem className="text-white">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificaciones
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Base de Conocimiento
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white">
                    <Target className="h-4 w-4 mr-2" />
                    Crear Recordatorio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en esta conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          )}
        </div>

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="bg-blue-900/20 border-b border-blue-500/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Mensajes Fijados ({pinnedMessages.length})
              </span>
            </div>
            <div className="space-y-1">
              {pinnedMessages.slice(0, 2).map((msg) => {
                const sender = mockUsers.find((u) => u.id === msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className="text-sm text-blue-200 bg-blue-900/30 rounded p-2"
                  >
                    <span className="font-medium">{sender?.name}:</span>{" "}
                    {msg.content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sentiment Alert */}
        {showSentimentAlert && (
          <div className="bg-red-900/20 border-b border-red-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">
                  Se detectó frustración en la conversación
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Bot className="h-4 w-4 mr-1" />
                  Activar Bot
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSentimentAlert(false)}
                  className="text-red-400"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const sender = mockUsers.find((u) => u.id === message.senderId);
              const isCurrentUser = message.senderId === "current";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isCurrentUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isCurrentUser && (
                    <img
                      src={sender?.avatar}
                      alt={sender?.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] space-y-1",
                      isCurrentUser && "text-right",
                    )}
                  >
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {sender?.name}
                        </span>
                        {sender?.role === "admin" && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                        {sender?.role === "moderator" && (
                          <Shield className="h-3 w-3 text-blue-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "group relative",
                        message.isPinned && "ring-2 ring-blue-500/50",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm",
                          isCurrentUser
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-800 text-gray-100 rounded-bl-md",
                          message.sentiment === "negative" &&
                            "ring-1 ring-red-500/50",
                          message.sentiment === "positive" &&
                            "ring-1 ring-green-500/50",
                        )}
                      >
                        {replyingTo === message.id && (
                          <div className="text-xs opacity-70 mb-1 border-l-2 border-gray-500 pl-2">
                            Respondiendo a mensaje anterior...
                          </div>
                        )}

                        {message.mentions.length > 0 && (
                          <div className="text-xs text-blue-300 mb-1">
                            Menciones: {message.mentions.join(", ")}
                          </div>
                        )}

                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>

                        {message.aiSummary && (
                          <div className="mt-2 p-2 bg-purple-900/30 border border-purple-500/30 rounded text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className="h-3 w-3 text-purple-400" />
                              <span className="text-purple-300">
                                Resumen IA:
                              </span>
                            </div>
                            <p className="text-purple-200">
                              {message.aiSummary}
                            </p>
                          </div>
                        )}

                        {message.attachments && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 p-2 bg-gray-700/50 rounded"
                              >
                                <FileText className="h-4 w-4 text-blue-400" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {file.size}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {message.isEdited && (
                          <div className="text-xs opacity-50 mt-1">editado</div>
                        )}
                      </div>

                      {/* Message Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.reactions.map((reaction) => (
                            <Button
                              key={reaction.emoji}
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleReaction(message.id, reaction.emoji)
                              }
                              className={cn(
                                "h-6 px-2 text-xs rounded-full",
                                reaction.users.includes("current")
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 text-gray-300",
                              )}
                            >
                              {reaction.emoji} {reaction.count}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 transform translate-x-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReaction(message.id, "👍")}
                          className="h-8 w-8 p-0"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReaction(message.id, "❤️")}
                          className="h-8 w-8 p-0"
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyingTo(message.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePinMessage(message.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem
                              onClick={() =>
                                handleTranslateMessage(message.id, "en")
                              }
                              className="text-white"
                            >
                              <Languages className="h-4 w-4 mr-2" />
                              Traducir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCreateReminder(message.id)}
                              className="text-white"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Crear Recordatorio
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white">
                              <Forward className="h-4 w-4 mr-2" />
                              Reenviar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white">
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </DropdownMenuItem>
                            {isCurrentUser && (
                              <DropdownMenuItem className="text-white">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Message Status */}
                      {isCurrentUser && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs text-gray-500">
                            {message.timestamp}
                          </span>
                          {message.status === "read" && (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                          )}
                          {message.status === "sent" && (
                            <CheckCheck className="h-3 w-3 text-gray-400" />
                          )}
                          {message.status === "sending" && (
                            <Clock className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <img
                      src={sender?.avatar}
                      alt={sender?.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              );
            })}

            {/* AI Auto-Summary */}
            {messages.length > 10 && (
              <div className="my-4 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    Resumen Automático IA
                  </span>
                </div>
                <p className="text-sm text-purple-200">
                  📋 Se discutió la revisión del presupuesto del cliente X
                  <br />
                  📄 Ana compartió el resumen de llamadas del cliente ABC
                  <br />✅ Israel confirmó la revisión del informe con
                  sugerencias menores
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Ver Análisis Completo
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Crear Tareas
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-gray-400">
            {typingUsers.map((userId) => {
              const user = mockUsers.find((u) => u.id === userId);
              return (
                <div key={userId} className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span>{user?.name} está escribiendo...</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reply Preview */}
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Reply className="h-4 w-4" />
                <span>Respondiendo a mensaje</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-800 p-4">
          {/* Quick Responses Bar */}
          {showQuickResponses && (
            <div className="mb-3 flex flex-wrap gap-2">
              {quickResponses.map((response) => (
                <Button
                  key={response.id}
                  size="sm"
                  variant="outline"
                  onClick={() => setNewMessage(response.content)}
                  className={cn(
                    "text-xs border-gray-600",
                    response.isKnowledgeBase && "border-blue-500 text-blue-300",
                  )}
                >
                  {response.isKnowledgeBase && (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  {response.title}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQuickResponses(!showQuickResponses)}
                className={cn(
                  "text-gray-400 hover:text-white",
                  showQuickResponses && "bg-blue-600 text-white",
                )}
              >
                <Zap className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
                className={cn(
                  "text-gray-400 hover:text-white",
                  showKnowledgeBase && "bg-green-600 text-white",
                )}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 relative">
              <Textarea
                placeholder="Escribe un mensaje... (usa @ para mencionar)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white resize-none min-h-[40px] max-h-32"
                rows={1}
              />

              {/* Auto-suggestions overlay */}
              {newMessage.length > 10 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-2 border-b border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                      <Brain className="h-3 w-3" />
                      <span>Sugerencias IA</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs text-gray-300"
                    >
                      "Perfecto, procederemos con esa opción"
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs text-gray-300"
                    >
                      "¿Necesitas alguna aclaración adicional?"
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs text-gray-300"
                    >
                      "Te mantendré informado del progreso"
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-white"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Gamification Progress */}
          <div className="mt-2 p-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-300">
                  Respuesta rápida: +15 pts
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-300">Nivel 7</span>
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-yellow-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Knowledge Base Integration */}
      {showKnowledgeBase && (
        <div className="w-80 border-l border-gray-800 bg-gray-900/50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Base de Conocimiento
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowKnowledgeBase(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Buscar documentos..."
                className="bg-gray-800 border-gray-700 text-white"
              />

              <div className="space-y-2">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">
                      Manual de Productos
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Especificaciones técnicas completas
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white">Lista de Precios</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Tarifas actualizadas Q1 2024
                  </p>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-white">FAQ Sugeridas</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Preguntas frecuentes generadas por IA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              Invitar Usuarios
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Buscar usuario
              </label>
              <Input
                placeholder="Nombre o email del usuario..."
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Rol en el grupo
              </label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancelar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Enviar Invitación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-400" />
              Crear Recordatorio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Título del recordatorio
              </label>
              <Input
                placeholder="Ej: Seguimiento con cliente ABC"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Fecha
                </label>
                <Input type="date" className="bg-gray-800 border-gray-700" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Hora
                </label>
                <Input type="time" className="bg-gray-800 border-gray-700" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Notas adicionales
              </label>
              <Textarea
                placeholder="Contexto adicional del recordatorio..."
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReminderDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Crear Recordatorio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
