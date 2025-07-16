import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Send,
  Search,
  MoreHorizontal,
  Plus,
  Smile,
  Paperclip,
  Phone,
  Video,
  Settings,
  Star,
  Pin,
  Users,
  Bot,
  Languages,
  UserPlus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/useTeam";
import { useConversations, useSendMessage } from "@/hooks/useMessages";
import { useConversationStore } from "@/hooks/useConversationStore";
import { toast } from "@/hooks/use-toast";

// Tipos para el componente de colaboración
interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
  role: "admin" | "moderator" | "member";
  department: string;
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "image";
  reactions?: Array<{
    emoji: string;
    users: string[];
    count: number;
  }>;
  isPinned: boolean;
  isEdited: boolean;
  status: "sending" | "sent" | "read";
  mentions: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  aiSummary?: string;
  sentiment?: "positive" | "neutral" | "negative";
}

interface ChatRoom {
  id: string;
  name: string;
  type: "group" | "direct";
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  pinnedMessages: Message[];
  admins: string[];
  moderators: string[];
  createdAt: string;
  description?: string;
}

interface QuickResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  isKnowledgeBase: boolean;
}

interface RealTimeCollaborationProps {
  className?: string;
}

export function RealTimeCollaboration({
  className,
}: RealTimeCollaborationProps) {
  // Estados locales
  const [selectedRoom, setSelectedRoom] = useState<string>("team-general");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<string | null>(null);
  const [showSentimentAlert, setShowSentimentAlert] = useState(false);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(true);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks para datos reales
  const { data: teamMembersResponse, isLoading: isLoadingTeam } = useTeamMembers();
  const { data: conversationsResponse, isLoading: isLoadingConversations } = useConversations();
  const { getMessages } = useConversationStore();
  const sendMessageMutation = useSendMessage();

  // Convertir datos del equipo a formato de usuarios
  const activeUsers: User[] = teamMembersResponse?.data?.map(member => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    status: member.status === 'active' ? 'online' : 'offline',
    role: member.role as "admin" | "moderator" | "member",
    department: "General", // Campo por defecto ya que Seller no tiene department
    isTyping: false,
  })) || [];

  // Crear salas basadas en conversaciones reales y equipo
  const chatRooms: ChatRoom[] = [
    {
      id: "team-general",
      name: "Equipo General",
      type: "group",
      participants: activeUsers.slice(0, 5),
      unreadCount: 0,
      isOnline: true,
      pinnedMessages: [],
      admins: activeUsers.filter(u => u.role === 'admin').map(u => u.id),
      moderators: activeUsers.filter(u => u.role === 'moderator').map(u => u.id),
      createdAt: "2024-01-01",
      description: "Chat principal del equipo de trabajo",
    },
    {
      id: "team-sales",
      name: "Equipo de Ventas",
      type: "group",
      participants: activeUsers.filter(u => u.department === 'Ventas'),
      unreadCount: 2,
      isOnline: true,
      pinnedMessages: [],
      admins: [],
      moderators: [],
      createdAt: "2024-01-01",
      description: "Colaboración del equipo de ventas",
    },
    ...activeUsers.slice(0, 3).map(user => ({
      id: `direct-${user.id}`,
      name: user.name,
      type: "direct" as const,
      participants: [user],
      unreadCount: 0,
      isOnline: user.status === 'online',
      pinnedMessages: [],
      admins: [],
      moderators: [],
      createdAt: "2024-01-01",
    }))
  ];

  const currentRoom = chatRooms.find((room) => room.id === selectedRoom);
  
  // Obtener mensajes reales desde el store (esto sería para conversaciones de clientes)
  // Para colaboración interna, normalmente sería otro endpoint
  const realMessages = getMessages(selectedRoom);
   
   // Convertir mensajes del tipo api.Message al tipo local Message para colaboración
   const messages: Message[] = realMessages.map(msg => ({
     id: msg.id,
     senderId: msg.sender === "agent" ? "current-user" : "client-user",
     content: msg.content,
     timestamp: msg.timestamp,
     type: msg.type as "text" | "file" | "image",
     reactions: [],
     isPinned: false,
     isEdited: false,
     status: msg.status === "sent" ? "sent" : msg.status === "delivered" ? "sent" : "read",
     mentions: [],
     attachments: msg.attachments ? msg.attachments.map(att => ({
       id: att.id,
       name: att.name,
       type: att.type,
       size: att.size,
       url: att.url,
     })) : undefined,
     sentiment: "neutral",
   }));

  // Respuestas rápidas predefinidas
  const quickResponses: QuickResponse[] = [
    {
      id: "qr1",
      title: "Saludo profesional",
      content: "Buenos días equipo, ¿cómo van las actividades de hoy?",
      category: "saludos",
      isKnowledgeBase: false,
    },
    {
      id: "qr2",
      title: "Solicitar información",
      content: "¿Podrían compartir el estado actual del proyecto?",
      category: "información",
      isKnowledgeBase: false,
    },
    {
      id: "qr3",
      title: "Escalación",
      content: "Necesito que revisemos este caso juntos en la próxima reunión.",
      category: "escalacion",
      isKnowledgeBase: false,
    },
  ];

  // Efectos para funcionalidad en tiempo real
  useEffect(() => {
    // Simular indicadores de escritura
    const typingInterval = setInterval(() => {
      const typingUser = activeUsers.find((u) => u.isTyping);
      if (typingUser) {
        setTypingUsers([typingUser.id]);
        setTimeout(() => setTypingUsers([]), 2000);
      }
    }, 5000);

    // Auto-scroll a mensajes nuevos
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => clearInterval(typingInterval);
  }, [messages, activeUsers]);

  // Funciones de manejo de eventos
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    // Para colaboración interna, esto normalmente iría a un endpoint diferente
    // Por ahora, simulamos el envío
    const message = {
      id: `msg_${Date.now()}`,
      senderId: "current-user",
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "text" as const,
      reactions: [],
      isPinned: false,
      isEdited: false,
      status: "sending" as const,
      mentions: extractMentions(newMessage),
      sentiment: analyzeSentiment(newMessage),
    };

    console.log("📤 Enviando mensaje de colaboración:", message);
    
    setNewMessage("");
    setReplyingTo(null);

    // Auto-generar sugerencias
    setTimeout(() => {
      generateAutoSuggestions(message.content);
    }, 1000);

    toast({
      title: "Mensaje enviado",
      description: "Tu mensaje ha sido enviado al equipo.",
    });
  };

  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@\w+/g);
    return mentions ? mentions.map((m) => m.substring(1)) : [];
  };

  const analyzeSentiment = (content: string): "positive" | "neutral" | "negative" => {
    const positiveWords = ["excelente", "genial", "perfecto", "bueno", "gracias"];
    const negativeWords = ["problema", "error", "mal", "terrible", "imposible"];
    
    const lowerContent = content.toLowerCase();
    
    if (positiveWords.some(word => lowerContent.includes(word))) {
      return "positive";
    }
    if (negativeWords.some(word => lowerContent.includes(word))) {
      return "negative";
    }
    return "neutral";
  };

  const generateAutoSuggestions = (content: string) => {
    console.log("🤖 Generando sugerencias automáticas para:", content);
    // Aquí se integraría con el sistema de IA para sugerencias
  };

  if (isLoadingTeam || isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-400">Cargando colaboración en tiempo real...</p>
        </div>
      </div>
    );
  }

  const handleReaction = (messageId: string, emoji: string) => {
    // Simular reacción
    console.log(`👍 Reaccionando a mensaje ${messageId} con ${emoji}`);
  };

  const handlePinMessage = (messageId: string) => {
    // Simular pin
    console.log(`📌 Pinneando mensaje ${messageId}`);
  };

  const handleTranslateMessage = (messageId: string, targetLang: string) => {
    // Simular traducción
    console.log(`🌐 Traduciendo mensaje ${messageId} a ${targetLang}`);
    setCurrentTranslation(messageId);
    setTimeout(() => setCurrentTranslation(null), 2000);
  };

  const handleCreateReminder = (messageId: string) => {
    // Simular creación de recordatorio
    console.log(`⏰ Creando recordatorio para mensaje ${messageId}`);
    setSelectedMessage(messageId);
    setReminderDialogOpen(true);
  };

  const handleScreenShare = () => {
    // Simular pantalla compartida
    console.log("📺 Iniciando compartición de pantalla");
  };

  const handleVideoCall = () => {
    // Simular llamada de video
    console.log("🎥 Iniciando llamada de video");
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
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(" ")[0]}
                      </AvatarFallback>
                    </Avatar>
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
            {chatRooms.map((room) => (
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
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={room.participants[0]?.avatar} alt="" />
                        <AvatarFallback className="text-xs">
                          {room.participants[0]?.name.split(" ")[0]}
                        </AvatarFallback>
                      </Avatar>
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
                      {room.lastMessage?.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-50">
                        {room.lastMessage?.timestamp}
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
              <div className="text-white font-medium">{chatRooms.length}</div>
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
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentRoom?.participants[0]?.avatar} alt="" />
                    <AvatarFallback className="text-xs">
                      {currentRoom?.participants[0]?.name.split(" ")[0]}
                    </AvatarFallback>
                  </Avatar>
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
                <Video className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleScreenShare}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
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
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem className="text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Notificaciones
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Base de Conocimiento
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white">
                    <Plus className="h-4 w-4 mr-2" />
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
                const sender = activeUsers.find((u) => u.id === msg.senderId);
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
                <MessageCircle className="h-4 w-4 text-red-400" />
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
              const sender = activeUsers.find((u) => u.id === message.senderId);
              const isCurrentUser = message.senderId === "current-user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isCurrentUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isCurrentUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={sender?.avatar} alt={sender?.name} />
                      <AvatarFallback className="text-xs">
                        {sender?.name.split(" ")[0]}
                      </AvatarFallback>
                    </Avatar>
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
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                        {sender?.role === "moderator" && (
                          <Settings className="h-3 w-3 text-blue-500" />
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
                              <Bot className="h-3 w-3 text-purple-400" />
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
                                <Paperclip className="h-4 w-4 text-blue-400" />
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
                      {message.reactions && message.reactions.length > 0 && (
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
                                reaction.users.includes("current-user")
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
                              <MoreHorizontal className="h-3 w-3" />
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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={sender?.avatar} alt={sender?.name} />
                      <AvatarFallback className="text-xs">
                        {sender?.name.split(" ")[0]}
                      </AvatarFallback>
                    </Avatar>
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
              const user = activeUsers.find((u) => u.id === userId);
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
