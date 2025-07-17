import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { logger } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { MessagesSidebar } from "@/components/MessagesSidebar";
import { InboxSidebar } from "@/components/InboxSidebar";
import { ChatListColumn } from "@/components/ChatListColumn";
import { ChatView } from "@/components/ChatView";
import { InboxList } from "@/components/InboxList";
import { ChatThread } from "@/components/ChatThread";
import CustomerHub from "@/components/CustomerHub";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { EquipoPerformance } from "@/components/EquipoPerformance";
import { CampaignModule } from "@/components/CampaignModule";
import { SellerSettings } from "@/components/SellerSettings";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { RealTimeCollaboration } from "@/components/RealTimeCollaboration";
import Copilot from "@/components/Copilot";
import { ClientInfoPanel } from "@/components/ClientInfoPanel";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose,
  LayoutDashboard,
  Users,
  Bot,
  UserCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/components/ConnectionStatus";

export default function Index() {
  const isMobile = useIsMobile();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>("1");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [activeModule, setActiveModule] = useState("messages");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [inboxVisible, setInboxVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [aiPanelVisible, setAiPanelVisible] = useState(true);
  const [clientInfoVisible, setClientInfoVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>("all");

  // Log de inicialización del componente principal
  useEffect(() => {
    logger.navigation('Página principal inicializada', {
      isMobile,
      activeModule,
      selectedChatId,
      selectedConversationId,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Log de cambios en el dispositivo móvil
  useEffect(() => {
    logger.navigation('Dispositivo móvil detectado', { isMobile });
  }, [isMobile]);

  // Log de cambios en el módulo activo
  useEffect(() => {
    logger.router('Módulo activo cambiado', {
      previousModule: activeModule,
      newModule: activeModule,
      isMobile,
      timestamp: new Date().toISOString()
    });
  }, [activeModule]);

  const handleChatSelect = (chatId: string) => {
    logger.messages('Chat seleccionado', {
      chatId,
      previousChatId: selectedChatId,
      isMobile
    });
    
    setSelectedChatId(chatId);
    
    // Close mobile menu when chat is selected
    if (isMobile) {
      setIsMobileMenuOpen(false);
      logger.navigation('Menú móvil cerrado automáticamente tras selección de chat');
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    logger.messages('Conversación seleccionada', {
      conversationId,
      previousConversationId: selectedConversationId
    });
    
    setSelectedConversationId(conversationId);
  };

  const handleModuleChange = (module: string) => {
    logger.router('Navegando a módulo', {
      fromModule: activeModule,
      toModule: module,
      isMobile,
      timestamp: new Date().toISOString()
    });
    
    setActiveModule(module);
    
    // Log específico del módulo al que se navega
    switch (module) {
      case 'messages':
        logger.messages('Accediendo al módulo de mensajería');
        break;
      case 'dashboard':
        logger.navigation('Accediendo al dashboard ejecutivo');
        break;
      case 'crm':
        logger.navigation('Accediendo al hub de clientes');
        break;
      case 'team':
        logger.navigation('Accediendo a rendimiento del equipo');
        break;
      case 'campaigns':
        logger.navigation('Accediendo al módulo de campañas');
        break;
      case 'knowledge':
        logger.navigation('Accediendo a la base de conocimiento');
        break;
      case 'collaboration':
        logger.navigation('Accediendo a colaboración en tiempo real');
        break;
      case 'settings':
        logger.navigation('Accediendo a configuración');
        break;
      default:
        logger.navigation('Navegando a módulo desconocido', { module }, true);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    logger.navigation('Sección seleccionada', {
      sectionId,
      previousSection: selectedSection,
      activeModule
    });
    
    setSelectedSection(sectionId);
  };

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    logger.navigation('Toggle menú móvil', {
      isOpen: newState,
      activeModule
    });
    
    setIsMobileMenuOpen(newState);
  };

  const handlePanelToggle = (panelType: string, newState: boolean) => {
    logger.navigation('Toggle panel', {
      panelType,
      newState,
      activeModule
    });
  };

  // Log de cambios en el estado de los paneles
  useEffect(() => {
    logger.navigation('Estado de paneles actualizado', {
      leftPanelVisible,
      rightPanelVisible,
      aiPanelVisible,
      clientInfoVisible,
      inboxVisible
    });
  }, [leftPanelVisible, rightPanelVisible, aiPanelVisible, clientInfoVisible, inboxVisible]);

  return (
    <div className="h-screen bg-[#121214] text-white overflow-hidden">
      {/* Mobile header - Responsive design */}
      <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-semibold truncate">UNIK AI</h1>
          {activeModule === "messages" && selectedChatId && (
            <Badge className="bg-blue-600 text-white text-xs sm:text-sm flex-shrink-0">
              {isMobile ? "Chat" : "Chat activo"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Module indicator for small screens */}
          <div className="hidden sm:block">
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              {activeModule === "messages" ? "Mensajes" : 
               activeModule === "dashboard" ? "Dashboard" :
               activeModule === "crm" ? "CRM" :
               activeModule === "team" ? "Equipo" :
               activeModule === "campaigns" ? "Campañas" :
               activeModule}
            </Badge>
          </div>
          
          {/* 🔌 ESTADO DE CONEXIÓN Socket.io */}
          <ConnectionStatus className="hidden lg:flex" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileMenuToggle}
            className="text-gray-400 hover:text-white p-2 h-9 w-9"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div
        className={cn(
          "h-full flex",
          "lg:h-full",
          isMobileMenuOpen ? "overflow-hidden" : "",
        )}
      >
        {/* Sidebar Navigation - Desktop only */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            onTogglePanel={() => {
              const newState = !leftPanelVisible;
              setLeftPanelVisible(newState);
              handlePanelToggle('left', newState);
            }}
            className="h-full"
          />
        </div>

        {/* Mobile Navigation Panel - Responsive */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-40 bg-gray-900 transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ top: "64px" }}
        >
          <div className="h-full flex">
            {/* Mobile Sidebar - Responsive width */}
            <div className="w-20 sm:w-24 flex-shrink-0 border-r border-gray-800">
              <Sidebar
                activeModule={activeModule}
                onModuleChange={(module) => {
                  handleModuleChange(module);
                }}
                className="h-full"
              />
            </div>

            {/* Mobile Chat List - 2/3 width, only show in messages module */}
            {activeModule === "messages" && (
              <div className="flex-1">
                <ChatListColumn
                  selectedChatId={selectedChatId}
                  onChatSelect={(chatId) => {
                    handleChatSelect(chatId);
                    setIsMobileMenuOpen(false);
                  }}
                  selectedSection={selectedSection}
                  className="h-full"
                />
              </div>
            )}

            {/* Show module content for non-messages modules */}
            {activeModule !== "messages" && (
              <div className="flex-1 overflow-auto">
                {activeModule === "dashboard" && (
                  <ExecutiveDashboard className="h-full" />
                )}
                {activeModule === "crm" && <CustomerHub className="h-full" />}
                {activeModule === "team" && (
                  <EquipoPerformance className="h-full" />
                )}
                {activeModule === "campaigns" && (
                  <CampaignModule className="h-full" />
                )}
                {activeModule === "knowledge" && (
                  <KnowledgeBase className="h-full" />
                )}
                {activeModule === "collaboration" && (
                  <RealTimeCollaboration className="h-full" />
                )}
                {activeModule === "settings" && (
                  <SellerSettings className="h-full" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            style={{ top: "64px" }}
            onClick={() => {
              logger.navigation('Overlay clickeado - cerrando menú móvil');
              setIsMobileMenuOpen(false);
            }}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeModule === "messages" ? (
            /* Messaging Module with 4-Column Grid Layout */
            <div className="h-full overflow-hidden">
              {/* Mobile Layout */}
              <div className="lg:hidden h-full flex flex-col">
                {/* Show Inbox + Chats or Chat + AI based on selection */}
                {selectedChatId ? (
                  <div className="h-full flex flex-col">
                    {/* Mobile Chat View */}
                    <div className="flex-1">
                      <ChatView
                        chatId={selectedChatId}
                        isMobile={isMobile}
                        onShowAI={() => {
                          logger.navigation('Mostrando panel de IA desde chat móvil');
                          setRightPanelVisible(true);
                        }}
                        onShowClientInfo={() => {
                          logger.navigation('Mostrando información de cliente desde chat móvil');
                          setRightPanelVisible(true);
                          setClientInfoVisible(true);
                          setAiPanelVisible(false);
                        }}
                        onToggleRightPanel={() => {
                          const newState = !rightPanelVisible;
                          logger.navigation('Toggle panel derecho desde chat móvil', { newState });
                          setRightPanelVisible(newState);
                        }}
                      />
                    </div>

                    {/* Mobile AI/Client Panel Overlay */}
                    {rightPanelVisible && (
                      <div
                        className="fixed inset-0 z-50 bg-black/50"
                        style={{ top: "64px" }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900">
                          <div className="flex bg-gray-900 border-l border-gray-800">
                            <Button
                              size="sm"
                              variant={aiPanelVisible ? "default" : "ghost"}
                              onClick={() => {
                                logger.navigation('Cambiando a panel de IA en móvil');
                                setAiPanelVisible(true);
                                setClientInfoVisible(false);
                              }}
                              className={cn(
                                "flex-1 rounded-none h-12 text-xs font-medium",
                                aiPanelVisible
                                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800",
                              )}
                            >
                              <Bot className="w-4 h-4 mr-2" />
                              IA
                            </Button>
                            <Button
                              size="sm"
                              variant={clientInfoVisible ? "default" : "ghost"}
                              onClick={() => {
                                logger.navigation('Cambiando a panel de cliente en móvil');
                                setClientInfoVisible(true);
                                setAiPanelVisible(false);
                              }}
                              className={cn(
                                "flex-1 rounded-none h-12 text-xs font-medium",
                                clientInfoVisible
                                  ? "bg-green-600 text-white border-b-2 border-green-400"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800",
                              )}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Cliente
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                logger.navigation('Cerrando panel lateral en móvil');
                                setRightPanelVisible(false);
                              }}
                              className="w-12 h-12 text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            {aiPanelVisible && <AIAssistantPanel />}
                            {clientInfoVisible && <ClientInfoPanel />}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mobile Inbox + Chat List */
                  <div className="h-full flex">
                    <div className="w-1/3">
                      <InboxSidebar
                        onSectionSelect={handleSectionSelect}
                        selectedSection={selectedSection}
                        onTogglePanels={() => {
                          const newState = !leftPanelVisible;
                          setLeftPanelVisible(newState);
                          handlePanelToggle('left', newState);
                        }}
                        className="h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <ChatListColumn
                        selectedChatId={selectedChatId}
                        onChatSelect={handleChatSelect}
                        selectedSection={selectedSection}
                        className="h-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Layout - 3 Column Structure */}
              <div
                className="hidden lg:grid h-full"
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr 320px",
                  gridGap: "0px",
                  height: "100vh",
                  fontFamily: "Inter, sans-serif",
                  padding: "0",
                  minWidth: "960px",
                }}
              >

                {/* Column 1: Inbox List */}
                <div className="min-w-0">
                  <InboxList
                    selectedConversationId={selectedConversationId}
                    onConversationSelect={handleConversationSelect}
                  />
                </div>

                {/* Column 2: Chat Thread */}
                <div className="min-w-0">
                  <ChatThread conversationId={selectedConversationId} />
                </div>

                {/* Column 3: AI Assistant / Client Info Panel (unchanged) */}
                <div className="flex-shrink-0" style={{ width: "320px" }}>
                  <div className="h-full flex flex-col">
                    {/* Tabs */}
                    <div className="flex" style={{ marginBottom: "0" }}>
                      <button
                        onClick={() => {
                          logger.navigation('Cambiando a panel de IA en desktop');
                          setAiPanelVisible(true);
                          setClientInfoVisible(false);
                        }}
                        className={cn(
                          "flex-1 h-12 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors",
                          aiPanelVisible
                            ? "text-white"
                            : "text-gray-400 hover:text-white",
                        )}
                        style={
                          aiPanelVisible
                            ? {
                                background: "#1E1B2D",
                                color: "#E4E4E7",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: !clientInfoVisible
                                  ? "12px"
                                  : "0",
                              }
                            : {
                                background: "#1E1B2D",
                                color: "#6B7280",
                                borderTopLeftRadius: "12px",
                              }
                        }
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        Asistente IA
                      </button>
                      <button
                        onClick={() => {
                          logger.navigation('Cambiando a panel de cliente en desktop');
                          setClientInfoVisible(true);
                          setAiPanelVisible(false);
                        }}
                        className={cn(
                          "flex-1 h-12 flex items-center justify-center cursor-pointer text-sm font-medium transition-colors",
                          clientInfoVisible
                            ? "text-white"
                            : "text-gray-400 hover:text-white",
                        )}
                        style={
                          clientInfoVisible
                            ? {
                                background: "#1E1B2D",
                                color: "#E4E4E7",
                                borderTopRightRadius: "12px",
                                borderTopLeftRadius: !aiPanelVisible
                                  ? "12px"
                                  : "0",
                              }
                            : {
                                background: "#1E1B2D",
                                color: "#6B7280",
                                borderTopRightRadius: "12px",
                              }
                        }
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Info del Cliente
                      </button>
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 overflow-hidden"
                      style={{
                        background: "#18181B",
                        borderRadius: "0 0 12px 12px",
                        borderTopRightRadius: aiPanelVisible ? "0" : "12px",
                        borderTopLeftRadius: clientInfoVisible ? "0" : "12px",
                      }}
                    >
                      {aiPanelVisible && <AIAssistantPanel />}
                      {clientInfoVisible && <ClientInfoPanel />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Other Modules */
            <div className="h-full w-full overflow-auto">
              {activeModule === "dashboard" && (
                <ExecutiveDashboard className="h-full w-full" />
              )}
              {activeModule === "crm" && (
                <CustomerHub className="h-full w-full" />
              )}
              {activeModule === "team" && (
                <EquipoPerformance className="h-full w-full" />
              )}
              {activeModule === "campaigns" && (
                <CampaignModule className="h-full w-full" />
              )}
              {activeModule === "knowledge" && (
                <KnowledgeBase className="h-full w-full" />
              )}
              {activeModule === "collaboration" && (
                <RealTimeCollaboration className="h-full w-full" />
              )}
              {activeModule === "settings" && (
                <SellerSettings className="h-full w-full" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
