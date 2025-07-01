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
        "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más. También tenemos disponibles granitos, cuarzos y otras piedras naturales de alta calidad importadas directamente de Italia.",
      reason: "Cliente preguntó sobre mármoles disponibles",
      confidence: 95,
    },
  );

  const [isEditingSuggestion, setIsEditingSuggestion] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState(
    suggestedResponse.content,
  );
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);

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

  const truncateText = (text: string, maxLines: number = 2) => {
    const words = text.split(" ");
    const maxWords = maxLines * 10; // Aproximadamente 10 palabras por línea
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Fixed Suggested Response at top */}
      <div className="bg-gray-900 border-b border-gray-700/50 p-3 flex-shrink-0">
        <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">
                Respuesta sugerida ({suggestedResponse.confidence}% confianza)
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsResponseExpanded(!isResponseExpanded)}
              className="h-5 w-5 p-0 text-yellow-400 hover:text-yellow-300"
            >
              {isResponseExpanded ? "−" : "+"}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            {suggestedResponse.reason}
          </p>
          <p className="text-xs text-white leading-relaxed">
            {isResponseExpanded
              ? suggestedResponse.content
              : truncateText(suggestedResponse.content, 2)}
          </p>
        </div>
      </div>

      {/* Chat Area - Extended to full height */}
      <div className="flex-1 flex flex-col bg-gray-800/60 border-l border-gray-800">
        {/* Chat Header */}
        <div className="p-3 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white font-medium">Chat con IA</span>
            <Badge className="bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
              Asistente activo
            </Badge>
          </div>
        </div>

        {/* Chat Messages - Scrollable full height */}
        <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.sender === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div className="flex-shrink-0">
                  {message.sender === "ai" ? (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 max-w-[80%]",
                    message.sender === "user" ? "text-right" : "text-left",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 text-sm",
                      message.sender === "ai"
                        ? "bg-gray-700/40 text-white border border-gray-600/30"
                        : "bg-blue-600/80 text-white",
                    )}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input - Fixed at bottom */}
        <div className="p-3 border-t border-gray-700/50 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Pregunta al asistente IA o solicita modificar el mensaje sugerido..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="h-8 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-sm"
            />
            <Button
              size="sm"
              onClick={handleSendSuggestionAsIs}
              className="h-8 px-3 bg-green-600/80 hover:bg-green-600 border border-green-500/30 text-white rounded text-xs flex items-center gap-1"
              title="Enviar respuesta sugerida"
            >
              <CheckCircle className="h-3 w-3" />
              Enviar
            </Button>
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              className="h-8 w-8 p-0 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white rounded disabled:bg-gray-700/50"
              title="Enviar mensaje al AI"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
