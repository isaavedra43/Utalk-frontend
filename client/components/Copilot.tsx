import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Bot,
  User,
  FileText,
  Lightbulb,
  Star,
  CheckCircle,
  Edit,
  ArrowUp,
  Package,
  Megaphone,
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

export default function Copilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente de IA. Puedo ayudarte con respuestas sugeridas, resúmenes de conversaciones, análisis de productos y mucho más. ¿En qué puedo ayudarte?",
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
      return "📄 He analizado la conversación actual. El cliente está interesado en mármol carrara para un proyecto de baño. Ha preguntado sobre disponibilidad, precios y tiempo de entrega. Muestra alta intención de compra.";
    }

    if (
      lowerMessage.includes("sugerir") ||
      lowerMessage.includes("respuesta")
    ) {
      return "💡 Te sugiero mencionar nuestras opciones de mármol carrara premium, destacar la calidad italiana auténtica, y ofrecer una cotización personalizada. También podrías enviar el catálogo digital.";
    }

    if (lowerMessage.includes("productos")) {
      return "📦 Basándome en la conversación, el cliente está buscando: Mármol Carrara (alta prioridad), posiblemente Calacatta como alternativa. Recomiendo mostrar especificaciones técnicas y casos de uso en baños.";
    }

    if (lowerMessage.includes("modifica") || lowerMessage.includes("cambiar")) {
      setIsEditingSuggestion(true);
      return "✏️ Perfecto, he habilitado el modo de edición para que puedas modificar la respuesta sugerida. Ajusta el texto como prefieras y luego envíalo.";
    }

    return "¡Entendido! ¿Te gustaría que analice algo específico de la conversación o necesitas ayuda con otra tarea?";
  };

  const handleSendSuggestionAsIs = () => {
    console.log(
      "Enviando respuesta sugerida tal como está:",
      suggestedResponse.content,
    );

    // Add to chat history
    const newMessage: ChatMessage = {
      id: `sent-${Date.now()}`,
      content: `✅ Enviaste la respuesta sugerida: "${suggestedResponse.content}"`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleModifySuggestion = () => {
    setIsEditingSuggestion(true);
    setEditedSuggestion(suggestedResponse.content);

    // Add message to chat
    const modifyMessage: ChatMessage = {
      id: `modify-${Date.now()}`,
      content: "Modifica el mensaje sugerido como prefieras:",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };
    setMessages((prev) => [...prev, modifyMessage]);
  };

  const handleSendModifiedSuggestion = () => {
    console.log("Enviando respuesta modificada:", editedSuggestion);
    setSuggestedResponse((prev) => ({ ...prev, content: editedSuggestion }));
    setIsEditingSuggestion(false);

    // Add to chat history
    const newMessage: ChatMessage = {
      id: `sent-modified-${Date.now()}`,
      content: `✅ Enviaste respuesta modificada: "${editedSuggestion}"`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "response",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickAction = (action: string) => {
    let actionMessage = "";

    switch (action) {
      case "summarize":
        actionMessage = "Por favor, resume la conversación actual.";
        break;
      case "suggest":
        actionMessage =
          "Sugiere una respuesta para el último mensaje del cliente.";
        break;
      case "rate":
        actionMessage = "Evalúa el tono y la calidad de esta conversación.";
        break;
      case "products":
        actionMessage =
          "Analiza qué productos podrían interesar a este cliente.";
        break;
      case "campaign":
        actionMessage = "Ayúdame a crear una campaña para este cliente.";
        break;
      case "predefined":
        actionMessage = "Muéstrame textos predefinidos que pueda usar.";
        break;
    }

    if (actionMessage) {
      setCurrentMessage(actionMessage);
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* AI Suggested Response integrated into chat flow */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-yellow-400">
              Respuesta Sugerida por IA
            </span>
            <Badge className="bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs px-2 py-0.5 rounded-full">
              {suggestedResponse.confidence}% confianza
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-8">
            {suggestedResponse.reason}
          </p>
        </div>

        <div className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-4 backdrop-blur-sm">
          {!isEditingSuggestion ? (
            <div className="relative">
              <p className="text-sm text-gray-100 leading-relaxed mb-3 pr-4">
                {suggestedResponse.content}
              </p>
              {/* Compact inline buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  onClick={handleSendSuggestionAsIs}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 text-xs h-7 px-3 rounded-lg backdrop-blur-sm"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enviar
                </Button>
                <Button
                  size="sm"
                  onClick={handleModifySuggestion}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs h-7 px-3 rounded-lg backdrop-blur-sm"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Modificar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-600/50 rounded-lg p-3 text-white text-sm resize-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                rows={4}
                placeholder="Escribe instrucciones como: 'Resumir más', 'Añadir información técnica', etc."
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  onClick={handleSendModifiedSuggestion}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 text-xs h-7 px-3 rounded-lg"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Aplicar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditingSuggestion(false)}
                  className="bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 text-xs h-7 px-3 rounded-lg"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.sender === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div className="flex-shrink-0">
                {message.sender === "ai" ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
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
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-blue-600 text-white",
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

      {/* Action Buttons - Transparent design with subtle styling */}
      <div className="p-4 border-t border-gray-700/50">
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickAction("summarize")}
                  className="h-8 bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white text-xs justify-start rounded-lg backdrop-blur-sm transition-all duration-200"
                >
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Resumir
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                Resumir conversación actual
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickAction("suggest")}
                  className="h-8 bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white text-xs justify-start rounded-lg backdrop-blur-sm transition-all duration-200"
                >
                  <Lightbulb className="h-3.5 w-3.5 mr-2" />
                  Sugerir
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                Sugerir nueva respuesta
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickAction("rate")}
                  className="h-8 bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white text-xs justify-start rounded-lg backdrop-blur-sm transition-all duration-200"
                >
                  <Star className="h-3.5 w-3.5 mr-2" />
                  Evaluar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                Evaluar tono y calidad
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleQuickAction("products")}
                  className="h-8 bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white text-xs justify-start rounded-lg backdrop-blur-sm transition-all duration-200"
                >
                  <Package className="h-3.5 w-3.5 mr-2" />
                  Productos
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border border-gray-600 text-white text-xs rounded-lg">
                Analizar productos relevantes
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Chat Input - Consistent styling with the design */}
        <div className="flex gap-2">
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
            className="bg-gray-800/60 border border-gray-600/40 text-white placeholder:text-gray-400 text-sm rounded-lg focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 backdrop-blur-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim()}
            className="w-10 h-10 p-0 bg-blue-600/80 hover:bg-blue-600 border border-blue-500/30 text-white rounded-lg disabled:bg-gray-700/50 disabled:border-gray-600/30 disabled:text-gray-400 transition-all duration-200"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
