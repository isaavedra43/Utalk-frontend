import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatList } from "@/components/ChatList";
import { ChatView } from "@/components/ChatView";
import { CustomerHub } from "@/components/CustomerHub";
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

export default function Index() {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>("1");
  const [activeModule, setActiveModule] = useState("messages");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [aiPanelVisible, setAiPanelVisible] = useState(true);
  const [clientInfoVisible, setClientInfoVisible] = useState(true);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    // Close mobile menu when chat is selected
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    console.log(`Navigating to ${module} module`);
  };

  return (
    <div className="h-screen bg-gray-950 text-white overflow-hidden">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">UNIK AI</h1>
          {activeModule === "messages" && selectedChatId && (
            <Badge className="bg-blue-600 text-white text-xs">
              Chat activo
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-400 hover:text-white p-2"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Desktop panel toggle controls */}
      <div className="hidden lg:flex absolute top-4 left-4 z-10 gap-2" />

      <div className="hidden lg:flex absolute top-4 right-4 z-10 gap-2" />

      {/* Main layout */}
      <div
        className={cn(
          "h-full flex",
          // On mobile, adjust height to account for header
          "lg:h-full",
          isMobileMenuOpen ? "overflow-hidden" : "",
        )}
      >
        {/* Sidebar Navigation - Desktop only */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            onTogglePanel={() => setLeftPanelVisible(!leftPanelVisible)}
            className="h-full"
          />
        </div>

        {/* Mobile Navigation Panel */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-40 bg-gray-900 transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ top: "64px" }} // Account for mobile header height
        >
          <div className="h-full flex">
            {/* Mobile Sidebar - 1/3 width */}
            <div className="w-1/3 border-r border-gray-800">
              <Sidebar
                activeModule={activeModule}
                onModuleChange={(module) => {
                  handleModuleChange(module);
                  // Don't close menu when switching modules, let user choose
                }}
                className="h-full"
              />
            </div>

            {/* Mobile Chat List - 2/3 width, only show in messages module */}
            {activeModule === "messages" && (
              <div className="flex-1">
                <ChatList
                  selectedChatId={selectedChatId}
                  onChatSelect={(chatId) => {
                    handleChatSelect(chatId);
                    setIsMobileMenuOpen(false); // Close menu when chat is selected
                  }}
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
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Messaging Module with 3-Column Grid Layout */}
        {activeModule === "messages" ? (
          <div className="h-full overflow-hidden">
            {/* Mobile Layout */}
            <div className="lg:hidden h-full flex flex-col">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftPanelVisible(!leftPanelVisible)}
                  className="text-gray-400 hover:text-white"
                >
                  ☰
                </Button>
                <h1 className="text-base font-semibold">Mensajes</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPanelVisible(!rightPanelVisible)}
                  className="text-gray-400 hover:text-white"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile collapsible panels */}
              {leftPanelVisible && (
                <div className="fixed inset-0 z-50 bg-black/50" style={{ top: "120px" }}>
                  <div className="w-80 bg-gray-900 h-full">
                    <ChatList
                      selectedChatId={selectedChatId}
                      onChatSelect={(chatId) => {
                        handleChatSelect(chatId);
                        setLeftPanelVisible(false);
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              )}

              {rightPanelVisible && (
                <div className="fixed inset-0 z-50 bg-black/50" style={{ top: "120px" }}>
                  <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900">
                    <div className="flex bg-gray-900 border-l border-gray-800">
                      <Button
                        size="sm"
                        variant={aiPanelVisible ? "default" : "ghost"}
                        onClick={() => {
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
                        onClick={() => setRightPanelVisible(false)}
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

              {/* Mobile Chat View */}
              <ChatView
                chatId={selectedChatId}
                className="flex-1"
                onShowAI={() => setRightPanelVisible(true)}
                onShowClientInfo={() => setRightPanelVisible(true)}
              />
            </div>

            {/* Desktop Layout - 3 Column Grid */}
            <div
              className="hidden lg:block h-full"
              style={{
                maxWidth: "1440px",
                margin: "0 auto",
                padding: "24px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: "280px 1fr 320px",
                  gridGap: "24px",
                  height: "calc(100vh - 48px)",
                }}
              >
                {/* Column 1: Sidebar de Bandejas */}
                <div
                  style={{
                    width: "280px",
                    background: "#1E1E2F",
                    borderRadius: "12px",
                    padding: "16px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ChatList
                    selectedChatId={selectedChatId}
                    onChatSelect={handleChatSelect}
                    className="h-full"
                  />
                </div>

                {/* Column 2: Chat Area */}
                <div
                  style={{
                    background: "#1E1E2F",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <ChatView
                    chatId={selectedChatId}
                    className="h-full"
                    onShowAI={() => setAiPanelVisible(true)}
                    onShowClientInfo={() => setClientInfoVisible(true)}
                  />
                </div>

                {/* Column 3: AI/Cliente Panel */}
                <div
                  style={{
                    width: "320px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* Tabs */}
                  <div className="flex" style={{ marginBottom: "0" }}>
                    <button
                      onClick={() => {
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
                              background: "#4F8EF7",
                              color: "#FFFFFF",
                              borderTopLeftRadius: "12px",
                              borderTopRightRadius: aiPanelVisible && !clientInfoVisible ? "12px" : "0",
                            }
                          : {
                              background: "#1E1E2F",
                              color: "#A0A0A0",
                              borderTopLeftRadius: "12px",
                            }
                      }
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Asistente IA
                    </button>
                    <button
                      onClick={() => {
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
                              background: "#3AD29F",
                              color: "#FFFFFF",
                              borderTopRightRadius: "12px",
                              borderTopLeftRadius: clientInfoVisible && !aiPanelVisible ? "12px" : "0",
                            }
                          : {
                              background: "#1E1E2F",
                              color: "#A0A0A0",
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
                      background: "#1E1E2F",
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