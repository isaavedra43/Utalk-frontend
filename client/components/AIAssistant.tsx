import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  Copy,
  Edit3,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Star,
  Send,
  BarChart3,
  Zap,
  UserPlus,
  MessageCircle,
  Package,
  History,
  ChevronDown,
  Eye,
  ShoppingCart,
  Clock,
  User,
  Phone,
  Mail,
  Moon,
  Sun,
  Flame,
  AlertTriangle,
  DollarSign,
  Target,
  CheckCircle,
  PauseCircle,
  Bell,
  Crown,
  TrendingUp,
  HelpCircle,
  Calendar,
  Users,
  Receipt,
  ShoppingBag,
  MessageSquareReply,
  Timer,
  Brain,
  Lightbulb,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentiment, setSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("positive");

  // New states for additional functionality
  const [activeTab, setActiveTab] = useState("ai");
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("bienvenida");

  // Advanced AI Assistant States
  const [isWelcomeMode, setIsWelcomeMode] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [clientIntent, setClientIntent] = useState<
    "cotizacion" | "queja" | "venta" | "seguimiento" | "factura" | null
  >("cotizacion");
  const [isNewClient, setIsNewClient] = useState(true);
  const [clientPriority, setClientPriority] = useState<
    "high" | "medium" | "low"
  >("high");
  const [salesClosed, setSalesClosed] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [responseTimer, setResponseTimer] = useState<number | null>(null);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");

  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{
      id: string;
      text: string;
      confidence: number;
      category: string;
      tone: "informal" | "tecnico" | "profesional";
      reason?: string;
    }>
  >([]);

  const [detectedProducts, setDetectedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara",
      price: "$45.99/m²",
      image: "/placeholder.svg",
      description: "Mármol natural de alta calidad premium para interiores",
      technicalData: "Densidad: 2.7 kg/dm³, Absorción: <0.5%",
      hasImage: true,
      hasPDF: true,
      hasVideo: true,
      stock: 150,
      consultedTimes: 5,
      isTrending: true,
    },
    {
      id: "2",
      name: "Travertino Romano",
      price: "$32.50/m²",
      image: "/placeholder.svg",
      description: "Piedra natural con textura única",
      technicalData: "Densidad: 2.4 kg/dm³, Absorción: 2-5%",
      hasImage: true,
      hasPDF: true,
      hasVideo: false,
      stock: 0,
      consultedTimes: 2,
      isTrending: false,
    },
  ]);

  const [clientInfo, setClientInfo] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    totalConversations: 3,
    lastPurchase: "15 Feb 2024",
    tags: ["Cliente VIP", "Descuento prometido"],
    riskLevel: "low" as "low" | "medium" | "high",
  });

  const [zohoData, setZohoData] = useState({
    quotes: [
      {
        id: "Q-2024-001",
        amount: "$2,450.00",
        status: "pending",
        date: "Mar 10",
      },
      {
        id: "Q-2024-002",
        amount: "$1,890.50",
        status: "approved",
        date: "Mar 08",
      },
    ],
    orders: [
      {
        id: "O-2024-123",
        amount: "$2,450.00",
        status: "processing",
        date: "Mar 09",
      },
    ],
    invoices: [
      {
        id: "INV-2024-456",
        amount: "$1,200.00",
        status: "paid",
        date: "Feb 28",
      },
    ],
  });

  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(
    null,
  );
  const [editedText, setEditedText] = useState("");

  // Advanced Functions
  const detectClientIntent = (message: string) => {
    const intentKeywords = {
      cotizacion: ["precio", "cotizar", "costo", "cuanto", "presupuesto"],
      queja: ["problema", "reclamo", "mal", "defecto", "error"],
      venta: ["comprar", "pedido", "orden", "facturar"],
      seguimiento: ["estado", "seguimiento", "cuando", "entrega"],
      factura: ["factura", "pago", "cobro", "invoice"],
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some((keyword) => message.toLowerCase().includes(keyword))) {
        setClientIntent(intent as any);
        return intent;
      }
    }
    return null;
  };

  const generateWelcomeMessage = () => {
    const welcomeMessages = [
      `¡Hola ${clientInfo.name}! ${isNewClient ? "Es un placer conocerte" : "Qué gusto volver a atenderte"}. Soy parte del equipo de GRUPO ALCON. ¿En qué podemos ayudarte con nuestros productos de mármol y piedra natural?`,
      "¡Bienvenido/a! Gracias por contactar a GRUPO ALCON. Somos especialistas en mármol, travertino y piedras decorativas. ¿Tienes algún proyecto en mente?",
      "¡Hola! Me da mucho gusto que nos contactes. En GRUPO ALCON tenemos más de 15 años ayudando a crear espacios únicos con piedra natural. ¿Cómo puedo asistirte hoy?",
    ];

    if (messageCount < 3) {
      return welcomeMessages[messageCount] || welcomeMessages[0];
    }
    return null;
  };

  const setResponseReminder = (minutes: number) => {
    setResponseTimer(minutes);
    setPendingResponse(true);
    setTimeout(
      () => {
        alert(`⏰ Recordatorio: Responder a ${clientInfo.name}`);
        setPendingResponse(false);
      },
      minutes * 60 * 1000,
    );
  };

  const closeSale = () => {
    if (!estimatedAmount) return;
    setSalesClosed(true);
    console.log(`Venta cerrada: $${estimatedAmount} para ${clientInfo.name}`);
    // Trigger post-sale follow-up logic
  };

  const escalateConversation = () => {
    console.log(
      `Escalando conversación de ${clientInfo.name} por falta de respuesta`,
    );
    // Logic to escalate to another agent
  };

  const logAgentDecision = (
    suggestionId: string,
    action: "accepted" | "modified" | "ignored",
  ) => {
    console.log(`Agent decision: ${action} for suggestion ${suggestionId}`);
    // Log for AI improvement
  };

  // Generate intelligent reply suggestions based on context
  const generateAISuggestions = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const contextualSuggestions = [
        {
          id: "1",
          text: "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más.",
          confidence: 0.95,
          category: "product_inquiry",
        },
        {
          id: "2",
          text: "Excelente elección. El mármol carrara es uno de nuestros productos estrella. Te envío la ficha técnica completa con precios actualizados. ¿Para qué tipo de aplicación lo necesitas?",
          confidence: 0.88,
          category: "technical_response",
        },
        {
          id: "3",
          text: "Con gusto te ayudo con la cotización. Para darte el mejor precio, necesito saber: ¿cuántos metros cuadrados aproximadamente? ¿es para interior o exterior? ¿tienes fecha límite para el proyecto?",
          confidence: 0.92,
          category: "pricing_inquiry",
        },
      ];

      setAiSuggestions(contextualSuggestions);
      setIsGenerating(false);
    }, 1500);
  };

  // Product detection based on conversation
  const detectProductsInConversation = (message: string) => {
    const productKeywords = {
      mármol: ["marmol", "marble", "carrara", "calacatta"],
      travertino: ["travertino", "travertine", "romano"],
      granito: ["granito", "granite"],
      piedra: ["piedra", "stone", "decorativa"],
    };

    const detected = [];
    Object.entries(productKeywords).forEach(([product, keywords]) => {
      if (keywords.some((keyword) => message.toLowerCase().includes(keyword))) {
        detected.push(product);
      }
    });

    return detected;
  };

  const sendSuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      console.log("Sending suggestion:", suggestion.text);
      // Here you would integrate with the chat component to send the message
      // Remove suggestion after sending
      setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    }
  };

  const editSuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      setEditingSuggestion(suggestionId);
      setEditedText(suggestion.text);
    }
  };

  const saveEditedSuggestion = () => {
    if (editingSuggestion) {
      setAiSuggestions((prev) =>
        prev.map((s) =>
          s.id === editingSuggestion ? { ...s, text: editedText } : s,
        ),
      );
      setEditingSuggestion(null);
      setEditedText("");
    }
  };

  const rewriteSuggestion = (suggestionId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const rewrittenTexts = [
        "Perfecto, me da mucho gusto que estés interesado en nuestros productos de mármol. ¿Podrías contarme un poco más sobre tu proyecto? Así puedo recomendarte la mejor opción.",
        "¡Excelente! El mármol carrara es realmente excepcional. Te voy a compartir toda la información técnica y algunos ejemplos de proyectos donde lo hemos usado. ¿Te parece bien?",
        "Claro que sí, con mucho gusto te preparo una cotización personalizada. Solo necesito algunos detalles del proyecto para asegurarme de darte el mejor precio posible.",
      ];

      setAiSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                text: rewrittenTexts[
                  Math.floor(Math.random() * rewrittenTexts.length)
                ],
              }
            : s,
        ),
      );
      setIsGenerating(false);
    }, 1000);
  };

  const sendProductInfo = (
    productId: string,
    type: "image" | "pdf" | "video" | "technical",
  ) => {
    const product = detectedProducts.find((p) => p.id === productId);
    if (product) {
      console.log(`Sending ${type} for product:`, product.name);
      // Here you would integrate with the chat component to send the media
    }
  };

  const generateSuggestion = async (type: string) => {
    setIsGenerating(true);

    // Simulate AI response generation
    setTimeout(() => {
      const suggestions = {
        summarize:
          "Customer inquired about order #AL-2024-0123 delivery status. Agent confirmed March 15th delivery date and offered expedited shipping options. Customer satisfied with response.",
        reply:
          "I'd be happy to help you with expedited shipping! For your location, we have 2-day express ($25) and overnight delivery ($45) available. Both include tracking and delivery confirmation. Would you like me to upgrade your order?",
        improve:
          "I'd be delighted to assist you with expedited shipping options! For your location, we offer 2-day express shipping ($25) and overnight delivery ($45). Both services include comprehensive tracking and delivery confirmation. Would you prefer to upgrade your current order to one of these premium shipping options?",
        professional:
          "Thank you for your inquiry regarding expedited shipping options. We are pleased to offer the following premium delivery services for your location: Express 2-Day Delivery ($25) and Overnight Delivery ($45). Both services include comprehensive tracking and delivery confirmation. Please let me know if you would like to proceed with upgrading your current order.",
        custom: customPrompt
          ? `Here's a response based on your request: "${customPrompt}"`
          : "",
      };

      setSuggestion(suggestions[type as keyof typeof suggestions] || "");
      setIsGenerating(false);
    }, 1500);
  };

  const copySuggestion = () => {
    navigator.clipboard.writeText(suggestion);
  };

  const useSuggestion = () => {
    // Here you would typically insert the suggestion into the chat input
    console.log("Using suggestion:", suggestion);
  };

  const provideFeedback = (positive: boolean) => {
    // Here you would send feedback to improve AI suggestions
    console.log("Feedback:", positive ? "positive" : "negative");
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-gray-900 border-l border-gray-800",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">AI Copilot</h3>
            <Badge
              variant="outline"
              className="border-blue-500 text-blue-400 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          {/* Transfer Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-600 text-amber-400 hover:bg-amber-600/20 text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Transferir
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700"
            >
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <User className="h-4 w-4 mr-2" />
                Sarah Chen - Ventas
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <User className="h-4 w-4 mr-2" />
                Mike Torres - Soporte
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <User className="h-4 w-4 mr-2" />
                Ana López - Postventa
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Package className="h-4 w-4 mr-2" />
                Área de Facturación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-400">
          {isWelcomeMode
            ? "IA enviando bienvenida automática - luego modo asistente"
            : "Modo asistente activo - sugiere respuestas sin enviar automáticamente"}
        </p>

        {/* Welcome Message Preview */}
        {isWelcomeMode && messageCount < 3 && (
          <div className="mt-3 p-2 bg-green-900/30 border border-green-600/30 rounded">
            <p className="text-xs text-green-400 mb-1">
              🤖 Próximo mensaje automático:
            </p>
            <p className="text-xs text-green-200">
              "{generateWelcomeMessage()}"
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMessageCount(3)}
              className="text-green-400 hover:text-green-300 text-xs mt-1 h-5 px-2"
            >
              Pasar a modo asistente
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-4"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger
                value="ai"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Bot className="h-3 w-3 mr-1" />
                Resumen de IA
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <History className="h-3 w-3 mr-1" />
                Historial Cliente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4 mt-4">
              {/* Sentiment Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Conversation Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Customer Sentiment:
                    </span>
                    <Badge className={cn("text-xs", getSentimentColor())}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Response Time:
                    </span>
                    <span className="text-sm text-green-400">2.3 min avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Resolution Score:
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <Star className="h-3 w-3 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Products with Advanced Features */}
              {detectedProducts.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Productos Detectados
                      <Badge className="bg-amber-600 text-white text-xs">
                        {detectedProducts.length} encontrados
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {detectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex gap-3 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white mb-1">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-400 mb-1">
                              {product.description}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {product.technicalData}
                            </p>
                            <span className="text-sm text-green-400 font-medium">
                              {product.price}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons for sending different types of content */}
                        <div className="grid grid-cols-2 gap-1">
                          {product.hasImage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                sendProductInfo(product.id, "image")
                              }
                              className="text-blue-400 hover:text-blue-300 text-xs h-7 px-2"
                            >
                              📷 Enviar Imagen
                            </Button>
                          )}

                          {product.hasPDF && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendProductInfo(product.id, "pdf")}
                              className="text-red-400 hover:text-red-300 text-xs h-7 px-2"
                            >
                              📄 Enviar PDF
                            </Button>
                          )}

                          {product.hasVideo && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                sendProductInfo(product.id, "video")
                              }
                              className="text-purple-400 hover:text-purple-300 text-xs h-7 px-2"
                            >
                              🎥 Enviar Video
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              sendProductInfo(product.id, "technical")
                            }
                            className="text-gray-400 hover:text-white text-xs h-7 px-2"
                          >
                            📋 Ficha Técnica
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* AI Assistant Mode Indicator */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Estado del Asistente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Modo:</span>
                    <Badge
                      className={cn(
                        "text-xs",
                        isWelcomeMode
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white",
                      )}
                    >
                      {isWelcomeMode
                        ? "Bienvenida Automática"
                        : "Asistente Silencioso"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Mensajes:</span>
                    <span className="text-sm text-gray-300">
                      {messageCount}/3
                    </span>
                  </div>
                  {!isWelcomeMode && (
                    <Button
                      size="sm"
                      onClick={generateAISuggestions}
                      disabled={isGenerating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generar Sugerencias
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* AI Suggestions (Assistant Mode) */}
              {aiSuggestions.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Sugerencias Inteligentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-blue-600 text-white text-xs">
                            Opción {index + 1} •{" "}
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>

                        {editingSuggestion === suggestion.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="bg-gray-600 border-gray-500 text-white text-sm"
                              rows={3}
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={saveEditedSuggestion}
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSuggestion(null)}
                                className="text-gray-400 hover:text-white text-xs px-2 py-1 h-6"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-200 mb-3 leading-relaxed">
                              {suggestion.text}
                            </p>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => sendSuggestion(suggestion.id)}
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                              >
                                ✅ Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editSuggestion(suggestion.id)}
                                className="border-gray-600 text-gray-300 hover:text-white text-xs px-2 py-1 h-6"
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rewriteSuggestion(suggestion.id)}
                                disabled={isGenerating}
                                className="border-gray-600 text-gray-300 hover:text-white text-xs px-2 py-1 h-6"
                              >
                                🔄 Reescribir
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("summarize")}
                    disabled={isGenerating}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Resumir Conversación
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("improve")}
                    disabled={isGenerating}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Mejorar Tono
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("professional")}
                    disabled={isGenerating}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Hacer Profesional
                  </Button>
                </CardContent>
              </Card>

              {/* Canned Responses */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Respuestas Predefinidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => setShowCannedResponses(!showCannedResponses)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ver Respuestas
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 ml-auto transition-transform",
                        showCannedResponses && "rotate-180",
                      )}
                    />
                  </Button>

                  {showCannedResponses && (
                    <div className="space-y-2 mt-2">
                      {/* Category buttons */}
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          "bienvenida",
                          "envios",
                          "precios",
                          "postventa",
                          "reclamos",
                        ].map((category) => (
                          <Button
                            key={category}
                            size="sm"
                            variant={
                              selectedCategory === category
                                ? "default"
                                : "ghost"
                            }
                            className={cn(
                              "text-xs justify-start",
                              selectedCategory === category
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:text-white",
                            )}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </Button>
                        ))}
                      </div>

                      {/* Sample responses for selected category */}
                      <div className="space-y-1">
                        {selectedCategory === "bienvenida" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "¡Hola! Gracias por contactarnos. ¿En qué podemos
                              ayudarte hoy?"
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "Bienvenido a nuestro servicio de atención al
                              cliente..."
                            </Button>
                          </>
                        )}
                        {selectedCategory === "envios" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "Los envíos se realizan de lunes a viernes..."
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "El tiempo de entrega es de 3-5 días hábiles..."
                            </Button>
                          </>
                        )}
                        {selectedCategory === "precios" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "Te envío la lista de precios actualizada..."
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-gray-300 hover:text-white p-2 h-auto"
                            >
                              "Tenemos promociones especiales este mes..."
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom AI Request */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Ask AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Ask AI to help with something specific..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={() => generateSuggestion("custom")}
                    disabled={!customPrompt.trim() || isGenerating}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                </CardContent>
              </Card>

              {/* AI Suggestion Output */}
              {(suggestion || isGenerating) && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      AI Suggestion
                      {isGenerating && (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isGenerating ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-700 rounded-lg p-3">
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">
                            {suggestion}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copySuggestion}
                            className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>

                        <Button
                          onClick={useSuggestion}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Use This Suggestion
                        </Button>

                        {/* Feedback */}
                        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-700">
                          <span className="text-xs text-gray-400">
                            Rate this suggestion:
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => provideFeedback(true)}
                              className="text-gray-400 hover:text-green-400 p-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => provideFeedback(false)}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {/* Customer History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">CA</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">
                        Carlos Martinez
                      </h4>
                      <p className="text-xs text-gray-400">GRUPO ALCON</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        carlos.martinez@grupoalcon.com
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        +1 (555) 123-4567
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        Cliente desde: Enero 2023
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Conversations */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Conversaciones Anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <div className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">
                          15 Feb 2024
                        </span>
                        <Badge className="bg-green-600 text-white text-xs">
                          Resuelto
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Consulta sobre tiempo de entrega orden #AL-2024-0098
                      </p>
                      <span className="text-xs text-gray-500">
                        Agente: Sarah Chen
                      </span>
                    </div>

                    <div className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">
                          08 Feb 2024
                        </span>
                        <Badge className="bg-blue-600 text-white text-xs">
                          Seguimiento
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Solicitud de cotización para mármol carrara
                      </p>
                      <span className="text-xs text-gray-500">
                        Agente: Mike Torres
                      </span>
                    </div>

                    <div className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">
                          28 Ene 2024
                        </span>
                        <Badge className="bg-green-600 text-white text-xs">
                          Resuelto
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Problema con facturación orden anterior
                      </p>
                      <span className="text-xs text-gray-500">
                        Agente: Ana López
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Consulted */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Productos Consultados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-300">
                          Mármol Blanco Carrara
                        </p>
                        <span className="text-xs text-gray-500">
                          Consultado 3 veces
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <Package className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-300">
                          Travertino Romano
                        </p>
                        <span className="text-xs text-gray-500">
                          Consultado 1 vez
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internal Notes */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas Internas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <div className="bg-amber-950/30 border border-amber-600/30 rounded p-2">
                      <p className="text-xs text-amber-200 mb-1">
                        "Cliente VIP - Siempre ofrecer descuentos especiales"
                      </p>
                      <span className="text-xs text-amber-400">
                        Por: Sarah Chen - 15 Feb 2024
                      </span>
                    </div>

                    <div className="bg-blue-950/30 border border-blue-600/30 rounded p-2">
                      <p className="text-xs text-blue-200 mb-1">
                        "Prefiere entregas los martes y jueves"
                      </p>
                      <span className="text-xs text-blue-400">
                        Por: Mike Torres - 08 Feb 2024
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zoho" className="space-y-4 mt-4">
              {/* Zoho CRM Integration */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Cotizaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zohoData.quotes.map((quote) => (
                    <div key={quote.id} className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">
                          {quote.id}
                        </span>
                        <Badge
                          className={cn(
                            "text-xs",
                            quote.status === "approved"
                              ? "bg-green-600 text-white"
                              : quote.status === "pending"
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-600 text-white",
                          )}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">
                          {quote.amount}
                        </span>
                        <span className="text-xs text-gray-400">
                          {quote.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Órdenes de Venta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zohoData.orders.map((order) => (
                    <div key={order.id} className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">
                          {order.id}
                        </span>
                        <Badge className="bg-blue-600 text-white text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">
                          {order.amount}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Facturas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zohoData.invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-gray-700 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">
                          {invoice.id}
                        </span>
                        <Badge className="bg-green-600 text-white text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">
                          {invoice.amount}
                        </span>
                        <span className="text-xs text-gray-400">
                          {invoice.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Zoho Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Crear Nueva Cotización
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Generar Orden de Venta
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir en Zoho CRM
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Response Timer Alert */}
          {pendingResponse && (
            <Card className="bg-orange-900/30 border-orange-600/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-400 text-sm">
                    Recordatorio: Responder en {responseTimer} min
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
