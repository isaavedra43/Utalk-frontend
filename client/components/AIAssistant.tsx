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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bot,
  Send,
  Edit3,
  RefreshCw,
  Target,
  Sparkles,
  Package,
  BarChart3,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Clock,
  User,
  Phone,
  Mail,
  UserPlus,
  Timer,
  FileText,
  Image,
  Video,
  Calendar,
  Receipt,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Star,
  Crown,
  Flame,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Paperclip,
  ExternalLink,
  MessageSquare,
  Brain,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  // Core AI States
  const [assistantMode, setAssistantMode] = useState<
    "welcome" | "assistant" | "escalated" | "review"
  >("assistant");
  const [messageCount, setMessageCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Client Intelligence
  const [clientIntent, setClientIntent] = useState<
    "cotizacion" | "queja" | "venta" | "seguimiento" | "factura"
  >("cotizacion");
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientPriority, setClientPriority] = useState<
    "high" | "medium" | "low"
  >("high");
  const [sentiment, setSentiment] = useState<
    "positive" | "neutral" | "negative"
  >("positive");

  // UI States
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const [activeHistoryTab, setActiveHistoryTab] = useState("ai");
  const [customInstruction, setCustomInstruction] = useState("");
  const [showInstructionForm, setShowInstructionForm] = useState<string | null>(
    null,
  );

  // AI Suggestions with enhanced tracking
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: "1",
      text: "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más.",
      confidence: 0.95,
      tone: "profesional" as const,
      reason:
        "Sugerido por historial del cliente - ha consultado mármoles antes",
      status: null as "accepted" | "modified" | "ignored" | null,
    },
    {
      id: "2",
      text: "Te envío la ficha técnica completa del mármol carrara con precios actualizados. ¿Para qué tipo de aplicación lo necesitas? Interior o exterior?",
      confidence: 0.88,
      tone: "tecnico" as const,
      reason: "Basado en productos detectados en la conversación",
      status: null as "accepted" | "modified" | "ignored" | null,
    },
    {
      id: "3",
      text: "¡Genial! Ese material está súper de moda. Te voy a mandar toda la info que necesitas 😊",
      confidence: 0.82,
      tone: "informal" as const,
      reason: "Tono casual detectado en mensajes del cliente",
      status: null as "accepted" | "modified" | "ignored" | null,
    },
  ]);

  // Products with enhanced data
  const [detectedProducts, setDetectedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara",
      price: "$45.99/m²",
      image: "/placeholder.svg",
      description: "Mármol natural de alta calidad premium para interiores",
      technicalData: "Densidad: 2.7 kg/dm³ • Absorción: <0.5%",
      hasImage: true,
      hasPDF: true,
      hasVideo: true,
      stock: 150,
      consultedTimes: 5,
      isTrending: true,
      lastConsulted: "2 días atrás",
    },
    {
      id: "2",
      name: "Travertino Romano",
      price: "$32.50/m²",
      image: "/placeholder.svg",
      description: "Piedra natural con textura única",
      technicalData: "Densidad: 2.4 kg/dm³ • Absorción: 2-5%",
      hasImage: true,
      hasPDF: true,
      hasVideo: false,
      stock: 8,
      consultedTimes: 2,
      isTrending: false,
      lastConsulted: "1 semana atrás",
    },
  ]);

  // Client info with mini summary
  const [clientInfo, setClientInfo] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    lastOrder: "Orden #AL-2024-0123",
    lastPurchase: "$2,450.00 - 15 Feb 2024",
    totalConversations: 8,
    tags: ["Cliente VIP", "Descuento prometido"],
    riskLevel: "low" as "low" | "medium" | "high",
  });

  // Shared files
  const [sharedFiles, setSharedFiles] = useState([
    {
      id: "1",
      name: "Catálogo_Mármoles_2024.pdf",
      type: "pdf",
      size: "2.4 MB",
      shared: "2h ago",
      direction: "sent",
    },
    {
      id: "2",
      name: "proyecto_baño_principal.jpg",
      type: "image",
      size: "890 KB",
      shared: "1d ago",
      direction: "received",
    },
    {
      id: "3",
      name: "instalacion_carrara.mp4",
      type: "video",
      size: "15.2 MB",
      shared: "3d ago",
      direction: "sent",
    },
  ]);

  // Insights data
  const [insights, setInsights] = useState({
    sentiment: "positive" as "positive" | "neutral" | "negative",
    responseTime: 2.3,
    resolutionScore: 4.2,
    purchaseIntent: 85,
  });

  // Quick instruction examples
  const instructionExamples = [
    "Hazlo más corto",
    "Agrega precio",
    "Hazlo técnico",
    "Hazlo persuasivo",
    "Incluye descuento",
    "Más formal",
  ];

  // Functions
  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const applySuggestionAction = (
    suggestionId: string,
    action: "accepted" | "modified" | "ignored",
  ) => {
    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: action } : s)),
    );
    console.log(`Suggestion ${suggestionId} was ${action}`);
  };

  const generateNewSuggestion = (suggestionId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newTexts = [
        "Aquí tienes una alternativa: Te voy a compartir toda la información actualizada sobre nuestros mármoles premium.",
        "Otra opción sería: Perfecto, déjame enviarte las especificaciones técnicas completas de nuestros productos estrella.",
        "También podrías usar: ¡Excelente elección! Te voy a preparar toda la documentación que necesitas.",
      ];

      setAiSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                text: newTexts[Math.floor(Math.random() * newTexts.length)],
                status: null,
              }
            : s,
        ),
      );
      setIsGenerating(false);
    }, 1500);
  };

  const applyCustomInstruction = (suggestionId: string) => {
    if (!customInstruction) return;

    setIsGenerating(true);
    setTimeout(() => {
      const suggestion = aiSuggestions.find((s) => s.id === suggestionId);
      if (suggestion) {
        let modifiedText = suggestion.text;

        if (customInstruction.toLowerCase().includes("corto")) {
          modifiedText = modifiedText.split(".")[0] + ".";
        } else if (customInstruction.toLowerCase().includes("precio")) {
          modifiedText += " Los precios están desde $32.50/m² hasta $65.99/m².";
        } else if (customInstruction.toLowerCase().includes("técnico")) {
          modifiedText = modifiedText.replace(
            /\./g,
            ". Especificaciones técnicas: densidad 2.7 kg/dm³.",
          );
        }

        setAiSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggestionId
              ? { ...s, text: modifiedText, status: null }
              : s,
          ),
        );
      }
      setCustomInstruction("");
      setShowInstructionForm(null);
      setIsGenerating(false);
    }, 1000);
  };

  const sendProductMedia = (
    productId: string,
    type: "image" | "pdf" | "video" | "technical",
  ) => {
    const product = detectedProducts.find((p) => p.id === productId);
    console.log(`Sending ${type} for ${product?.name}`);
  };

  const getSentimentIcon = () => {
    switch (insights.sentiment) {
      case "positive":
        return <Smile className="h-4 w-4 text-green-500" />;
      case "negative":
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "bg-green-600 text-white";
      case "modified":
        return "bg-blue-600 text-white";
      case "ignored":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getModeIcon = () => {
    switch (assistantMode) {
      case "welcome":
        return <Bot className="h-4 w-4 text-green-500" />;
      case "assistant":
        return <Brain className="h-4 w-4 text-blue-500" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "review":
        return <Eye className="h-4 w-4 text-purple-500" />;
    }
  };

  const getModeColor = () => {
    switch (assistantMode) {
      case "welcome":
        return "bg-green-600 text-white";
      case "assistant":
        return "bg-blue-600 text-white";
      case "escalated":
        return "bg-yellow-600 text-black";
      case "review":
        return "bg-purple-600 text-white";
    }
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-gray-900 border-l border-gray-800",
        className,
      )}
    >
      {/* BLOCK 1: Estado del Asistente (Fixed Top) */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        {/* Client Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {clientPriority === "high" && (
            <Flame className="h-4 w-4 text-red-500" />
          )}
          {isNewClient && (
            <Badge className="bg-green-600 text-white text-xs">
              Nuevo Cliente
            </Badge>
          )}
          <Badge className="bg-purple-600 text-white text-xs capitalize">
            {clientIntent}
          </Badge>
          {clientInfo.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} className="bg-amber-600 text-white text-xs">
              {tag.includes("VIP") && <Crown className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
          {clientInfo.tags.length > 2 && (
            <Badge className="bg-gray-600 text-white text-xs">
              +{clientInfo.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Assistant Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <h3 className="font-semibold text-white">AI Copilot</h3>
            <Badge className={cn("text-xs", getModeColor())}>
              {assistantMode === "welcome" && "Bienvenida"}
              {assistantMode === "assistant" && "Asistente"}
              {assistantMode === "escalated" && "Escalado"}
              {assistantMode === "review" && "Revisión"}
            </Badge>
          </div>

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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mini Client Summary */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">CA</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {clientInfo.name}
              </h4>
              <p className="text-xs text-gray-400">{clientInfo.company}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-400">
              <span className="text-gray-500">Último pedido:</span>
              <br />
              <span className="text-gray-300">{clientInfo.lastOrder}</span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Última compra:</span>
              <br />
              <span className="text-green-400">{clientInfo.lastPurchase}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* BLOCK 2: Sugerencias de Respuesta de IA */}
          <Collapsible
            open={!collapsedSections["suggestions"]}
            onOpenChange={() => toggleSection("suggestions")}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-gray-750">
                  <CardTitle className="text-sm text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Sugerencias de IA
                      <Badge className="bg-blue-600 text-white text-xs">
                        {aiSuggestions.length}
                      </Badge>
                    </div>
                    {collapsedSections["suggestions"] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2 flex-wrap">
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
                          {suggestion.status && (
                            <Badge
                              className={cn(
                                "text-xs",
                                getStatusColor(suggestion.status),
                              )}
                            >
                              {suggestion.status === "accepted" && "✓ Aceptada"}
                              {suggestion.status === "modified" &&
                                "✎ Modificada"}
                              {suggestion.status === "ignored" && "✗ Ignorada"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>

                      <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {suggestion.reason}
                      </div>

                      {/* Custom Instruction Form */}
                      {showInstructionForm === suggestion.id && (
                        <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-600">
                          <Input
                            placeholder="ej: hazlo más corto, agrega precio..."
                            value={customInstruction}
                            onChange={(e) =>
                              setCustomInstruction(e.target.value)
                            }
                            className="bg-gray-700 border-gray-600 text-white text-sm mb-2"
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              applyCustomInstruction(suggestion.id)
                            }
                          />
                          <div className="flex gap-1 mb-2 flex-wrap">
                            {instructionExamples.map((example) => (
                              <Button
                                key={example}
                                size="sm"
                                variant="ghost"
                                onClick={() => setCustomInstruction(example)}
                                className="text-blue-400 hover:text-blue-300 text-xs h-6 px-2"
                              >
                                {example}
                              </Button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() =>
                                applyCustomInstruction(suggestion.id)
                              }
                              disabled={!customInstruction || isGenerating}
                              className="bg-purple-600 hover:bg-purple-700 text-xs h-6"
                            >
                              🎯 Aplicar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowInstructionForm(null)}
                              className="text-gray-400 hover:text-white text-xs h-6"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          onClick={() =>
                            applySuggestionAction(suggestion.id, "accepted")
                          }
                          className="bg-green-600 hover:bg-green-700 text-xs h-7"
                        >
                          ✉️ Enviar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowInstructionForm(
                              showInstructionForm === suggestion.id
                                ? null
                                : suggestion.id,
                            )
                          }
                          className="border-blue-600 text-blue-400 hover:text-blue-300 text-xs h-7"
                        >
                          ✍️ Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateNewSuggestion(suggestion.id)}
                          disabled={isGenerating}
                          className="border-amber-600 text-amber-400 hover:text-amber-300 text-xs h-7"
                        >
                          🔁 Reescribir
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowInstructionForm(
                              showInstructionForm === suggestion.id
                                ? null
                                : suggestion.id,
                            )
                          }
                          className="border-purple-600 text-purple-400 hover:text-purple-300 text-xs h-7"
                        >
                          🎯 Instrucción
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* BLOCK 3: Productos Detectados */}
          <Collapsible
            open={!collapsedSections["products"]}
            onOpenChange={() => toggleSection("products")}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-gray-750">
                  <CardTitle className="text-sm text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Productos Detectados
                      <Badge className="bg-amber-600 text-white text-xs">
                        {detectedProducts.length} encontrados
                      </Badge>
                    </div>
                    {collapsedSections["products"] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ScrollArea className="max-h-80">
                    <div className="space-y-3">
                      {detectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-gray-700 rounded-lg p-4 shadow-md"
                        >
                          <div className="flex gap-3 mb-3">
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              {product.isTrending && (
                                <TrendingUp className="absolute -top-1 -right-1 h-4 w-4 text-orange-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">
                                  {product.name}
                                </h4>
                                {product.stock <= 10 && product.stock > 0 && (
                                  <Badge className="bg-orange-600 text-white text-xs">
                                    ⏳ Últimas
                                  </Badge>
                                )}
                                {product.stock === 0 && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mb-1">
                                {product.description}
                              </p>
                              <p className="text-xs text-gray-500 mb-2">
                                {product.technicalData}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-400 font-medium">
                                  {product.price}
                                </span>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    product.stock > 50
                                      ? "bg-green-600 text-white"
                                      : product.stock > 0
                                        ? "bg-orange-600 text-white"
                                        : "bg-red-600 text-white",
                                  )}
                                >
                                  Stock: {product.stock}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {product.isTrending && (
                            <div className="bg-orange-900/30 border border-orange-600/30 rounded p-2 mb-3">
                              <p className="text-orange-400 text-xs">
                                🔥 Producto en tendencia - Consultado{" "}
                                {product.consultedTimes} veces por este cliente
                              </p>
                            </div>
                          )}

                          {product.stock === 0 && (
                            <div className="bg-red-900/30 border border-red-600/30 rounded p-2 mb-3">
                              <p className="text-red-400 text-xs">
                                ⚠️ Sin stock disponible - Considerar
                                alternativas similares
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-1">
                            {product.hasImage && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  sendProductMedia(product.id, "image")
                                }
                                disabled={product.stock === 0}
                                className="text-blue-400 hover:text-blue-300 text-xs h-7 disabled:opacity-50"
                              >
                                📷 Imagen
                              </Button>
                            )}
                            {product.hasPDF && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  sendProductMedia(product.id, "pdf")
                                }
                                className="text-red-400 hover:text-red-300 text-xs h-7"
                              >
                                📄 PDF
                              </Button>
                            )}
                            {product.hasVideo && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  sendProductMedia(product.id, "video")
                                }
                                className="text-purple-400 hover:text-purple-300 text-xs h-7"
                              >
                                🎥 Video
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                sendProductMedia(product.id, "technical")
                              }
                              className="text-gray-400 hover:text-white text-xs h-7"
                            >
                              📘 Ficha
                            </Button>
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            Consultado {product.consultedTimes} veces • Última
                            vez: {product.lastConsulted}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* BLOCK 4: Insights del Cliente */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Insights del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon()}
                    <span className="text-sm text-gray-400">Sentimiento</span>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      insights.sentiment === "positive"
                        ? "bg-green-600 text-white"
                        : insights.sentiment === "negative"
                          ? "bg-red-600 text-white"
                          : "bg-yellow-600 text-white",
                    )}
                  >
                    {insights.sentiment}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Intención Compra
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-2 bg-gray-600 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${insights.purchaseIntent}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-400">
                      {insights.purchaseIntent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Tiempo Respuesta
                  </span>
                  <span className="text-sm text-green-400">
                    {insights.responseTime} min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Score Resolución
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(insights.resolutionScore)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600",
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {insights.resolutionScore}/5
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BLOCK 5: Historial (Tabs dinámicos) */}
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeHistoryTab}
                onValueChange={setActiveHistoryTab}
              >
                <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                  <TabsTrigger
                    value="ai"
                    className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    🧠 IA
                  </TabsTrigger>
                  <TabsTrigger
                    value="crm"
                    className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    📝 CRM
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    💬 Chat
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="mt-3">
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        • 3 sugerencias generadas hoy
                      </div>
                      <div className="text-xs text-gray-400">
                        • 85% de aceptación en sugerencias
                      </div>
                      <div className="text-xs text-gray-400">
                        • Productos detectados: mármol, travertino
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="crm" className="mt-3">
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Cotización Q-2024-001
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 text-xs h-5"
                        >
                          📩 Reenviar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Orden O-2024-123
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-400 text-xs h-5"
                        >
                          ✅ Seguimiento
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="chat" className="mt-3">
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        • 8 conversaciones totales
                      </div>
                      <div className="text-xs text-gray-400">
                        • Última: consulta sobre entrega
                      </div>
                      <div className="text-xs text-gray-400">
                        • Resolución promedio: 4.2/5
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* BLOCK 6: Archivos Compartidos */}
          <Collapsible
            open={!collapsedSections["files"]}
            onOpenChange={() => toggleSection("files")}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-gray-750">
                  <CardTitle className="text-sm text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Archivos Compartidos
                      <Badge className="bg-gray-600 text-white text-xs">
                        {sharedFiles.length}
                      </Badge>
                    </div>
                    {collapsedSections["files"] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-2">
                      {sharedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {file.type === "pdf" && (
                              <FileText className="h-8 w-8 text-red-400" />
                            )}
                            {file.type === "image" && (
                              <Image className="h-8 w-8 text-blue-400" />
                            )}
                            {file.type === "video" && (
                              <Video className="h-8 w-8 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size} • {file.shared} •
                              <span
                                className={cn(
                                  "ml-1",
                                  file.direction === "sent"
                                    ? "text-blue-400"
                                    : "text-green-400",
                                )}
                              >
                                {file.direction === "sent"
                                  ? "Enviado"
                                  : "Recibido"}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* BLOCK 7: Acciones Rápidas (Footer) */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs"
              >
                <Timer className="h-3 w-3 mr-1" />
                Responder Después
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                En 5 minutos
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                En 15 minutos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
            <Receipt className="h-3 w-3 mr-1" />
            Cotización Rápida
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-amber-600 text-amber-400 hover:bg-amber-600/20 text-xs"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Reasignar
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-600/20 text-xs"
          >
            <Bell className="h-3 w-3 mr-1" />
            Recordatorio
          </Button>
        </div>
      </div>
    </div>
  );
}
