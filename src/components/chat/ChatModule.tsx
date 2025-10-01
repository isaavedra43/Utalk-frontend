import React, { useState, useEffect, useCallback } from 'react';
import { ConversationList } from './ConversationList';
import { ChatComponent } from './ChatComponent';
import { RightSidebar } from '../layout/RightSidebar';
import { SuggestionsPanel } from '../layout/SuggestionsPanel';
import { useConversations } from '../../hooks/chat/useConversations';
import { useCreateConversation } from '../../hooks/chat/useCreateConversation';
import { useChatStore } from '../../stores/useChatStore';
import { infoLog } from '../../config/logger';
import { 
  ChevronLeft, 
  Settings, 
  Menu, 
  X, 
  Users, 
  Bell, 
  LayoutDashboard, 
  Building2,
  Sparkles,
  MessageSquare,
  MessageCircle,
  Megaphone,
  Phone,
  BookOpen,
  UserCheck,
  Eye,
  Bot,
  Truck,
  Package
} from 'lucide-react';
import { MobileMenuButton } from '../layout/MobileMenuButton';
import '../../styles/four-column-layout.css';

// Tipos para las vistas móviles
type MobileView = 'conversations' | 'chat' | 'details' | 'suggestions';

// Componente interno para el contenido autenticado
const AuthenticatedChatContent: React.FC = () => {
  const [mobileView, setMobileView] = useState<MobileView>('conversations');
  // El menú móvil ahora es global, no local
  
  // UNA sola instancia del hook useConversations
  const conversationsData = useConversations({});

  // Hook para crear conversaciones
  const { createConversation } = useCreateConversation();

  // Limpiar URL de conversaciones persistentes al montar el componente
  useEffect(() => {
    conversationsData.clearConversationFromUrl();
    
    // CRÍTICO: Si hay conversaciones en el store pero el backend devuelve lista vacía,
    // forzar limpieza del store para evitar conversaciones fantasma
    if (conversationsData.conversations.length === 0 && !conversationsData.isLoading) {
      // Usar setTimeout para permitir que React Query termine de cargar
      const timeoutId = setTimeout(() => {
        if (conversationsData.conversations.length === 0) {
          const { clearAllConversations } = useChatStore.getState();
          clearAllConversations();
          infoLog('🧹 ChatModule - Limpieza forzada de conversaciones fantasma');
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [conversationsData.clearConversationFromUrl, conversationsData.conversations.length, conversationsData.isLoading]);

  // Función para manejar creación de conversación
  const handleCreateConversation = useCallback(async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
    attachment?: File;
  }) => {
    try {
      await createConversation(data);
      // El hook ya maneja la lógica completa
    } catch (error) {
      console.error('Error en ChatModule al crear conversación:', error);
    }
  }, [createConversation]);

  // Navegación automática a chat tras seleccionar conversación en móvil
  const prevActiveIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    const currentId = conversationsData.activeConversation?.id || null;

    // Solo autoabrir chat cuando estamos mirando la lista y cambia la conversación seleccionada
    if (
      isMobile &&
      mobileView === 'conversations' &&
      currentId &&
      prevActiveIdRef.current !== currentId
    ) {
      setMobileView('chat');
    }

    prevActiveIdRef.current = currentId;
  }, [conversationsData.activeConversation?.id, mobileView]);

  // Renderizar vista móvil
  const renderMobileView = () => {
    switch (mobileView) {
      case 'conversations':
        return (
          <div className="h-full bg-white flex flex-col">
            {/* Header de conversaciones */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-semibold">Conversaciones</h1>
              </div>
              <MobileMenuButton className="bg-white/20 hover:bg-white/30" />
            </div>
            
            {/* Contenido de conversaciones */}
            <div className="flex-1 overflow-hidden">
              <ConversationList 
                {...conversationsData} 
                selectConversation={(id: string) => {
                  conversationsData.selectConversation(id);
                  // setMobileView('chat');  // ya no forzamos aquí, lo maneja el useEffect en móvil
                }}
                onCreateConversation={handleCreateConversation}
              />
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="h-full bg-white flex flex-col">
            {/* Header del chat */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileView('conversations')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {conversationsData.activeConversation?.contact?.name?.charAt(0)?.toUpperCase() || 
                       conversationsData.activeConversation?.contact?.name?.charAt(0)?.toUpperCase() || 
                       conversationsData.activeConversation?.customerName?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {conversationsData.activeConversation?.contact?.name || 
                       conversationsData.activeConversation?.contact?.name || 
                       conversationsData.activeConversation?.customerName || 'Cliente'}
                    </h2>
                    <p className="text-sm text-white/80">En línea</p>
                  </div>
                </div>
              </div>

              {/* Acciones: Sugerencias e Info/IA (estilo WhatsApp con acciones arriba) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMobileView('suggestions')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Sugerencias IA"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setMobileView('details')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Info / Copiloto"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Contenido del chat */}
            <div className="flex-1 overflow-hidden">
              <ChatComponent 
                key={conversationsData.activeConversation?.id || 'no-conversation'}
                conversationId={conversationsData.activeConversation?.id} 
              />
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="h-full bg-white flex flex-col">
            {/* Header de detalles */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileView('chat')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold">Info / Copiloto</h1>
              </div>
            </div>
            
            {/* Contenido de detalles: usar RightSidebar real */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <RightSidebar />
            </div>
          </div>
        );

      case 'suggestions':
        return (
          <div className="h-full bg-white flex flex-col">
            {/* Header de sugerencias */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileView('chat')}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold">Sugerencias IA</h1>
              </div>
            </div>
            
            {/* Contenido de sugerencias */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <SuggestionsPanel />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // El menú móvil ahora es global, no local

  return (
    <div className="h-full flex flex-col">
      {/* Vista móvil estilo WhatsApp */}
      <div className="lg:hidden h-full">
        {renderMobileView()}
      </div>

      {/* Vista desktop - Layout de 4 columnas */}
      <div className="four-column-layout">
        {/* Columna 1: Lista de conversaciones */}
        <div className="conversations-column column-separator">
          {conversationsData.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando conversaciones...</p>
              </div>
            </div>
          ) : conversationsData.error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-red-600">
                <p>Error al cargar conversaciones</p>
                <p className="text-sm">{conversationsData.error.message}</p>
              </div>
            </div>
          ) : (
            <ConversationList 
              {...conversationsData} 
              onCreateConversation={handleCreateConversation}
            />
          )}
        </div>
        
        {/* Columna 2: Chat (con más ancho) */}
        <div className="chat-column column-separator">
          {conversationsData.isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando chat...</p>
              </div>
            </div>
          ) : (
            <ChatComponent 
              key={conversationsData.activeConversation?.id || 'no-conversation'}
              conversationId={conversationsData.activeConversation?.id} 
            />
          )}
        </div>
        
        {/* Columna 3: Sugerencias (independiente) */}
        <div className="suggestions-column column-separator">
          <SuggestionsPanel />
        </div>
        
        {/* Columna 4: Detalles + Copiloto */}
        <div className="details-copilot-column">
          <RightSidebar />
        </div>
      </div>

      {/* Eliminado: barra inferior de navegación para replicar flujo WhatsApp */}
    </div>
  );
};

export const ChatModule: React.FC = () => {
  return <AuthenticatedChatContent />;
}; 