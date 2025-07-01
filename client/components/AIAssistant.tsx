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
} from "@/components/ui/dropdown-menu";
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
  Eye,
  Download,
  Clock,
  User,
  UserPlus,
  Timer,
  FileText,
  Image,
  Video,
  Receipt,
  AlertTriangle,
  TrendingUp,
  HelpCircle,
  Star,
  Crown,
  Flame,
  MessageSquare,
  Brain,
  Bell,
  Paperclip,
  Filter,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  // Core States
  const [assistantMode, setAssistantMode] = useState<"automatic" | "assistant">(
    "assistant",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReminderAlert, setShowReminderAlert] = useState(false);

  // Client Data
  const [clientInfo, setClientInfo] = useState({
    name: "Carlos Martinez",
    company: "GRUPO ALCON",
    tags: ["Cliente VIP", "Descuento prometido"],
    lastActivity: "5 min ago",
    responseDelay: 2, // hours without response
    score: 2.1, // low score (anomaly)
    productsViewed: 8,
  });

  // AI Suggestions with tracking
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: "1",
      text: "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más.",
      confidence: 95,
      reason:
        "Sugerido por historial del cliente - ha consultado mármoles 5 veces antes",
      status: null as "accepted" | "edited" | "rejected" | null,
      tone: "profesional" as const,
    },
    {
      id: "2",
      text: "Te envío la ficha técnica completa del mármol carrara con precios actualizados. ¿Para qué tipo de aplicación lo necesitas?",
      confidence: 88,
      reason: "Basado en productos detectados en la conversación actual",
      status: null as "accepted" | "edited" | "rejected" | null,
      tone: "tecnico" as const,
    },
    {
      id: "3",
      text: "¡Genial! Ese material está súper de moda. Te voy a mandar toda la info que necesitas 😊",
      confidence: 82,
      reason: "Tono casual detectado en mensajes del cliente",
      status: null as "accepted" | "edited" | "rejected" | null,
      tone: "informal" as const,
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
      density: "2.7 kg/dm³",
      absorption: "<0.5%",
      stock: 150,
      trend: true,
      viewedByClient: 5,
      reason: "Cliente consultó 'mármol blanco' en mensaje anterior",
    },
    {
      id: "2",
      name: "Travertino Romano",
      price: "$32.50/m²",
      image: "/placeholder.svg",
      description: "Piedra natural con textura única",
      density: "2.4 kg/dm³",
      absorption: "2-5%",
      stock: 8,
      trend: false,
      viewedByClient: 2,
      reason: "Detectado 'travertino' en conversación",
    },
  ]);

  // Shared files organized by type
  const [sharedFiles, setSharedFiles] = useState({
    images: [
      {
        id: "1",
        name: "proyecto_baño_principal.jpg",
        size: "890 KB",
        date: "Ayer",
        direction: "received",
      },
      {
        id: "2",
        name: "muestra_carrara_instalado.jpg",
        size: "1.2 MB",
        date: "2 días",
        direction: "sent",
      },
    ],
    documents: [
      {
        id: "3",
        name: "Catálogo_Mármoles_2024.pdf",
        size: "2.4 MB",
        date: "3 días",
        direction: "sent",
      },
      {
        id: "4",
        name: "Cotizaci��n_AL-2024-001.pdf",
        size: "245 KB",
        date: "1 semana",
        direction: "sent",
      },
    ],
    videos: [
      {
        id: "5",
        name: "instalacion_carrara.mp4",
        size: "15.2 MB",
        date: "1 semana",
        direction: "sent",
      },
    ],
  });

  // Custom instruction form
  const [editingInstructionFor, setEditingInstructionFor] = useState<
    string | null
  >(null);
  const [customInstruction, setCustomInstruction] = useState("");
  const [activeFileTab, setActiveFileTab] = useState("images");
  const [activeHistoryTab, setActiveHistoryTab] = useState("zoho");

  // Functions
  const updateSuggestionStatus = (
    suggestionId: string,
    status: "accepted" | "edited" | "rejected",
  ) => {
    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status } : s)),
    );
    console.log(`Suggestion ${suggestionId} was ${status}`);
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

        if (customInstruction.toLowerCase().includes("más corto")) {
          modifiedText = modifiedText.split(".")[0] + ".";
        } else if (customInstruction.toLowerCase().includes("precio")) {
          modifiedText += " Los precios están desde $32.50/m² hasta $65.99/m².";
        } else if (customInstruction.toLowerCase().includes("técnico")) {
          modifiedText = modifiedText.replace(
            /\./,
            ". Especificaciones técnicas: densidad 2.7 kg/dm³, absorción <0.5%.",
          );
        } else if (customInstruction.toLowerCase().includes("persuasivo")) {
          modifiedText =
            "🎯 " + modifiedText + " ¡Esta es una oportunidad única!";
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
      setEditingInstructionFor(null);
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

  const explainProductSuggestion = (productId: string) => {
    const product = detectedProducts.find((p) => p.id === productId);
    alert(`💡 ${product?.reason}`);
  };

  const setReminder = (minutes: number) => {
    setShowReminderAlert(true);
    setTimeout(
      () => {
        alert(`⏰ Recordatorio: Responder a ${clientInfo.name}`);
        setShowReminderAlert(false);
      },
      minutes * 60 * 1000,
    );
  };

  // Check for anomalies that need alerts
  const hasAnomalies = clientInfo.score < 3 || clientInfo.responseDelay > 24;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-gray-900 border-l border-gray-800",
        className,
      )}
    >
      {/* BLOCK 1: Estado del Asistente (Fixed Top) */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain
                className={cn(
                  "h-5 w-5",
                  assistantMode === "automatic"
                    ? "text-green-500"
                    : "text-blue-500",
                )}
              />
              <h3 className="font-semibold text-white">AI Copilot</h3>
            </div>
            <Badge
              className={cn(
                "text-xs",
                assistantMode === "automatic"
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white",
              )}
            >
              {assistantMode === "automatic"
                ? "Modo IA automático"
                : "Modo asistente"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setAssistantMode(
                  assistantMode === "automatic" ? "assistant" : "automatic",
                )
              }
              className="text-gray-400 hover:text-white text-xs"
            >
              Cambiar
            </Button>
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

        {/* Client tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {clientInfo.tags.map((tag) => (
            <Badge key={tag} className="bg-amber-600 text-white text-xs">
              {tag.includes("VIP") && <Crown className="h-3 w-3 mr-1" />}
              {tag}
            </Badge>
          ))}
          <Badge className="bg-gray-600 text-white text-xs">
            {clientInfo.productsViewed} productos vistos
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* BLOCK 2: Respuestas Sugeridas (Burbujas) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-medium text-white">
                Respuestas Sugeridas
              </h4>
              <Badge className="bg-blue-600 text-white text-xs">
                {aiSuggestions.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={suggestion.id} className="space-y-3">
                  {/* Bubble-style suggestion */}
                  <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-lg max-w-[90%]">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white text-xs">
                        IA • {suggestion.confidence}%
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
                            suggestion.status === "accepted" &&
                              "bg-green-600 text-white",
                            suggestion.status === "edited" &&
                              "bg-blue-600 text-white",
                            suggestion.status === "rejected" &&
                              "bg-red-600 text-white",
                          )}
                        >
                          {suggestion.status === "accepted" && "✓ Aceptada"}
                          {suggestion.status === "edited" && "✎ Editada"}
                          {suggestion.status === "rejected" && "✗ Rechazada"}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-800 text-sm leading-relaxed mb-3">
                      {suggestion.text}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                      <Sparkles className="h-3 w-3" />
                      <span>{suggestion.reason}</span>
                    </div>

                    {/* Custom instruction form */}
                    {editingInstructionFor === suggestion.id && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 border">
                        <Input
                          placeholder="ej: hazlo más corto, agrega precio, hazlo técnico..."
                          value={customInstruction}
                          onChange={(e) => setCustomInstruction(e.target.value)}
                          className="bg-white border-gray-300 text-gray-800 text-sm mb-2"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            applyCustomInstruction(suggestion.id)
                          }
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              applyCustomInstruction(suggestion.id)
                            }
                            disabled={!customInstruction || isGenerating}
                            className="bg-purple-600 hover:bg-purple-700 text-xs h-6"
                          >
                            Aplicar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingInstructionFor(null)}
                            className="text-gray-600 hover:text-gray-800 text-xs h-6"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateSuggestionStatus(suggestion.id, "accepted")
                        }
                        className="bg-green-600 hover:bg-green-700 text-xs h-7"
                      >
                        Enviar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditingInstructionFor(
                            editingInstructionFor === suggestion.id
                              ? null
                              : suggestion.id,
                          )
                        }
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs h-7"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateNewSuggestion(suggestion.id)}
                        disabled={isGenerating}
                        className="border-amber-600 text-amber-600 hover:bg-amber-50 text-xs h-7"
                      >
                        Reescribir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditingInstructionFor(
                            editingInstructionFor === suggestion.id
                              ? null
                              : suggestion.id,
                          )
                        }
                        className="border-purple-600 text-purple-600 hover:bg-purple-50 text-xs h-7"
                      >
                        Aplicar instrucción
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCK 3: Insights del Cliente (Solo Anómalos) */}
          {hasAnomalies && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-medium text-white">
                  Insights del Cliente
                </h4>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>

              <div className="space-y-2">
                {clientInfo.score < 3 && (
                  <div className="flex items-center gap-2 p-2 bg-red-900/30 border border-red-600/30 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm">
                      Score muy bajo: {clientInfo.score}/5
                    </span>
                  </div>
                )}

                {clientInfo.responseDelay > 24 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">
                      Sin respuesta: {clientInfo.responseDelay}h
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCK 4: Productos Detectados (Cards limpios) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <Package className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-medium text-white">
                Productos Detectados
              </h4>
              <Badge className="bg-green-600 text-white text-xs">
                {detectedProducts.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {detectedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white border border-gray-200 shadow-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        {product.trend && (
                          <TrendingUp className="absolute -top-1 -right-1 h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium text-gray-800">
                            {product.name}
                          </h5>
                          {product.trend && (
                            <Badge className="bg-orange-600 text-white text-xs">
                              🔥 Tendencia
                            </Badge>
                          )}
                          {product.stock <= 10 && (
                            <Badge className="bg-red-600 text-white text-xs">
                              Pocas unidades
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {product.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                          <div>
                            <strong>Densidad:</strong> {product.density}
                          </div>
                          <div>
                            <strong>Absorción:</strong> {product.absorption}
                          </div>
                          <div>
                            <strong>Stock:</strong> {product.stock} unidades
                          </div>
                          <div className="text-green-600 font-medium">
                            {product.price}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => explainProductSuggestion(product.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Explicar por qué se sugiere
                      </Button>
                      <p className="text-xs text-gray-600 mt-1">
                        Visto {product.viewedByClient} veces por este cliente
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendProductMedia(product.id, "image")}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs h-7"
                      >
                        📷 Imagen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendProductMedia(product.id, "pdf")}
                        className="text-red-600 border-red-600 hover:bg-red-50 text-xs h-7"
                      >
                        📄 PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendProductMedia(product.id, "video")}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50 text-xs h-7"
                      >
                        🎥 Video
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          sendProductMedia(product.id, "technical")
                        }
                        className="text-gray-600 border-gray-600 hover:bg-gray-50 text-xs h-7"
                      >
                        📘 Ficha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* BLOCK 5: Archivos y Medios Compartidos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <Paperclip className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-medium text-white">
                Archivos y medios compartidos
              </h4>
            </div>

            <Tabs value={activeFileTab} onValueChange={setActiveFileTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger
                  value="images"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  📸 Imágenes ({sharedFiles.images.length})
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  📄 Documentos ({sharedFiles.documents.length})
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  🎥 Videos ({sharedFiles.videos.length})
                </TabsTrigger>
              </TabsList>

              <div className="mt-3">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {sharedFiles[activeFileTab as keyof typeof sharedFiles].map(
                      (file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            {activeFileTab === "images" && (
                              <Image className="h-6 w-6 text-blue-400" />
                            )}
                            {activeFileTab === "documents" && (
                              <FileText className="h-6 w-6 text-red-400" />
                            )}
                            {activeFileTab === "videos" && (
                              <Video className="h-6 w-6 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size} • {file.date} •
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
                      ),
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>

          {/* BLOCK 6: Historial CRM y Zoho (Tabs reales) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <History className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-medium text-white">Historial</h4>
            </div>

            <Tabs value={activeHistoryTab} onValueChange={setActiveHistoryTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger
                  value="zoho"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  📜 Historial Zoho
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  🧠 IA
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  📈 Insights
                </TabsTrigger>
              </TabsList>

              <div className="mt-3">
                <ScrollArea className="h-32">
                  {activeHistoryTab === "zoho" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-white">
                            Cotización Q-2024-001
                          </p>
                          <p className="text-xs text-gray-400">
                            $2,450.00 • Pendiente
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 text-xs h-6"
                          >
                            📩 Reenviar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-400 text-xs h-6"
                          >
                            ✅ Seguimiento
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <div>
                          <p className="text-sm text-white">Orden O-2024-123</p>
                          <p className="text-xs text-gray-400">
                            $1,890.50 • En proceso
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-400 text-xs h-6"
                        >
                          📎 Adjuntar archivo
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeHistoryTab === "ai" && (
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>• 3 sugerencias generadas hoy</div>
                      <div>• 85% de aceptación en sugerencias</div>
                      <div>• Productos detectados: mármol, travertino</div>
                      <div>
                        • Información faltante detectada: medidas del proyecto
                      </div>
                    </div>
                  )}

                  {activeHistoryTab === "insights" && (
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>• 8 conversaciones totales</div>
                      <div>• Resolución promedio: 4.2/5</div>
                      <div>• Productos favoritos: mármol carrara</div>
                      <div>• Mejor horario de contacto: 9-11 AM</div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>
      </ScrollArea>

      {/* BLOCK 7: Responder Después (Footer) */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs flex-1"
              >
                <Timer className="h-3 w-3 mr-1" />
                Responder después
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={() => setReminder(5)}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                En 5 minutos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReminder(15)}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                En 15 minutos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setReminder(60)}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                En 1 hora
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs flex-1"
          >
            <Receipt className="h-3 w-3 mr-1" />
            Cotización rápida
          </Button>
        </div>

        {showReminderAlert && (
          <div className="mt-2 p-2 bg-orange-900/30 border border-orange-600/30 rounded flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 text-xs">
              Recordatorio configurado
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
