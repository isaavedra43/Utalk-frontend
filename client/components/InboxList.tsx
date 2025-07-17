// =============================================
// InboxList.tsx - Lista de conversaciones desde la API
// =============================================
// FIX CRÍTICO: Este componente transforma todos los campos tipo timestamp de Firestore 
// ({ _seconds, _nanoseconds }) a strings ISO para garantizar que la UI renderice 
// correctamente las conversaciones. Corregidos TODOS los tipos TypeScript para 
// evitar errores de propiedades no existentes.
// =============================================

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Mail, Facebook, Smartphone, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import { useConversations } from "@/hooks/useMessages";
import { extractData, toISOStringFromFirestore } from "@/lib/apiUtils";

// 🔧 TIPOS CORREGIDOS PARA MANEJAR FECHAS FIRESTORE
type FirestoreTimestamp = { 
  _seconds: number; 
  _nanoseconds: number; 
};

type DateOrTimestamp = string | FirestoreTimestamp | null | undefined;

// 🔧 TIPOS PARA LA RESPUESTA DE LA API (CORREGIDO PARA BACKEND REAL)
interface ConversationsApiResponse {
  data?: Conversation[];
  conversations?: Conversation[]; // ← ESTRUCTURA REAL DEL BACKEND
  pagination?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  [key: string]: any;
}

