import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Users, Sparkles } from "lucide-react";

interface SidebarProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
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
    label: "Dashboard",
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
];

export function Sidebar({
  activeModule = "messages",
  onModuleChange,
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleModuleClick = (moduleId: string) => {
    onModuleChange?.(moduleId);

    // Toggle expanded state for items with subitems
    const item = navigationItems.find((item) => item.id === moduleId);
    if (item?.subItems) {
      setExpandedItems((prev) =>
        prev.includes(moduleId)
          ? prev.filter((id) => id !== moduleId)
          : [...prev, moduleId],
      );
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "h-full bg-[#1e1e2d] border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">UNIK AI</h1>
              <p className="text-gray-400 text-xs">Customer Support</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const isExpanded = expandedItems.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id}>
              {/* Main Navigation Item */}
              <Button
                variant="ghost"
                onClick={() => handleModuleClick(item.id)}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 h-auto transition-all duration-200 relative group",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50",
                  isCollapsed && "justify-center px-2",
                )}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 group-hover:text-white",
                  )}
                />

                {!isCollapsed && (
                  <>
                    <span className="font-medium text-sm flex-1 text-left">
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-90",
                        )}
                      />
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Button>

              {/* Sub Items */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems?.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant="ghost"
                      onClick={() => console.log(`Navigate to ${subItem.href}`)}
                      className="w-full justify-start gap-3 px-3 py-2 h-auto text-gray-400 hover:text-white hover:bg-gray-700/30 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0" />
                      <span className="text-left">{subItem.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-700 mx-4" />

      {/* Bottom Section - Settings/Profile */}
      <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 px-3 py-2.5 h-auto text-gray-300 hover:text-white hover:bg-gray-700/50",
            isCollapsed && "justify-center px-2",
          )}
        >
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-white">IS</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Israel S.</div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
          )}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1e1e2d] border border-gray-700 rounded-full p-0 hover:bg-gray-700 z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-400" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-400" />
        )}
      </Button>
    </div>
  );
}
