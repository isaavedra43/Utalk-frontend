import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Mail, Facebook, Smartphone, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import { useConversations } from "@/hooks/useMessages";

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
}

export function InboxList({ selectedConversationId, onConversationSelect }: InboxListProps) {
  const { data: conversationsResponse, isLoading, error } = useConversations();

  useEffect(() => {
    console.group("🔍INBOX DEBUG] Datos de conversaciones recibidos:");
    console.log("conversationsResponse:", conversationsResponse);
    console.log("isLoading:", isLoading);
    console.log("error:", error);
    console.log("conversationsResponse?.data:", conversationsResponse?.data);
    console.log("conversationsResponse?.data?.length:", conversationsResponse?.data?.length);
    console.groupEnd();
  }, [conversationsResponse, isLoading, error]);

  const conversations = (conversationsResponse?.data || []) as any[];
  const processedConversations = conversations.map((conv) => ({
    id: conv.id || "unknown",
    customerPhone: conv.customerPhone || "Sin teléfono",
    agentPhone: conv.agentPhone || "Sin agente asignado",
    lastMessage: conv.lastMessage || "Sin último mensaje",
    lastMessageAt: conv.lastMessageAt || conv.timestamp || "",
    channel: conv.channel || "whatsapp",
    isUnread: conv.isUnread || false,
    timestamp: conv.timestamp || conv.lastMessageAt || "",
  }));

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-50" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-50" />;
      case "facebook":
        return <Facebook className="h-4 w-4 text-sky-60" />;
      case "sms":
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "--:--";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "--:--";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ Error al cargar conversaciones:", error);
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-red-400">Error al cargar conversaciones</h3>
          <p className="text-gray-400">No se pudieron cargar las conversaciones</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : "Error desconocido"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-950 border-r border-gray-800 flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar conversación..." className="pl-10 bg-gray-800 border-gray-700" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {processedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12" />
              <p className="text-sm text-center">No hay conversaciones disponibles</p>
            </div>
          ) : (
            processedConversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => onConversationSelect(convo.id)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors",
                  selectedConversationId === convo.id ? "bg-blue-60" : "hover:bg-gray-800/60"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-white truncate">{convo.customerPhone}</h3>
                  <p className="text-xs text-gray-400">{formatTime(convo.timestamp)}</p>
                </div>
                <p className="text-xs text-gray-400 truncate">{convo.lastMessage}</p>
                <div className="flex items-center justify-between mt-2">
                  {getChannelIcon(convo.channel)}
                  {convo.isUnread && (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 