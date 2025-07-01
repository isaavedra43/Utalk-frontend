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
  const [detectedProducts, setDetectedProducts] = useState([
    {
      id: "1",
      name: "Mármol Blanco Carrara",
      price: "$45.99/m²",
      image: "/placeholder.svg",
      description: "Mármol natural de alta calidad",
    },
  ]);

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
          Suggest replies, summarize conversations, or improve message tone
        </p>
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

              {/* Detected Products */}
              {detectedProducts.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Productos Detectados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {detectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-700 rounded-lg p-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-400 mb-1">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-400 font-medium">
                                {product.price}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300 text-xs h-6 px-2"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver más
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Quick Actions
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
                    Summarize Conversation
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("reply")}
                    disabled={isGenerating}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Suggest a Reply
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("improve")}
                    disabled={isGenerating}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Improve Tone
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={() => generateSuggestion("professional")}
                    disabled={isGenerating}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Make Professional
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
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
