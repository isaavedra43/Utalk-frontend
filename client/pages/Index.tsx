import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatList } from "@/components/ChatList";
import { ChatView } from "@/components/ChatView";
import Copilot from "@/components/Copilot";
import { ClientInfoPanel } from "@/components/ClientInfoPanel";
import { Button } from "@/components/ui/button";
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
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-lg font-semibold">Customer Support</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-400 hover:text-white"
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
      <div className="h-full flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block">
          <Sidebar
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            className="h-full"
          />
        </div>

        {/* Left Panel - Chat List - Made more compact */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            // Mobile
            "lg:relative fixed inset-y-0 left-0 z-40 w-80",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop - Reduced width from w-80 (320px) to w-64 (256px)
            "lg:translate-x-0",
            leftPanelVisible ? "lg:w-64" : "lg:w-0 lg:overflow-hidden",
          )}
        >
          {/* Mobile Sidebar */}
          <div className="lg:hidden">
            <Sidebar
              activeModule={activeModule}
              onModuleChange={handleModuleChange}
              className="h-full"
            />
          </div>

          {/* Chat List - only visible on desktop when in messages module */}
          <div
            className={cn(
              "h-full",
              activeModule === "messages" ? "block" : "hidden lg:hidden",
            )}
          >
            <ChatList
              selectedChatId={selectedChatId}
              onChatSelect={handleChatSelect}
              className="h-full"
            />
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Center Panel - Module Content - More space for chat */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            // Updated width calculations for narrower chat list (256px) and responsive right panel
            activeModule === "messages" && leftPanelVisible && rightPanelVisible
              ? "lg:max-w-[calc(100%-576px)] xl:max-w-[calc(100%-608px)]" // 256px + 320px on lg, 256px + 352px on xl
              : activeModule === "messages" && leftPanelVisible
                ? "lg:max-w-[calc(100%-256px)]" // Only chat list width
                : activeModule === "messages" && rightPanelVisible
                  ? "lg:max-w-[calc(100%-320px)] xl:max-w-[calc(100%-352px)]" // Only right panel width
                  : "lg:max-w-full",
          )}
        >
          {activeModule === "messages" ? (
            <ChatView chatId={selectedChatId} className="h-full" />
          ) : activeModule === "dashboard" ? (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium mb-2">Dashboard</p>
                <p className="text-sm">Analytics and insights coming soon</p>
              </div>
            </div>
          ) : activeModule === "crm" ? (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center text-gray-400">
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

        {/* Right Panel - Client Info (always visible and fixed in messages module) */}
        {activeModule === "messages" && (
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              // Mobile - hidden by default, shows on tablet and up
              "hidden md:flex md:flex-col",
              // Responsive width: smaller on tablet, larger on desktop
              "md:w-64 lg:w-80 xl:w-96",
              rightPanelVisible ? "flex" : "w-0 overflow-hidden",
            )}
          >
            {/* Content Section - Fixed Client Info */}
            <div className="flex-1 overflow-hidden">
              <ClientInfoPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