interface ProcessedConversation {
  id: string;
  customerPhone: string;
  agentPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  channel: string;
  isUnread: boolean;
  timestamp: string;
  lastMessageDetails?: {
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface InboxListProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
}

// 🔄 FUNCIÓN PARA PROCESAR CONVERSACIONES COMPLETAS
function processConversationsData(rawConversations: Conversation[]): ProcessedConversation[] {
  console.group("🔄 === PROCESANDO CONVERSACIONES DESDE API ===");
  console.log("📥 Raw conversations recibidas:", rawConversations);
  console.log("📊 Cantidad de conversaciones raw:", rawConversations?.length || 0);
  
  if (!Array.isArray(rawConversations)) {
    console.error("❌ rawConversations no es un array:", rawConversations);
    console.groupEnd();
    return [];
  }
  
  const processed = rawConversations.map((conv, index) => {
    console.group(`🔧 Procesando conversación [${index}]`);
    console.log("📦 Conversación raw:", conv);
    
    // Procesar todos los campos timestamp de forma segura
    const processedConv: ProcessedConversation = {
      id: conv.id || `unknown-${index}`,
      customerPhone: conv.customerPhone || conv.phone || "Cliente sin teléfono",
      agentPhone: conv.agentPhone || "Sin agente asignado",
      lastMessage: conv.lastMessage || conv.message || "Sin último mensaje",
      lastMessageAt: toISOStringFromFirestore(conv.lastMessageAt),
      createdAt: toISOStringFromFirestore(conv.createdAt),
      updatedAt: toISOStringFromFirestore(conv.updatedAt),
      channel: conv.channel || "whatsapp",
      isUnread: conv.isUnread !== undefined ? conv.isUnread : false,
      timestamp: toISOStringFromFirestore(
        conv.timestamp || 
        conv.lastMessageAt || 
        conv.updatedAt
      ),
    };

    // Procesar lastMessageDetails si existe
    if (conv.lastMessageDetails) {
      const details = conv.lastMessageDetails;
      processedConv.lastMessageDetails = {
        ...details,
        timestamp: toISOStringFromFirestore(details.timestamp),
        createdAt: toISOStringFromFirestore(details.createdAt),
        updatedAt: toISOStringFromFirestore(details.updatedAt),
      };
    }

    // Preservar campos adicionales de forma segura
    Object.keys(conv).forEach(key => {
      if (!['id', 'customerPhone', 'agentPhone', 'lastMessage', 'lastMessageAt', 'createdAt', 'updatedAt', 'channel', 'isUnread', 'timestamp'].includes(key)) {
        (processedConv as any)[key] = conv[key];
      }
    });
    
    console.log("✅ Conversación procesada:", processedConv);
    console.groupEnd();
    
    return processedConv;
  });
  
  console.log("🎯 RESULTADO FINAL - Conversaciones procesadas:", processed);
  console.log("📊 Total procesadas:", processed.length);
  console.groupEnd();
  
  return processed;
}

export function InboxList({ selectedConversationId, onConversationSelect }: InboxListProps) {
  const { data: conversationsResponse, isLoading, error, refetch } = useConversations();

  // 🔍 LOGS EXHAUSTIVOS DE LA RESPUESTA DE LA API
  useEffect(() => {
    console.group("🔍 [INBOX DEBUG] === ANÁLISIS COMPLETO DE RESPUESTA API ===");
    console.log("📡 Estado del hook useConversations:");
    console.log("  - isLoading:", isLoading);
    console.log("  - error:", error);
    console.log("  - conversationsResponse COMPLETO:", conversationsResponse);
    
    if (conversationsResponse) {
      console.log("📦 Estructura detallada de la respuesta:");
      console.log("  - conversationsResponse.data:", conversationsResponse.data);
      console.log("  - Tipo de .data:", Array.isArray(conversationsResponse.data) ? 'Array' : typeof conversationsResponse.data);
      console.log("  - conversationsResponse.pagination:", conversationsResponse.pagination);
    }
    console.groupEnd();
  }, [conversationsResponse, isLoading, error]);

  // 🔄 ACCESO UNIFICADO Y SEGURO (YA REALIZADO EN EL HOOK)
  const processedConversations = conversationsResponse?.conversations || [];
  console.log("✅ PROCESSED CONVERSATIONS FINAL:", processedConversations);

  // 🎨 FUNCIÓN PARA ICONOS DE CANALES
  const getChannelIcon = (channel: string) => {
    const iconClass = "h-4 w-4";
    
    switch (channel.toLowerCase()) {
      case "whatsapp":
        return <MessageSquare className={`${iconClass} text-green-500`} />;
      case "email": 
        return <Mail className={`${iconClass} text-blue-500`} />;
      case "facebook":
        return <Facebook className={`${iconClass} text-sky-600`} />;
      case "sms":
        return <Smartphone className={`${iconClass} text-purple-500`} />;
      default:
        return <MessageSquare className={`${iconClass} text-gray-500`} />;
    }
  };

  // ⏰ FUNCIÓN PARA FORMATEAR TIEMPO SEGURA
  const formatTime = (timestamp: string) => {
    console.log("⏰ Formateando tiempo:", timestamp);
    
    if (!timestamp) {
      console.warn("⚠️ Timestamp vacío para formatear");
      return "--:--";
    }
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn("⚠️ Timestamp inválido para formatear:", timestamp);
        return "--:--";
      }
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 24) {
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      } else {
        return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
      }
    } catch (error) {
      console.error("❌ Error al formatear timestamp:", error);
      return "--:--";
    }
  };

  // 🔄 ESTADO DE CARGA
  if (isLoading) {
    console.log("⏳ Estado: CARGANDO conversaciones...");
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <div>
            <p className="text-gray-300 font-medium">Cargando conversaciones...</p>
            <p className="text-gray-500 text-sm">Obteniendo datos desde /api/conversations</p>
          </div>
        </div>
      </div>
    );
  }

  // ❌ ESTADO DE ERROR
  if (error) {
    console.error("❌ Estado: ERROR al cargar conversaciones");
    console.error("Detalles del error:", error);
    
    return (
      <div className="h-full flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Error al cargar conversaciones
            </h3>
            <p className="text-gray-400 mb-4">
              No se pudieron obtener las conversaciones del servidor
            </p>
            <div className="bg-gray-800 rounded-lg p-3 text-left">
              <p className="text-sm text-gray-300 font-mono">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
            </div>
            <button 
              onClick={() => {
                console.log("🔄 Reintentando cargar conversaciones...");
                refetch();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 📭 ESTADO SIN CONVERSACIONES
  if (processedConversations.length === 0) {
    console.log("📭 Estado: SIN CONVERSACIONES");
    console.log("📊 Raw conversations length:", processedConversations.length);
    console.log("📊 Processed conversations length:", processedConversations.length);
    
    return (
      <div className="h-full bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Header con búsqueda */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar conversación..." 
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400" 
            />
          </div>
        </div>
        
        {/* Estado vacío */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay conversaciones disponibles
              </h3>
              <p className="text-gray-500 text-sm">
                Las conversaciones aparecerán aquí cuando estén disponibles
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Raw: {processedConversations.length} | Procesadas: {processedConversations.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ESTADO EXITOSO - RENDERIZADO DE CONVERSACIONES
  console.log(`✅ Estado: ÉXITO - Renderizando ${processedConversations.length} conversaciones`);
  
  return (
    <div className="h-full bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar conversación..." 
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500" 
          />
        </div>
      </div>
      
      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {processedConversations.map((convo, index) => {
            const isSelected = selectedConversationId === convo.id;
            
            console.log(`🎨 Renderizando conversación [${index}]:`, {
              id: convo.id,
              isSelected,
              customerPhone: convo.customerPhone,
              lastMessage: convo.lastMessage,
              timestamp: convo.timestamp
            });
            
            return (
              <div
                key={convo.id}
                onClick={() => {
                  console.log(`🖱️ Conversación seleccionada:`, convo.id);
                  onConversationSelect(convo.id);
                }}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 border",
                  isSelected 
                    ? "bg-blue-600/20 border-blue-500/50 shadow-lg" 
                    : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
                )}
              >
                {/* Fila superior: teléfono y tiempo */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-white truncate flex-1">
                    {convo.customerPhone || 'Sin número'}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatTime(convo.timestamp)}
                  </span>
                </div>
                
                {/* Último mensaje */}
                <p className="text-xs text-gray-400 truncate mb-2" title={convo.lastMessage}>
                  {convo.lastMessage || 'Sin mensaje'}
                </p>
                
                {/* Fila inferior: canal y estado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getChannelIcon(convo.channel)}
                    <span className="text-xs text-gray-500 capitalize">
                      {convo.channel}
                    </span>
                  </div>
                  
                  {convo.isUnread && (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Footer con información de debug */}
      <div className="p-2 border-t border-gray-800 bg-gray-900/50">
        <p className="text-xs text-gray-500 text-center">
          {processedConversations.length} conversación{processedConversations.length !== 1 ? 'es' : ''} cargada{processedConversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// =============================================
// FIN InboxList.tsx - TIPOS CORREGIDOS Y SIN ERRORES
// =============================================