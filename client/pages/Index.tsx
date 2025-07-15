import { useState } from "react";
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

export default function Index() {
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

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    // Close mobile menu when chat is selected
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    console.log(`Navigating to ${module} module`);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    console.log(`Selected section: ${sectionId}`);
  };

  return (
    <div className="h-screen bg-[#121214] text-white overflow-hidden">
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
          style={{ top: "64px" }}
        >
          <div className="h-full flex">
            {/* Mobile Sidebar - 1/3 width */}
            <div className="w-1/3 border-r border-gray-800">
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
            onClick={() => setIsMobileMenuOpen(false)}
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
                        onShowAI={() => setRightPanelVisible(true)}
                        onShowClientInfo={() => {
                          setRightPanelVisible(true);
                          setClientInfoVisible(true);
                          setAiPanelVisible(false);
                        }}
                        onToggleRightPanel={() =>
                          setRightPanelVisible(!rightPanelVisible)
                        }
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
                  </div>
                ) : (
                  /* Mobile Inbox + Chat List */
                  <div className="h-full flex">
                    <div className="w-1/3">
                      <InboxSidebar
                        onSectionSelect={handleSectionSelect}
                        selectedSection={selectedSection}
                        onTogglePanels={() =>
                          setLeftPanelVisible(!leftPanelVisible)
                        }
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
                {/* Responsive media queries for smaller screens */}
                <style jsx>{`
                  @media (max-width: 1200px) {
                    .sidebar-collapsed {
                      width: 64px;
                    }
                  }
                  @media (max-width: 960px) {
                    .desktop-layout {
                      display: none !important;
                    }
                    .mobile-layout {
                      display: flex !important;
                    }
                  }
                `}</style>
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
