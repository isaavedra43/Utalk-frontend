import { useState, useEffect } from "react";
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
  // Core AI States
  const [isWelcomeMode, setIsWelcomeMode] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");

  // Client Intelligence
  const [clientIntent, setClientIntent] = useState<
    "cotizacion" | "queja" | "venta" | "seguimiento" | "factura" | null
  >("cotizacion");
  const [isNewClient, setIsNewClient] = useState(true);
  const [clientPriority, setClientPriority] = useState<
    "high" | "medium" | "low"
  >("high");
  const [sentiment, setSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("positive");

  // Sales & Response Management
  const [salesClosed, setSalesClosed] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [responseTimer, setResponseTimer] = useState<number | null>(null);
  const [pendingResponse, setPendingResponse] = useState(false);

  // AI Customization
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
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(
    null,
  );
  const [editedText, setEditedText] = useState("");

  // Product Detection & Inventory
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

  // Client Information
  const [clientInfo, setClientInfo] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    totalConversations: 3,
    lastPurchase: "15 Feb 2024",
    tags: ["Cliente VIP", "Descuento prometido"],
    riskLevel: "low" as "low" | "medium" | "high",
  });

  // Zoho CRM Integration
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

  const generateAISuggestions = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const baseTexts = {
        informal: [
          "¡Perfecto! Te puedo ayudar con eso. ¿Qué tipo de mármol tienes en mente? Tenemos opciones increíbles.",
          "¡Genial! Ese material está súper de moda. Te voy a mandar toda la info que necesitas.",
          "¡Qué bueno que preguntes! Justo tenemos promociones en esos productos esta semana.",
        ],
        profesional: [
          "Con mucho gusto le asisto con información detallada sobre nuestros productos de mármol y piedra natural.",
          "Le proporcionaré las especificaciones técnicas completas y opciones de pricing para su proyecto.",
          "Permítame ofrecerle una cotización personalizada basada en sus requerimientos específicos.",
        ],
        tecnico: [
          "Excelente elección. Las características técnicas de este material incluyen: densidad 2.7 kg/dm³, absorción <0.5%.",
          "Para aplicaciones estructurales, este material cumple con normas ASTM C615 y ofrece resistencia superior.",
          "Los parámetros de instalación recomendados para este producto requieren mortero específico tipo...",
        ],
      };

      const tones: Array<"informal" | "tecnico" | "profesional"> = [
        "informal",
        "profesional",
        "tecnico",
      ];

      const suggestions = tones.map((tone, index) => ({
        id: `${Date.now()}-${index}`,
        text: customInstruction
          ? `${baseTexts[tone][0]} ${customInstruction.toLowerCase().includes("corto") ? "" : "Además, " + baseTexts[tone][1]}`
          : baseTexts[tone][Math.floor(Math.random() * baseTexts[tone].length)],
        confidence: 0.85 + Math.random() * 0.15,
        category: clientIntent || "general",
        tone,
        reason: `Sugerencia ${tone} basada en: ${clientIntent ? `intención de ${clientIntent}` : "contexto general"}, sentimiento ${sentiment}, cliente ${isNewClient ? "nuevo" : "recurrente"}`,
      }));

      setAiSuggestions(suggestions);
      setIsGenerating(false);
      setCustomInstruction("");
    }, 1500);
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
  };

  const sendSuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      console.log("Sending suggestion:", suggestion.text);
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
        "Perfecto, me da mucho gusto que estés interesado en nuestros productos de mármol. ¿Podrías contarme un poco más sobre tu proyecto?",
        "¡Excelente! El mármol carrara es realmente excepcional. Te voy a compartir toda la información técnica.",
        "Claro que sí, con mucho gusto te preparo una cotización personalizada.",
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
    }
  };

  const logAgentDecision = (
    suggestionId: string,
    action: "accepted" | "modified" | "ignored",
  ) => {
    console.log(`Agent decision: ${action} for suggestion ${suggestionId}`);
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

  // Auto-switch to assistant mode after 3 messages
  useEffect(() => {
    if (messageCount >= 3) {
      setIsWelcomeMode(false);
    }
  }, [messageCount]);

  return (
    <div
      className={cn(
        "h-full flex flex-col border-l border-gray-800",
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900",
        className,
      )}
    >
      {/* Advanced Header with Client Intelligence */}
      <div
        className={cn(
          "p-4 border-b",
          isDarkMode ? "border-gray-800" : "border-gray-200",
        )}
      >
        {/* Client Priority & Intent Indicators */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {clientPriority === "high" && (
            <Flame className="h-4 w-4 text-red-500" />
          )}
          {isNewClient && (
            <Badge className="bg-green-600 text-white text-xs">
              Nuevo Cliente
            </Badge>
          )}
          {clientIntent && (
            <Badge className="bg-purple-600 text-white text-xs">
              {clientIntent.charAt(0).toUpperCase() + clientIntent.slice(1)}
            </Badge>
          )}
          {clientInfo.tags.map((tag) => (
            <Badge key={tag} className="bg-amber-600 text-white text-xs">
              {tag.includes("VIP") && <Crown className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3
              className={cn(
                "font-semibold",
                isDarkMode ? "text-white" : "text-gray-900",
              )}
            >
              AI Copilot
            </h3>
            <Badge
              variant="outline"
              className="border-blue-500 text-blue-400 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn("text-gray-400 hover:text-white")}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

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
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <DropdownMenuItem
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sarah Chen - Ventas
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  Mike Torres - Soporte
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  Ana López - Postventa
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={cn(isDarkMode ? "bg-gray-700" : "bg-gray-200")}
                />
                <DropdownMenuItem
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Área de Facturación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p
          className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600",
          )}
        >
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
          {/* Advanced Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Responder Después
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <DropdownMenuItem
                  onClick={() => setResponseReminder(5)}
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  En 5 minutos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setResponseReminder(10)}
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  En 10 minutos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setResponseReminder(15)}
                  className={cn(
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  En 15 minutos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              onClick={() => setSalesClosed(!salesClosed)}
              className={cn(
                "text-xs",
                salesClosed
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              )}
            >
              <Target className="h-3 w-3 mr-1" />
              {salesClosed ? "Venta Cerrada" : "Cerrar Venta"}
            </Button>
          </div>

          {/* Sales Closure Form */}
          {!salesClosed && (
            <div
              className={cn(
                "mb-4 p-3 rounded-lg border",
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200",
              )}
            >
              <label
                className={cn(
                  "text-xs block mb-1",
                  isDarkMode ? "text-gray-400" : "text-gray-600",
                )}
              >
                Monto Estimado de Venta
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="$0.00"
                  value={estimatedAmount}
                  onChange={(e) => setEstimatedAmount(e.target.value)}
                  className={cn(
                    "text-sm",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900",
                  )}
                />
                <Button
                  size="sm"
                  onClick={closeSale}
                  disabled={!estimatedAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Main Advanced Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-4"
          >
            <TabsList
              className={cn(
                "grid w-full grid-cols-3",
                isDarkMode ? "bg-gray-800" : "bg-gray-100",
              )}
            >
              <TabsTrigger
                value="ai"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Brain className="h-3 w-3 mr-1" />
                Asistente IA
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <History className="h-3 w-3 mr-1" />
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="zoho"
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Receipt className="h-3 w-3 mr-1" />
                Zoho CRM
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4 mt-4">
              {/* AI Assistant Status */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <Bot className="h-4 w-4" />
                    Estado del Asistente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Modo:
                    </span>
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
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Mensajes:
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-300" : "text-gray-700",
                      )}
                    >
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

              {/* Conversation Insights */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Insights de Conversación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Sentimiento Cliente:
                    </span>
                    <Badge className={cn("text-xs", getSentimentColor())}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Tiempo Respuesta:
                    </span>
                    <span className="text-sm text-green-400">
                      2.3 min promedio
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Score Resolución:
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

              {/* Custom AI Instructions */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <Lightbulb className="h-4 w-4" />
                    Instrucciones Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    placeholder="ej: hazlo más corto, agrega precio..."
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    className={cn(
                      "text-sm",
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900",
                    )}
                  />
                  <Button
                    size="sm"
                    onClick={() => generateAISuggestions()}
                    disabled={isGenerating || !customInstruction}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Aplicar Instrucción
                  </Button>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <Card
                  className={cn(
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200",
                  )}
                >
                  <CardHeader className="pb-3">
                    <CardTitle
                      className={cn(
                        "text-sm flex items-center gap-2",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Sugerencias Inteligentes
                      <Badge className="bg-blue-600 text-white text-xs">
                        {aiSuggestions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className={cn(
                          "rounded-lg p-3",
                          isDarkMode ? "bg-gray-700" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-1 flex-wrap">
                            <Badge className="bg-blue-600 text-white text-xs">
                              Opción {index + 1} •{" "}
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                suggestion.tone === "informal" &&
                                  "bg-green-600 text-white",
                                suggestion.tone === "tecnico" &&
                                  "bg-purple-600 text-white",
                                suggestion.tone === "profesional" &&
                                  "bg-gray-600 text-white",
                              )}
                            >
                              {suggestion.tone}
                            </Badge>
                          </div>
                          {suggestion.reason && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "p-1",
                                isDarkMode
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-500 hover:text-gray-700",
                              )}
                              title={suggestion.reason}
                            >
                              <HelpCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {editingSuggestion === suggestion.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className={cn(
                                "text-sm",
                                isDarkMode
                                  ? "bg-gray-600 border-gray-500 text-white"
                                  : "bg-white border-gray-300 text-gray-900",
                              )}
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
                                className={cn(
                                  "text-xs px-2 py-1 h-6",
                                  isDarkMode
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-gray-700",
                                )}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={cn(
                                "text-sm mb-3 leading-relaxed",
                                isDarkMode ? "text-gray-200" : "text-gray-700",
                              )}
                            >
                              {suggestion.text}
                            </p>

                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  sendSuggestion(suggestion.id);
                                  logAgentDecision(suggestion.id, "accepted");
                                }}
                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                              >
                                ✅ Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => editSuggestion(suggestion.id)}
                                className={cn(
                                  "text-xs px-2 py-1 h-6",
                                  isDarkMode
                                    ? "border-gray-600 text-gray-300 hover:text-white"
                                    : "border-gray-300 text-gray-600 hover:text-gray-800",
                                )}
                              >
                                ✏️ Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rewriteSuggestion(suggestion.id)}
                                disabled={isGenerating}
                                className={cn(
                                  "text-xs px-2 py-1 h-6",
                                  isDarkMode
                                    ? "border-gray-600 text-gray-300 hover:text-white"
                                    : "border-gray-300 text-gray-600 hover:text-gray-800",
                                )}
                              >
                                🔄 Reescribir
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  logAgentDecision(suggestion.id, "ignored")
                                }
                                className="border-red-600 text-red-400 hover:text-red-300 text-xs px-2 py-1 h-6"
                              >
                                ❌ Ignorar
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Advanced Product Detection */}
              {detectedProducts.length > 0 && (
                <Card
                  className={cn(
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200",
                  )}
                >
                  <CardHeader className="pb-3">
                    <CardTitle
                      className={cn(
                        "text-sm flex items-center gap-2",
                        isDarkMode ? "text-white" : "text-gray-900",
                      )}
                    >
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
                        className={cn(
                          "rounded-lg p-3",
                          isDarkMode ? "bg-gray-700" : "bg-gray-50",
                        )}
                      >
                        <div className="flex gap-3 mb-3">
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            {product.isTrending && (
                              <TrendingUp className="absolute -top-1 -right-1 h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={cn(
                                  "text-sm font-medium",
                                  isDarkMode ? "text-white" : "text-gray-900",
                                )}
                              >
                                {product.name}
                              </h4>
                              {product.stock === 0 && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-xs mb-1",
                                isDarkMode ? "text-gray-400" : "text-gray-600",
                              )}
                            >
                              {product.description}
                            </p>
                            <p
                              className={cn(
                                "text-xs mb-1",
                                isDarkMode ? "text-gray-500" : "text-gray-500",
                              )}
                            >
                              {product.technicalData}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-green-400 font-medium">
                                {product.price}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    product.stock > 50
                                      ? "bg-green-600 text-white"
                                      : product.stock > 0
                                        ? "bg-yellow-600 text-white"
                                        : "bg-red-600 text-white",
                                  )}
                                >
                                  Stock: {product.stock}
                                </Badge>
                                {product.consultedTimes > 3 && (
                                  <Badge className="bg-orange-600 text-white text-xs">
                                    🔥 Tendencia
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {product.stock === 0 && (
                          <div className="bg-red-900/30 border border-red-600/30 rounded p-2 mb-2">
                            <p className="text-red-400 text-xs">
                              ⚠️ Sin stock disponible - Considerar alternativas
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-1">
                          {product.hasImage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                sendProductInfo(product.id, "image")
                              }
                              disabled={product.stock === 0}
                              className="text-blue-400 hover:text-blue-300 text-xs h-7 px-2 disabled:opacity-50"
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
                            className={cn(
                              "text-xs h-7 px-2",
                              isDarkMode
                                ? "text-gray-400 hover:text-white"
                                : "text-gray-600 hover:text-gray-800",
                            )}
                          >
                            📋 Ficha Técnica
                          </Button>
                        </div>

                        <p
                          className={cn(
                            "text-xs mt-2",
                            isDarkMode ? "text-gray-500" : "text-gray-500",
                          )}
                        >
                          Consultado {product.consultedTimes} veces por este
                          cliente
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {/* Customer Information */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <User className="h-4 w-4" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-gray-700" : "bg-gray-200",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-white" : "text-gray-700",
                        )}
                      >
                        CA
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-white" : "text-gray-900",
                        )}
                      >
                        {clientInfo.name}
                      </h4>
                      <p
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        {clientInfo.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail
                        className={cn(
                          "h-3 w-3",
                          isDarkMode ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        carlos.martinez@grupoalcon.com
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone
                        className={cn(
                          "h-3 w-3",
                          isDarkMode ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        +1 (555) 123-4567
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock
                        className={cn(
                          "h-3 w-3",
                          isDarkMode ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        Cliente desde: Enero 2023
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Conversations */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <History className="h-4 w-4" />
                    Conversaciones Anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div
                    className={cn(
                      "rounded p-2",
                      isDarkMode ? "bg-gray-700" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        15 Feb 2024
                      </span>
                      <Badge className="bg-green-600 text-white text-xs">
                        Resuelto
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Consulta sobre tiempo de entrega orden #AL-2024-0098
                    </p>
                    <span
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-500" : "text-gray-500",
                      )}
                    >
                      Agente: Sarah Chen
                    </span>
                  </div>

                  <div
                    className={cn(
                      "rounded p-2",
                      isDarkMode ? "bg-gray-700" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        08 Feb 2024
                      </span>
                      <Badge className="bg-blue-600 text-white text-xs">
                        Seguimiento
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      Solicitud de cotización para mármol carrara
                    </p>
                    <span
                      className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-500" : "text-gray-500",
                      )}
                    >
                      Agente: Mike Torres
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zoho" className="space-y-4 mt-4">
              {/* Zoho CRM Integration */}
              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <Receipt className="h-4 w-4" />
                    Cotizaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zohoData.quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className={cn(
                        "rounded p-2",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-white" : "text-gray-900",
                          )}
                        >
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
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          {quote.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card
                className={cn(
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={cn(
                      "text-sm flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-gray-900",
                    )}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Órdenes de Venta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zohoData.orders.map((order) => (
                    <div
                      key={order.id}
                      className={cn(
                        "rounded p-2",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-white" : "text-gray-900",
                          )}
                        >
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
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          {order.date}
                        </span>
                      </div>
                    </div>
                  ))}
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
