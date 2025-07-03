import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  MessageCircle,
  Phone,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactCounts {
  all: number;
  unassigned: number;
  newLead: number;
  hotLead: number;
  payment: number;
  customer: number;
}

interface CRMSidebarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  contactCounts: ContactCounts;
  className?: string;
}

export function CRMSidebar({
  selectedCategory,
  onSelectCategory,
  contactCounts,
  className,
}: CRMSidebarProps) {
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(true);
  const [isTeamInboxOpen, setIsTeamInboxOpen] = useState(false);
  const [isCustomInboxOpen, setIsCustomInboxOpen] = useState(false);

  const categories = [
    {
      id: "all",
      label: "Todos",
      icon: Archive,
      count: contactCounts.all,
    },
    {
      id: "mine",
      label: "Míos",
      icon: User,
    },
    {
      id: "unassigned",
      label: "Sin Asignar",
      icon: MessageCircle,
      count: contactCounts.unassigned,
      countColor: "bg-blue-600",
    },
    {
      id: "incoming-calls",
      label: "Llamadas Entrantes",
      icon: Phone,
    },
  ];

  const lifecycleStages = [
    {
      id: "new-lead",
      label: "Nuevo Prospecto",
      emoji: "🆕",
      count: contactCounts.newLead,
    },
    {
      id: "hot-lead",
      label: "Prospecto Caliente",
      emoji: "🔥",
      count: contactCounts.hotLead,
    },
    {
      id: "payment",
      label: "Pago",
      emoji: "💵",
      count: contactCounts.payment,
    },
    {
      id: "customer",
      label: "Cliente",
      emoji: "🙂",
      count: contactCounts.customer,
    },
  ];

  return (
    <div
      className={cn(
        "w-64 min-w-[256px] max-w-[256px] bg-gray-900 border-r border-gray-800 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <p className="text-sm text-gray-400">Organize your contacts</p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Main Categories */}
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "w-full justify-between h-10 hover:bg-gray-700/60 text-gray-400 hover:text-white",
                  isSelected ? "bg-gray-700/60 text-white" : "",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{category.label}</span>
                </div>
                {category.count !== undefined && (
                  <Badge
                    className={cn(
                      "text-white text-xs px-2 py-0 h-5",
                      category.countColor || "bg-gray-600",
                    )}
                  >
                    {category.count}
                  </Badge>
                )}
              </Button>
            );
          })}

          {/* Lifecycle Section */}
          <div className="mt-6">
            <Collapsible
              open={isLifecycleOpen}
              onOpenChange={setIsLifecycleOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                >
                  <span className="text-sm font-medium">Ciclo de Vida</span>
                  {isLifecycleOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {lifecycleStages.map((stage) => {
                  const isSelected = selectedCategory === stage.id;

                  return (
                    <Button
                      key={stage.id}
                      variant="ghost"
                      onClick={() => onSelectCategory(stage.id)}
                      className={cn(
                        "w-full justify-between h-10 hover:bg-gray-700/60 text-gray-400 hover:text-white pl-6",
                        isSelected ? "bg-gray-700/60 text-white" : "",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stage.emoji}</span>
                        <span className="text-sm">{stage.label}</span>
                      </div>
                      {stage.count > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs px-2 py-0 h-5">
                          {stage.count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Team Inbox Section */}
          <div className="mt-6">
            <Collapsible
              open={isTeamInboxOpen}
              onOpenChange={setIsTeamInboxOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Bandeja de Equipo
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-4 h-4 p-0 text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Create team inbox");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    {isTeamInboxOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 px-4">
                <div className="text-xs text-gray-500 py-3 text-center">
                  No hay bandejas de equipo creadas
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full h-8 text-xs border-gray-600 text-gray-400 hover:bg-gray-700"
                    onClick={() => console.log("Create first team inbox")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Crear Primera
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Custom Inbox Section */}
          <div className="mt-4">
            <Collapsible
              open={isCustomInboxOpen}
              onOpenChange={setIsCustomInboxOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 hover:bg-gray-700/60 text-gray-400 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Bandeja Personalizada
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-4 h-4 p-0 text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Create custom inbox");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    {isCustomInboxOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 px-4">
                <div className="text-xs text-gray-500 py-3 text-center">
                  No hay bandejas personalizadas creadas
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full h-8 text-xs border-gray-600 text-gray-400 hover:bg-gray-700"
                    onClick={() => console.log("Create first custom inbox")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create First
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
