import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MessageCircle,
  Phone,
  Users,
  Archive,
  Inbox,
  UserCheck,
  Crown,
  DollarSign,
  Flame,
  Star,
  Menu,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InboxSidebarProps {
  onSectionSelect: (sectionId: string) => void;
  selectedSection: string | null;
  onTogglePanels?: () => void;
  className?: string;
}

export function InboxSidebar({
  onSectionSelect,
  selectedSection,
  onTogglePanels,
  className,
}: InboxSidebarProps) {
  const [isLifecycleOpen, setIsLifecycleOpen] = useState(true);

  // Counters
  const allCount = 3;
  const unassignedCount = 1;
  const newLeadCount = 2;

  const handleSectionClick = (sectionId: string) => {
    onSectionSelect(sectionId);
  };

  return (
    <div
      className={cn("flex flex-col", className)}
      style={{
        width: "280px",
        background: "#1E1E2F",
        borderRadius: "0",
        padding: "16px",
        fontFamily: "Inter, sans-serif",
        overflowY: "auto",
        borderRight: "1px solid rgba(182, 188, 195, 0.16)",
      }}
    >
      {/* Header */}
      <div style={{ paddingTop: "24px", marginBottom: "24px" }}>
        <h2
          className="text-white font-bold"
          style={{
            fontSize: "18px",
            fontWeight: "700",
            lineHeight: "24px",
            color: "#FFFFFF",
            marginBottom: "16px",
          }}
        >
          Inbox
        </h2>

        {/* Search Bar */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Buscar bandeja…"
            style={{
              width: "100%",
              height: "36px",
              padding: "8px 12px",
              background: "#252538",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#FFFFFF",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Main Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          {/* All */}
          <Button
            variant="ghost"
            onClick={() => handleSectionClick("all")}
            className={cn("w-full justify-between transition-colors")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "48px",
              padding: "0 12px",
              borderRadius: "8px",
              background: selectedSection === "all" ? "#3A3A4D" : "transparent",
              color: selectedSection === "all" ? "#FFFFFF" : "#A0A0A0",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Archive style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "14px" }}>Todos</span>
            </div>
            <Badge
              className="text-xs"
              style={{
                background: "#4F8EF7",
                color: "#FFFFFF",
                fontSize: "10px",
                borderRadius: "12px",
                padding: "2px 6px",
              }}
            >
              {allCount}
            </Badge>
          </Button>

          {/* Mine */}
          <Button
            variant="ghost"
            onClick={() => handleSectionClick("mine")}
            className={cn("w-full justify-start transition-colors")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "48px",
              padding: "0 12px",
              borderRadius: "8px",
              background:
                selectedSection === "mine" ? "#3A3A4D" : "transparent",
              color: selectedSection === "mine" ? "#FFFFFF" : "#A0A0A0",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Users style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "14px" }}>Míos</span>
            </div>
          </Button>

          {/* Unassigned */}
          <Button
            variant="ghost"
            onClick={() => handleSectionClick("unassigned")}
            className={cn("w-full justify-between transition-colors")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "48px",
              padding: "0 12px",
              borderRadius: "8px",
              background:
                selectedSection === "unassigned" ? "#3A3A4D" : "transparent",
              color: selectedSection === "unassigned" ? "#FFFFFF" : "#A0A0A0",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <MessageCircle style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "14px" }}>Sin Asignar</span>
            </div>
            <Badge
              className="text-xs"
              style={{
                background: "#EF476F",
                color: "#FFFFFF",
                fontSize: "10px",
                borderRadius: "12px",
                padding: "2px 6px",
              }}
            >
              {unassignedCount}
            </Badge>
          </Button>

          {/* Incoming Calls */}
          <Button
            variant="ghost"
            onClick={() => handleSectionClick("calls")}
            className={cn("w-full justify-start transition-colors")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "48px",
              padding: "0 12px",
              borderRadius: "8px",
              background:
                selectedSection === "calls" ? "#3A3A4D" : "transparent",
              color: selectedSection === "calls" ? "#FFFFFF" : "#A0A0A0",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Phone style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "14px" }}>Llamadas Entrantes</span>
            </div>
          </Button>
        </div>

        {/* Lifecycle Section */}
        <div style={{ marginBottom: "12px" }}>
          <Collapsible open={isLifecycleOpen} onOpenChange={setIsLifecycleOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between transition-colors"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "48px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#A0A0A0",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  Ciclo de Vida
                </span>
                {isLifecycleOpen ? (
                  <ChevronDown style={{ width: "20px", height: "20px" }} />
                ) : (
                  <ChevronRight style={{ width: "20px", height: "20px" }} />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div style={{ marginTop: "4px" }}>
                {/* New Lead */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("new-lead")}
                  className={cn("w-full justify-between transition-colors")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "48px",
                    padding: "0 12px",
                    paddingLeft: "28px", // 16px indentation
                    borderRadius: "8px",
                    background:
                      selectedSection === "new-lead"
                        ? "#3A3A4D"
                        : "transparent",
                    color:
                      selectedSection === "new-lead" ? "#FFFFFF" : "#A0A0A0",
                    marginBottom: "4px",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🆕</span>
                    <span style={{ fontSize: "14px" }}>Nuevo Prospecto</span>
                  </div>
                  <Badge
                    className="text-xs"
                    style={{
                      background: "#3AD29F",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      borderRadius: "12px",
                      padding: "2px 6px",
                    }}
                  >
                    {newLeadCount}
                  </Badge>
                </Button>

                {/* Hot Lead */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("hot-lead")}
                  className={cn("w-full justify-start transition-colors")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "48px",
                    padding: "0 12px",
                    paddingLeft: "28px", // 16px indentation
                    borderRadius: "8px",
                    background:
                      selectedSection === "hot-lead"
                        ? "#3A3A4D"
                        : "transparent",
                    color:
                      selectedSection === "hot-lead" ? "#FFFFFF" : "#A0A0A0",
                    marginBottom: "4px",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🔥</span>
                    <span style={{ fontSize: "14px" }}>Prospecto Caliente</span>
                  </div>
                </Button>

                {/* Payment */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("payment")}
                  className={cn("w-full justify-start transition-colors")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "48px",
                    padding: "0 12px",
                    paddingLeft: "28px", // 16px indentation
                    borderRadius: "8px",
                    background:
                      selectedSection === "payment" ? "#3A3A4D" : "transparent",
                    color:
                      selectedSection === "payment" ? "#FFFFFF" : "#A0A0A0",
                    marginBottom: "4px",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <DollarSign style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontSize: "14px" }}>Pago</span>
                  </div>
                </Button>

                {/* Customer */}
                <Button
                  variant="ghost"
                  onClick={() => handleSectionClick("customer")}
                  className={cn("w-full justify-start transition-colors")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "48px",
                    padding: "0 12px",
                    paddingLeft: "28px", // 16px indentation
                    borderRadius: "8px",
                    background:
                      selectedSection === "customer"
                        ? "#3A3A4D"
                        : "transparent",
                    color:
                      selectedSection === "customer" ? "#FFFFFF" : "#A0A0A0",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <Crown style={{ width: "20px", height: "20px" }} />
                    <span style={{ fontSize: "14px" }}>Cliente</span>
                  </div>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Team Inbox Section */}
        <div style={{ marginBottom: "12px" }}>
          <div
            className="flex items-center justify-between"
            style={{
              height: "48px",
              padding: "0 12px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#A0A0A0",
              }}
            >
              Bandeja de Equipo
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <Plus style={{ width: "16px", height: "16px" }} />
            </Button>
          </div>
        </div>

        {/* Custom Inbox Section */}
        <div style={{ marginBottom: "12px" }}>
          <div
            className="flex items-center justify-between"
            style={{
              height: "48px",
              padding: "0 12px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#A0A0A0",
              }}
            >
              Bandeja Personalizada
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <Plus style={{ width: "16px", height: "16px" }} />
            </Button>
          </div>
        </div>

        {/* Calls Section */}
        <Button
          variant="ghost"
          onClick={() => handleSectionClick("calls-section")}
          className={cn("w-full justify-start transition-colors")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "48px",
            padding: "0 12px",
            borderRadius: "8px",
            background:
              selectedSection === "calls-section" ? "#3A3A4D" : "transparent",
            color: selectedSection === "calls-section" ? "#FFFFFF" : "#A0A0A0",
          }}
        >
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Phone style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "14px" }}>Llamadas</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
