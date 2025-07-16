import { useState } from "react";
import { CampaignSidebar } from "./campaigns/CampaignSidebar";
import { CampaignMainPanel } from "./campaigns/CampaignMainPanel";
import { CampaignForm } from "./campaigns/CampaignForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Plus,
  Upload,
  Download,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useLaunchCampaign, useDuplicateCampaign } from "@/hooks/useCampaigns";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@/types/api";

interface CampaignModuleProps {
  className?: string;
}

export function CampaignModule({ className }: CampaignModuleProps) {
  // Hooks para datos reales
  const { data: campaignsResponse, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();
  const launchCampaignMutation = useLaunchCampaign();
  const duplicateCampaignMutation = useDuplicateCampaign();

  // Datos reales desde el hook
  const campaigns = campaignsResponse?.data || [];
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    campaigns.length > 0 ? campaigns[0] : null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Actualizar selectedCampaign cuando lleguen los datos
  useState(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0]);
    }
  });

  // Event handlers
  const handleCreateCampaign = () => {
    setFormMode("create");
    setSelectedCampaign(null);
    setIsFormOpen(true);
    console.log("{{createCampaign}} - Opening campaign creation form");
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setFormMode("edit");
    setSelectedCampaign(campaign);
    setIsFormOpen(true);
    console.log("{{editCampaign}} - Editing campaign:", campaign.id);
  };

  const handleDuplicateCampaign = (campaignId: string) => {
    console.log("{{duplicateCampaign}} - Duplicating campaign:", campaignId);
    duplicateCampaignMutation.mutate({ campaignId });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    console.log("{{deleteCampaign}} - Deleting campaign:", campaignId);
    deleteCampaignMutation.mutate(campaignId);
  };

  const handleImportCampaigns = () => {
    console.log("{{importCampaigns}} - Opening import dialog");
  };

  const handleExportCampaigns = () => {
    console.log("{{exportCampaigns}} - Exporting campaigns to CSV");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log("{{refreshCampaigns}} - Refreshing campaign data");
    refetchCampaigns().finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleSaveCampaign = (campaignData: any) => {
    console.log("{{saveCampaign}} - Saving campaign:", campaignData);
    
    if (formMode === "create") {
      createCampaignMutation.mutate(campaignData);
    } else if (selectedCampaign) {
      updateCampaignMutation.mutate({
        campaignId: selectedCampaign.id,
        data: campaignData
      });
    }
    
    setIsFormOpen(false);
  };

  const handleSendCampaign = (campaignId: string) => {
    console.log("{{sendCampaign}} - Sending campaign:", campaignId);
    launchCampaignMutation.mutate(campaignId);
  };

  const handleCancelCampaign = (campaignId: string) => {
    console.log("{{cancelCampaign}} - Cancelling campaign:", campaignId);
  };

  // Loading state
  if (isLoadingCampaigns) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-400">Cargando campañas...</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "scheduled" || c.status === "sent",
  ).length;
  const draftCampaigns = campaigns.filter(
    (c) => c.status === "draft",
  ).length;

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden", className)}>
      {/* Module Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-0 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
              <Megaphone className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Campañas de Mensajes
              </h1>
              <p className="text-sm text-gray-400">
                Crea, programa y gestiona tus campañas de marketing
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white text-xs">
                {activeCampaigns} activas
              </Badge>
              <Badge className="bg-yellow-600 text-white text-xs">
                {draftCampaigns} borradores
              </Badge>
              <Badge className="bg-gray-700 text-gray-300 text-xs">
                {totalCampaigns} total
              </Badge>
            </div>

            {/* Action Buttons */}
            <Button
              onClick={handleImportCampaigns}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button
              onClick={handleExportCampaigns}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Actualizar
            </Button>
            <Button
              onClick={handleCreateCampaign}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <p className="text-blue-400 text-lg font-bold">
              {campaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.sent || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-blue-300 text-xs">Mensajes Enviados</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-green-400 text-lg font-bold">
              {campaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.delivered || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-green-300 text-xs">Entregados</p>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <p className="text-purple-400 text-lg font-bold">
              {campaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.clicked || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-purple-300 text-xs">Clics Totales</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-yellow-400 text-lg font-bold">
              {(
                campaigns
                  .filter((c) => c.stats)
                  .reduce((sum, c) => sum + (c.stats?.conversionRate || 0), 0) /
                campaigns.filter((c) => c.stats).length
              ).toFixed(1)}
              %
            </p>
            <p className="text-yellow-300 text-xs">Conversión Promedio</p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex h-[calc(100%-180px)] overflow-hidden">
        {/* Sidebar (1/3) */}
        <CampaignSidebar
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={setSelectedCampaign}
          onEditCampaign={handleEditCampaign}
          onDuplicateCampaign={handleDuplicateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />

        {/* Main Panel (2/3) */}
        <CampaignMainPanel
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onEditCampaign={handleEditCampaign}
          onDuplicateCampaign={handleDuplicateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onSendCampaign={handleSendCampaign}
          onCancelCampaign={handleCancelCampaign}
        />
      </div>

      {/* Campaign Form Modal */}
      {isFormOpen && (
        <CampaignForm
          campaign={selectedCampaign}
          mode={formMode}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
}
