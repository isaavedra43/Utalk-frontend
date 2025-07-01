import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Bot,
  User,
  CheckCircle,
  Edit,
  ArrowUp,
  Clock,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  type?: "suggestion" | "response" | "summary";
}

interface SuggestedResponse {
  id: string;
  content: string;
  reason: string;
  confidence: number;
}

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente de IA. Puedo ayudarte con respuestas sugeridas, resúmenes de conversaciones, análisis de productos y mucho más.",
      sender: "ai",
      timestamp: "10:30 AM",
      type: "response",
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [suggestedResponse, setSuggestedResponse] = useState<SuggestedResponse>(
    {
      id: "suggestion-1",
      content:
        "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más.",
      reason: "Cliente preguntó sobre mármoles disponibles",
      confidence: 95,
    },
  );

  const [isEditingSuggestion, setIsEditingSuggestion] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState(
    suggestedResponse.content,
  );

  // Recent AI history (max 3 items)
  const [aiHistory] = useState<ChatMessage[]>([
    {
      id: "hist-1",
      content:
        "Resumen: Cliente interesado en mármol carrara para proyecto de baño. Alta intención de compra.",
      sender: "ai",
      timestamp: "hace 5 min",
      type: "summary",
    },
    {
      id: "hist-2",
      content:
        "Sugerencia anterior: Ofrecer cotización personalizada y catálogo digital de mármoles premium.",
      sender: "ai",
      timestamp: "hace 10 min",
      type: "suggestion",
    },
    {
      id: "hist-3",
      content:
        "Análisis: Cliente VIP con presupuesto alto. Recomendar productos de alta gama.",
      sender: "ai",
      timestamp: "hace 15 min",
      type: "response",
    },
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: currentMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: generateAIResponse(currentMessage),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "response",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("resumen") || lowerMessage.includes("resumir")) {
      return "📄 Cliente VIP interesado en mármol carrara premium. Consultó precios por volumen, tiempos de entrega y servicios de instalación. Alta probabilidad de compra (85%). Recomienda envío de cotización detallada.";
    }

    if (lowerMessage.includes("mejorar") || lowerMessage.includes("corregir")) {
      return "✏️ He mejorado el mensaje sugerido para ser más persuasivo y profesional. Agregué información sobre calidad italiana y beneficios del producto.";
    }

    if (lowerMessage.includes("productos")) {
      return "📦 Productos recomendados: Mármol Carrara Premium ($65.99/m²), Calacatta Gold ($89.99/m²). Cliente ha visto carrara 8 veces. Stock disponible: 150 unidades carrara, 45 calacatta.";
    }

    if (lowerMessage.includes("cliente")) {
      return "👤 Carlos Martinez - GRUPO ALCON. Cliente desde enero 2023. 12 interacciones totales. Arquitecto con múltiples proyectos. Presupuesto alto. Preferencia por productos premium.";
    }

    return "¡Entendido! ¿Te gustaría que analice algo específico de la conversación, mejore algún mensaje o te proporcione información adicional?";
  };

  const handleSendSuggestionAsIs = () => {
    console.log("Enviando respuesta sugerida:", suggestedResponse.content);

    const sentMessage: ChatMessage = {
      id: `sent-${Date.now()}`,
      content: `✅ Respuesta enviada al cliente: "${suggestedResponse.content}"`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };
    setMessages((prev) => [...prev, sentMessage]);
  };

  const handleModifySuggestion = () => {
    setIsEditingSuggestion(true);
    setEditedSuggestion(suggestedResponse.content);
  };

  const handleSendModifiedSuggestion = () => {
    console.log("Enviando respuesta modificada:", editedSuggestion);
    setSuggestedResponse((prev) => ({ ...prev, content: editedSuggestion }));
    setIsEditingSuggestion(false);

    const sentMessage: ChatMessage = {
      id: `sent-modified-${Date.now()}`,
      content: `✅ Respuesta modificada enviada: "${editedSuggestion}"`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };
    setMessages((prev) => [...prev, sentMessage]);
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* 1. Respuesta Sugerida IA - Compact like other cards */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-white flex items-center gap-2">
                <Lightbulb className="h-3 w-3 text-yellow-400" />
                Respuesta Sugerida IA
                <Badge className="bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                  {suggestedResponse.confidence}% confianza
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <p className="text-xs text-gray-400 mb-2">
                {suggestedResponse.reason}
              </p>

              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
                {!isEditingSuggestion ? (
                  <div className="space-y-2">
                    <p className="text-xs text-white leading-relaxed">
                      {suggestedResponse.content}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={handleSendSuggestionAsIs}
                        className="h-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 text-xs rounded px-2"
                      >
                        <CheckCircle className="h-2 w-2 mr-1" />✅ Enviar tal
                        cual
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleModifySuggestion}
                        className="h-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs rounded px-2"
                      >
                        <Edit className="h-2 w-2 mr-1" />
                        ✏️ Modificar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={editedSuggestion}
                      onChange={(e) => setEditedSuggestion(e.target.value)}
                      className="w-full bg-gray-800/80 border border-gray-600/50 rounded p-2 text-white text-xs resize-none"
                      rows={3}
                      placeholder="Modifica la respuesta sugerida..."
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={handleSendModifiedSuggestion}
                        className="h-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 text-xs rounded px-2"
                      >
                        <Send className="h-2 w-2 mr-1" />
                        Enviar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsEditingSuggestion(false)}
                        className="h-6 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 text-xs rounded px-2"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Chat con IA - Interactive area */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-white flex items-center gap-2">
                <Bot className="h-3 w-3 text-blue-400" />
                Chat con IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {/* Chat messages - compact */}
              <ScrollArea className="h-32 mb-3" ref={scrollAreaRef}>
                <div className="space-y-2">
                  {messages.slice(-3).map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-1",
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row",
                      )}
                    >
                      <div className="flex-shrink-0">
                        {message.sender === "ai" ? (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bot className="h-2 w-2 text-white" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex-1 max-w-[85%]",
                          message.sender === "user"
                            ? "text-right"
                            : "text-left",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded p-2 text-xs",
                            message.sender === "ai"
                              ? "bg-gray-700/40 text-white border border-gray-600/30"
                              : "bg-blue-600/80 text-white",
                          )}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat input - compact */}
              <div className="flex gap-1">
                <Input
                  placeholder="Pregunta al asistente IA..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="h-7 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="h-7 w-7 p-0 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white rounded disabled:bg-gray-700/50"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3. Historial breve IA - Last 3 responses */}
          <Card className="bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-white flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-400" />
                Historial Reciente
                <Badge className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                  {aiHistory.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {aiHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-700/40 border border-gray-600/30 rounded p-2"
                  >
                    <p className="text-xs text-gray-300 leading-relaxed mb-1">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={cn(
                          "text-xs rounded-full",
                          item.type === "summary"
                            ? "bg-cyan-600/20 border border-cyan-500/30 text-cyan-300"
                            : item.type === "suggestion"
                              ? "bg-yellow-600/20 border border-yellow-500/30 text-yellow-300"
                              : "bg-gray-600/20 border border-gray-500/30 text-gray-300",
                        )}
                      >
                        {item.type === "summary"
                          ? "Resumen"
                          : item.type === "suggestion"
                            ? "Sugerencia"
                            : "Respuesta"}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
