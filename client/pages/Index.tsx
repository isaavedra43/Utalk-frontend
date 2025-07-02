import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatList } from "@/components/ChatList";
import { ChatView } from "@/components/ChatView";
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
        <div className="hidden lg:block">
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
              <div className="flex-1 p-4">
                <div className="text-center text-gray-400">
                  <p className="text-lg font-medium mb-2">
                    {activeModule === "dashboard" ? "Dashboard" : "CRM"}
                  </p>
                  <p className="text-sm">
                    {activeModule === "dashboard"
                      ? "Analytics and insights coming soon"
                      : "Customer relationship management coming soon"}
                  </p>
                </div>
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

        {/* Desktop Left Panel - Chat List */}
        <div
          className={cn(
            "hidden lg:block transition-all duration-300 ease-in-out",
            leftPanelVisible ? "lg:w-64" : "lg:w-0 lg:overflow-hidden",
          )}
        >
          {activeModule === "messages" && (
            <ChatList
              selectedChatId={selectedChatId}
              onChatSelect={handleChatSelect}
              className="h-full"
            />
          )}
        </div>

        {/* Center Panel - Module Content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            // Mobile - full width
            "w-full lg:flex-1",
            // Desktop - calculated based on visible panels
            activeModule === "messages" && leftPanelVisible && rightPanelVisible
              ? "lg:max-w-[calc(100%-576px)] xl:max-w-[calc(100%-608px)]"
              : activeModule === "messages" && leftPanelVisible
                ? "lg:max-w-[calc(100%-256px)]"
                : activeModule === "messages" && rightPanelVisible
                  ? "lg:max-w-[calc(100%-320px)] xl:max-w-[calc(100%-352px)]"
                  : "lg:max-w-full",
          )}
        >
          {activeModule === "messages" ? (
            <div className="h-full flex flex-col">
              {/* Mobile: Show right panel as modal overlay when needed */}
              <div className="lg:hidden">
                {(aiPanelVisible || clientInfoVisible) && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50"
                    style={{ top: "64px" }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900">
                      {/* Mobile tabs */}
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
                          onClick={() => {
                            setAiPanelVisible(false);
                            setClientInfoVisible(false);
                          }}
                          className="w-12 h-12 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Mobile panel content */}
                      <div className="flex-1 overflow-hidden">
                        {aiPanelVisible && <AIAssistantPanel />}
                        {clientInfoVisible && <ClientInfoPanel />}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat View with mobile controls */}
              <ChatView
                chatId={selectedChatId}
                className="h-full"
                onShowAI={() => setAiPanelVisible(true)}
                onShowClientInfo={() => setClientInfoVisible(true)}
              />
            </div>
          ) : activeModule === "dashboard" ? (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center text-gray-400 p-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium mb-2">Dashboard</p>
                <p className="text-sm">Analytics and insights coming soon</p>
              </div>
            </div>
          ) : activeModule === "crm" ? (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center text-gray-400 p-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium mb-2">CRM</p>
                <p className="text-sm">
                  Customer relationship management coming soon
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Desktop Right Panel - AI Assistant & Client Info */}
        {activeModule === "messages" && (
          <div
            className={cn(
              "hidden lg:flex lg:flex-col transition-all duration-300 ease-in-out",
              // Responsive width: smaller on tablet, larger on desktop
              "lg:w-80 xl:w-96",
              rightPanelVisible ? "flex" : "w-0 overflow-hidden",
            )}
          >
            {/* Desktop Horizontal Toggle Buttons */}
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
                Asistente IA
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
                Info del Cliente
              </Button>
            </div>

            {/* Desktop Content Section */}
            <div className="flex-1 overflow-hidden">
              {aiPanelVisible && <AIAssistantPanel />}
              {clientInfoVisible && <ClientInfoPanel />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
