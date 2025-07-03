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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  File,
  Bot,
  UserCheck,
  ImageIcon,
  Sparkles,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  chatId?: string;
  className?: string;
  onShowAI?: () => void;
  onShowClientInfo?: () => void;
}

// Mock conversation data
const mockConversation = {
  id: "1",
  contactName: "GRUPO ALCON",
  channel: "whatsapp" as "whatsapp" | "facebook" | "sms",
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

export function ChatView({
  chatId,
  className,
  onShowAI,
  onShowClientInfo,
}: ChatViewProps) {
  const [message, setMessage] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showPredefinedTexts, setShowPredefinedTexts] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Predefined text templates
  const predefinedTexts = [
    {
      id: "1",
      title: "Saludo inicial",
      content: "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?",
      category: "greetings",
    },
    {
      id: "2",
      title: "Información de productos",
      content:
        "Te puedo ayudar con información detallada sobre nuestros productos. ¿Hay algo específico que te interese?",
      category: "products",
    },
    {
      id: "3",
      title: "Tiempo de entrega",
      content:
        "El tiempo de entrega estándar es de 3-5 días hábiles. Para entregas urgentes, contamos con servicio express.",
      category: "delivery",
    },
    {
      id: "4",
      title: "Cotización",
      content:
        "Con gusto te preparo una cotización personalizada. ¿Podrías proporcionarme más detalles sobre tu proyecto?",
      category: "quotes",
    },
    {
      id: "5",
      title: "Agradecimiento",
      content:
        "Muchas gracias por tu preferencia. Estamos aquí para ayudarte en lo que necesites.",
      category: "thanks",
    },
  ];

  // Campaign templates
  const campaignTemplates = [
    {
      id: "1",
      name: "Promoción Mármol Carrara",
      platform: "whatsapp",
      description: "20% descuento en mármol carrara hasta fin de mes",
      message:
        "🎉 ¡Oferta especial! 20% de descuento en mármol carrara hasta fin de mes. ¡No te pierdas esta oportunidad!",
    },
    {
      id: "2",
      name: "Nueva Colección",
      platform: "facebook",
      description: "Anuncio de nueva colección de granitos",
      message:
        "✨ ¡Nueva colección de granitos disponible! Descubre las últimas tendencias en diseño.",
    },
    {
      id: "3",
      name: "Seguimiento Clientes",
      platform: "sms",
      description: "Seguimiento post-venta",
      message:
        "Hola {nombre}, esperamos que estés satisfecho con tu compra. ¿Necesitas algún soporte adicional?",
    },
  ];

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

  const handlePredefinedTextSelect = (text: string) => {
    setMessage(text);
    setShowPredefinedTexts(false);
  };

  const handleCampaignSend = (campaign: any) => {
    console.log(`Sending ${campaign.platform} campaign:`, campaign);
    setShowCampaigns(false);
    // Here you would implement campaign sending logic
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Here you would implement search functionality
    }
  };

  const getChannelIcon = () => {
    switch (mockConversation.channel) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-500" />;
      case "sms":
        return <Hash className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getChannelName = () => {
    switch (mockConversation.channel) {
      case "whatsapp":
        return "WhatsApp";
      case "facebook":
        return "Facebook";
      case "sms":
        return "SMS";
      default:
        return "Desconocido";
    }
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
              {getChannelIcon()}
              <Badge className="bg-gray-700 text-gray-300 text-xs">
                {getChannelName()}
              </Badge>
              <TagIcon className="h-4 w-4 text-gray-400" />
              <Badge
                variant="outline"
                className="border-green-500 text-green-400 text-xs"
              >
                {mockConversation.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>En línea</span>
              </div>
              <span>•</span>
              <span>Customer</span>
              <span>•</span>
              <span>Via {getChannelName()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile AI and Client Info buttons */}
          <div className="lg:hidden flex items-center gap-1">
            {onShowAI && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowAI}
                      className="w-8 h-8 p-0 rounded-lg border border-gray-600/30 bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all duration-200"
                    >
                      <Bot className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                    Asistente IA
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onShowClientInfo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowClientInfo}
                      className="w-8 h-8 p-0 rounded-lg border border-gray-600/30 bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all duration-200"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                    Info del Cliente
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Search Toggle with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg border border-gray-600/30 bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all duration-200",
                    showSearch &&
                      "bg-blue-600/20 border-blue-500/30 text-blue-300",
                  )}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                Buscar en esta conversación
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                Close Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-700/50 bg-gray-900/60 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar mensajes, archivos, enlaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="bg-gray-800/60 border border-gray-600/40 text-white placeholder:text-gray-400 rounded-lg focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 backdrop-blur-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              size="sm"
              className="bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white rounded-lg disabled:bg-gray-700/50 disabled:border-gray-600/30 disabled:text-gray-400 transition-all duration-200"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
        {/* Enhanced Input Area */}
        <div className="border border-gray-700 rounded-lg bg-gray-800/60 backdrop-blur-sm">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700/50">
            <div className="flex items-center gap-1">
              {/* File Upload */}
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.mp4,.mp3"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  // Handle file upload
                  console.log("Files uploaded:", e.target.files);
                }}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/60"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Adjuntar archivos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Image Upload */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/60"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Enviar imagen
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Emoji Picker */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/60"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Añadir emoji
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Voice Recording */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRecording}
                      className={cn(
                        "h-7 w-7 p-0",
                        isRecording
                          ? "text-red-400 hover:text-red-300 bg-red-500/10"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/60",
                      )}
                    >
                      {isRecording ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    {isRecording ? "Detener grabación" : "Grabar audio"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Predefined Texts */}
              <Dialog
                open={showPredefinedTexts}
                onOpenChange={setShowPredefinedTexts}
              >
                <DialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/60"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                        Textos predefinidos
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border border-gray-700/50 text-white rounded-xl shadow-2xl backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-white font-medium">
                      Textos Predefinidos
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-80 pr-2">
                    <div className="space-y-2">
                      {predefinedTexts.map((text) => (
                        <div
                          key={text.id}
                          className="p-3 bg-gray-800/60 border border-gray-600/30 rounded-lg cursor-pointer hover:bg-gray-700/60 hover:border-gray-500/40 transition-all duration-200 backdrop-blur-sm"
                          onClick={() =>
                            handlePredefinedTextSelect(text.content)
                          }
                        >
                          <h4 className="font-medium text-white mb-1">
                            {text.title}
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {text.content}
                          </p>
                          <Badge className="mt-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                            {text.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              {/* Campaign Buttons */}
              <Dialog open={showCampaigns} onOpenChange={setShowCampaigns}>
                <DialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/60"
                        >
                          <Megaphone className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                        Enviar campaña
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border border-gray-700/50 text-white rounded-xl shadow-2xl backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-white font-medium">
                      Enviar Campaña
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-80 pr-2">
                    <div className="space-y-3">
                      {campaignTemplates.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="p-4 bg-gray-800/60 border border-gray-600/30 rounded-lg hover:bg-gray-700/40 transition-all duration-200 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">
                              {campaign.name}
                            </h4>
                            <Badge
                              className={cn(
                                "text-xs rounded-full",
                                campaign.platform === "whatsapp"
                                  ? "bg-green-600/20 border border-green-500/30 text-green-300"
                                  : campaign.platform === "facebook"
                                    ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                                    : "bg-purple-600/20 border border-purple-500/30 text-purple-300",
                              )}
                            >
                              {campaign.platform.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                            {campaign.description}
                          </p>
                          <div className="bg-gray-800/80 border border-gray-600/40 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-200 leading-relaxed">
                              {campaign.message}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleCampaignSend(campaign)}
                            className={cn(
                              "w-full h-8 rounded-lg transition-all duration-200",
                              campaign.platform === "whatsapp"
                                ? "bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300"
                                : campaign.platform === "facebook"
                                  ? "bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300"
                                  : "bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300",
                            )}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Enviar {campaign.platform}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            {/* AI Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Resumir
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Resumir conversación con IA
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      Sugerir
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Obtener sugerencias de IA
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="relative">
            <div
              contentEditable
              className={cn(
                "min-h-[80px] max-h-[200px] overflow-y-auto p-3 text-sm text-white placeholder:text-gray-400 focus:outline-none",
                "prose prose-sm prose-invert max-w-none",
                isPrivateNote ? "bg-amber-950/20" : "bg-transparent",
              )}
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              suppressContentEditableWarning={true}
              onInput={(e) => {
                const target = e.target as HTMLDivElement;
                setMessage(target.textContent || "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-placeholder={
                isPrivateNote
                  ? "Añadir nota privada..."
                  : "Escribe un mensaje..."
              }
            />

            {/* Placeholder when empty */}
            {!message && (
              <div className="absolute top-3 left-3 text-sm text-gray-400 pointer-events-none">
                {isPrivateNote
                  ? "Añadir nota privada..."
                  : "Escribe un mensaje..."}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between p-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700/60"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Comentario
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs">
                    Añadir comentario interno
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="text-xs text-gray-500">
                {message.length} caracteres
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Enter para enviar, Shift+Enter nueva línea
              </span>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 h-7"
              >
                <Send className="h-3 w-3 mr-1" />
                Enviar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{message.length} characters</span>
        </div>
      </div>
    </div>
  );
}
