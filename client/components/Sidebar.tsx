import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Sparkles,
  PanelLeftClose,
  UserCheck,
  Settings,
  Megaphone,
  BookOpen,
  Video,
} from "lucide-react";

interface SidebarProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
  onTogglePanel?: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  subItems?: { id: string; label: string; href: string }[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Panel de Control",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "messages",
    label: "Mensajes",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    id: "crm",
    label: "CRM",
    icon: Users,
    href: "/crm",
    subItems: [
      { id: "contacts", label: "Contactos", href: "/crm/contacts" },
      { id: "companies", label: "Empresas", href: "/crm/companies" },
      { id: "deals", label: "Oportunidades", href: "/crm/deals" },
    ],
  },
  {
    id: "team",
    label: "Equipo",
    icon: UserCheck,
    href: "/team",
  },
  {
    id: "campaigns",
    label: "Campañas",
    icon: Megaphone,
    href: "/campaigns",
  },
  {
    id: "knowledge",
    label: "Base de Conocimiento",
    icon: BookOpen,
    href: "/knowledge",
  },
  {
    id: "collaboration",
    label: "Colaboración",
    icon: Video,
    href: "/collaboration",
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar({
  activeModule = "messages",
  onModuleChange,
  onTogglePanel,
  className,
}: SidebarProps) {
  const handleModuleClick = (moduleId: string) => {
    onModuleChange?.(moduleId);
  };

  return (
    <div
      className={cn(
        "h-full bg-[#1E1B2D] border-r border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out w-16",
        className,
      )}
    >
      {/* Logo Section */}
      <div className="p-3 border-b border-gray-700/50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg"
            >
              <div>
                <div className="font-bold">UNIK AI</div>
                <div className="text-xs text-gray-400">Customer Support</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Toggle Panel Button */}

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-2">
        <TooltipProvider>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleModuleClick(item.id)}
                    className={cn(
                      "w-full h-12 justify-center p-0 transition-all duration-200 relative group rounded-xl text-sm",
                      isActive
                        ? "bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#E4E4E7]"
                        : "text-[#E4E4E7] hover:text-white hover:bg-[#2A2640] border border-transparent hover:border-gray-600/30",
                    )}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7C3AED] rounded-l-full" />
                    )}

                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive
                          ? "text-[#E4E4E7]"
                          : "text-[#E4E4E7] group-hover:text-white",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-700/50 mx-3" />

      {/* Bottom Section - Settings/Profile */}
      <div className="p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-12 justify-center p-0 text-[#E4E4E7] hover:text-white hover:bg-[#2A2640] border border-transparent hover:border-gray-600/30 rounded-xl transition-all duration-200"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-medium text-white">IS</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg"
            >
              <div>
                <div className="font-medium">Israel S.</div>
                <div className="text-xs text-gray-400">Admin</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
