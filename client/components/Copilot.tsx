import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MessageSquare,
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

    return "¡Entendido! ¿Te gustaría que analice algo específico de la conversación o necesitas ayuda con otra tarea?";
  };

  const handleSendSuggestionAsIs = () => {
    console.log(
      "Enviando respuesta sugerida tal como está:",
      suggestedResponse.content,
    );
    // Here you would integrate with the main chat to send the message

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
    }

    if (actionMessage) {
      setCurrentMessage(actionMessage);
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium text-white">Asistente IA</h3>
            <Badge className="bg-green-600 text-white text-xs">Activo</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Suggested Response Card */}
      <div className="p-4 border-b border-gray-700 bg-gray-850">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Respuesta Sugerida por IA
            </span>
            <Badge className="bg-blue-600 text-white text-xs">
              {suggestedResponse.confidence}% confianza
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {suggestedResponse.reason}
          </p>
        </div>

        <Card className="bg-blue-950/30 border-blue-500/30">
          <CardContent className="p-3">
            {!isEditingSuggestion ? (
              <p className="text-sm text-white leading-relaxed mb-3">
                {suggestedResponse.content}
              </p>
            ) : (
              <textarea
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm resize-none"
                rows={4}
                placeholder="Modifica la respuesta sugerida..."
              />
            )}

            <div className="flex gap-2">
              {!isEditingSuggestion ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSendSuggestionAsIs}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enviar tal cual
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleModifySuggestion}
                    className="border-blue-500 text-blue-400 hover:bg-blue-950"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modificar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSendModifiedSuggestion}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Enviar modificado
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingSuggestion(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
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

      {/* Quick Action Buttons */}
      <div className="p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("summarize")}
            className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <FileText className="h-3 w-3 mr-1" />
            Resumir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("suggest")}
            className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Sugerir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("rate")}
            className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Star className="h-3 w-3 mr-1" />
            Evaluar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("products")}
            className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Productos
          </Button>
        </div>

        {/* Chat Input */}
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
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
