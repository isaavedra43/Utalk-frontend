import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Inbox,
  RotateCcw,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface MessagesSidebarProps {
  onSectionSelect: (sectionId: string) => void;
  selectedSection: string | null;
  onToggleInbox?: () => void;
  className?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
  },
  {
    id: "lifecycle",
    label: "Ciclo de Vida",
    icon: RotateCcw,
    hasSubmenu: true,
  },
  {
    id: "team-inbox",
    label: "Team Inbox",
    icon: Users,
  },
  {
    id: "custom-inbox",
    label: "Custom Inbox",
    icon: Settings,
  },
];

export function MessagesSidebar({
  onSectionSelect,
  selectedSection,
  onToggleInbox,
  className,
}: MessagesSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === "lifecycle") {
      setExpandedSection(expandedSection === "lifecycle" ? null : "lifecycle");
    }
    onSectionSelect(sectionId);
  };

  return (
    <div
      className={cn("flex flex-col", className)}
      style={{
        width: "64px",
        background: "#1E1E2F",
        borderRight: "1px solid rgba(182, 188, 195, 0.16)",
        fontFamily: "Inter, sans-serif",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Toggle Button */}
      {onToggleInbox && (
        <div
          style={{
            padding: "12px 8px",
            borderBottom: "1px solid rgba(182, 188, 195, 0.16)",
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleInbox}
                  className="w-full h-12 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  style={{
                    background: "rgba(0, 0, 0, 0)",
                    borderRadius: "8px",
                    width: "48px",
                    height: "48px",
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg"
              >
                Toggle Inbox
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2">
        <TooltipProvider>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedSection === item.id;
            const isExpanded = expandedSection === item.id;

            return (
              <div key={item.id} className="mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleSectionClick(item.id)}
                      className={cn(
                        "w-full h-12 justify-center p-0 transition-all duration-200 relative group rounded-xl",
                        isActive
                          ? "bg-blue-600/20 border border-blue-500/30 text-blue-400"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/60 border border-transparent hover:border-gray-600/30",
                      )}
                    >
                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-full" />
                      )}

                      <div className="flex items-center justify-center">
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive
                              ? "text-blue-400"
                              : "text-gray-400 group-hover:text-white",
                          )}
                        />
                        {item.hasSubmenu && (
                          <div className="absolute bottom-1 right-1">
                            {isExpanded ? (
                              <ChevronDown className="w-2 h-2 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-2 h-2 text-gray-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg"
                  >
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
