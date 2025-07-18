import { CampaignListView } from "./CampaignListView";
import { CampaignCardsView } from "./CampaignCardsView";
import { CampaignPreview } from "./CampaignPreview";
import { CampaignStats } from "./CampaignStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, Grid3X3, Eye, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignMainPanelProps {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  viewMode: "list" | "cards";
  onViewModeChange: (mode: "list" | "cards") => void;
  onEditCampaign: (campaign: Campaign) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onSendCampaign: (campaignId: string) => void;
  onCancelCampaign: (campaignId: string) => void;
}

export function CampaignMainPanel({
  campaigns,
  selectedCampaign,
  viewMode,
  onViewModeChange,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onSendCampaign,
  onCancelCampaign,
}: CampaignMainPanelProps) {
  const showPreview = selectedCampaign && selectedCampaign.status === "draft";
  const showStats = selectedCampaign && selectedCampaign.stats;

  return (
    <div className="flex-1 flex flex-col">
      {/* Panel Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {selectedCampaign ? selectedCampaign.name : "Gestión de Campañas"}
            </h2>
            <p className="text-sm text-gray-400">
              {selectedCampaign
                ? selectedCampaign.description
                : `${campaigns.length} campañas en total`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                <List className="h-4 w-4 mr-1" />
                Lista
              </Button>
              <Button
                size="sm"
                variant={viewMode === "cards" ? "default" : "ghost"}
                onClick={() => onViewModeChange("cards")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Tarjetas
              </Button>
            </div>

            {/* Quick Actions for Selected Campaign */}
            {selectedCampaign && (
              <div className="flex items-center gap-2">
                {selectedCampaign.status === "draft" && (
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => onSendCampaign(selectedCampaign.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview & Enviar
                  </Button>
                )}
                {selectedCampaign.stats && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Estadísticas
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Campaign Info */}
        {selectedCampaign && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Estado:</span>
              <Badge
                className={cn(
                  "text-xs",
                  selectedCampaign.status === "draft" &&
                    "bg-gray-600 text-white",
                  selectedCampaign.status === "scheduled" &&
                    "bg-blue-600 text-white",
                  selectedCampaign.status === "sent" &&
                    "bg-green-600 text-white",
                  selectedCampaign.status === "cancelled" &&
                    "bg-red-600 text-white",
                )}
              >
                {selectedCampaign.status === "draft" && "Borrador"}
                {selectedCampaign.status === "scheduled" && "Programada"}
                {selectedCampaign.status === "sent" && "Enviada"}
                {selectedCampaign.status === "cancelled" && "Cancelada"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Canales:</span>
              <div className="flex gap-1">
                {selectedCampaign.channels.map((channel) => (
                  <Badge
                    key={channel}
                    className="bg-gray-700 text-gray-300 text-xs capitalize"
                  >
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Destinatarios:</span>
              <span className="text-white font-medium">
                {selectedCampaign.recipients.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {selectedCampaign ? (
          <div className="h-full flex">
            {/* Main Content */}
            <div
              className={cn("flex-1", (showPreview || showStats) && "w-2/3")}
            >
              {viewMode === "list" ? (
                <CampaignListView
                  campaigns={campaigns}
                  onEditCampaign={onEditCampaign}
                  onDuplicateCampaign={onDuplicateCampaign}
                  onDeleteCampaign={onDeleteCampaign}
                  onSendCampaign={onSendCampaign}
                  onCancelCampaign={onCancelCampaign}
                />
              ) : (
                <CampaignCardsView
                  campaigns={campaigns}
                  onEditCampaign={onEditCampaign}
                  onDuplicateCampaign={onDuplicateCampaign}
                  onDeleteCampaign={onDeleteCampaign}
                  onSendCampaign={onSendCampaign}
                  onCancelCampaign={onCancelCampaign}
                />
              )}
            </div>

            {/* Side Panel for Preview or Stats */}
            {(showPreview || showStats) && (
              <div className="w-1/3 border-l border-gray-800">
                {showPreview && <CampaignPreview campaign={selectedCampaign} />}
                {showStats && <CampaignStats campaign={selectedCampaign} />}
              </div>
            )}
          </div>
        ) : (
          // No campaign selected - show overview
          <div className="h-full">
            {viewMode === "list" ? (
              <CampaignListView
                campaigns={campaigns}
                onEditCampaign={onEditCampaign}
                onDuplicateCampaign={onDuplicateCampaign}
                onDeleteCampaign={onDeleteCampaign}
                onSendCampaign={onSendCampaign}
                onCancelCampaign={onCancelCampaign}
              />
            ) : (
              <CampaignCardsView
                campaigns={campaigns}
                onEditCampaign={onEditCampaign}
                onDuplicateCampaign={onDuplicateCampaign}
                onDeleteCampaign={onDeleteCampaign}
                onSendCampaign={onSendCampaign}
                onCancelCampaign={onCancelCampaign}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
