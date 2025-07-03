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

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  channels: ("whatsapp" | "facebook" | "sms" | "email")[];
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  scheduledDate?: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  assignees: string[];
  tags: string[];
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    errors: number;
    conversionRate: number;
    csat: number;
    incomingMessages: number;
    estimatedROI: number;
  };
}

// Mock data for campaigns
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Oferta Black Friday 2024",
    description: "Campaña promocional de descuentos especiales",
    status: "scheduled",
    channels: ["whatsapp", "email"],
    recipients: { total: 1500, sent: 0, delivered: 0, failed: 0 },
    scheduledDate: "2024-11-29T09:00:00Z",
    createdDate: "2024-01-15T10:30:00Z",
    updatedDate: "2024-01-15T14:20:00Z",
    createdBy: "María García",
    assignees: ["María García", "Carlos López"],
    tags: ["promocional", "descuentos", "blackfriday"],
  },
  {
    id: "2",
    name: "Seguimiento Post-Venta",
    description: "Encuesta de satisfacción automática",
    status: "sent",
    channels: ["whatsapp", "sms"],
    recipients: { total: 800, sent: 800, delivered: 756, failed: 44 },
    createdDate: "2024-01-10T08:15:00Z",
    updatedDate: "2024-01-12T16:45:00Z",
    createdBy: "Ana Morales",
    assignees: ["Ana Morales"],
    tags: ["seguimiento", "satisfaction"],
    stats: {
      sent: 800,
      delivered: 756,
      opened: 680,
      clicked: 142,
      replied: 89,
      errors: 44,
      conversionRate: 17.8,
      csat: 4.2,
      incomingMessages: 34,
      estimatedROI: 2450,
    },
  },
  {
    id: "3",
    name: "Recordatorio de Cita",
    description: "Recordatorios automáticos 24h antes",
    status: "draft",
    channels: ["sms"],
    recipients: { total: 0, sent: 0, delivered: 0, failed: 0 },
    createdDate: "2024-01-14T11:20:00Z",
    updatedDate: "2024-01-15T09:10:00Z",
    createdBy: "Luis Hernández",
    assignees: ["Luis Hernández", "Sofia Martinez"],
    tags: ["recordatorio", "citas"],
  },
];

interface CampaignModuleProps {
  className?: string;
}

export function CampaignModule({ className }: CampaignModuleProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    mockCampaigns[0],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  };

  const handleDeleteCampaign = (campaignId: string) => {
    console.log("{{deleteCampaign}} - Deleting campaign:", campaignId);
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
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSaveCampaign = (campaignData: any) => {
    console.log("{{saveCampaign}} - Saving campaign:", campaignData);
    setIsFormOpen(false);
  };

  const handleSendCampaign = (campaignId: string) => {
    console.log("{{sendCampaign}} - Sending campaign:", campaignId);
  };

  const handleCancelCampaign = (campaignId: string) => {
    console.log("{{cancelCampaign}} - Cancelling campaign:", campaignId);
  };

  // Calculate summary stats
  const totalCampaigns = mockCampaigns.length;
  const activeCampaigns = mockCampaigns.filter(
    (c) => c.status === "scheduled" || c.status === "sent",
  ).length;
  const draftCampaigns = mockCampaigns.filter(
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
              {mockCampaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.sent || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-blue-300 text-xs">Mensajes Enviados</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-green-400 text-lg font-bold">
              {mockCampaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.delivered || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-green-300 text-xs">Entregados</p>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <p className="text-purple-400 text-lg font-bold">
              {mockCampaigns
                .filter((c) => c.stats)
                .reduce((sum, c) => sum + (c.stats?.clicked || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-purple-300 text-xs">Clics Totales</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-yellow-400 text-lg font-bold">
              {(
                mockCampaigns
                  .filter((c) => c.stats)
                  .reduce((sum, c) => sum + (c.stats?.conversionRate || 0), 0) /
                mockCampaigns.filter((c) => c.stats).length
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
          campaigns={mockCampaigns}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={setSelectedCampaign}
          onEditCampaign={handleEditCampaign}
          onDuplicateCampaign={handleDuplicateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />

        {/* Main Panel (2/3) */}
        <CampaignMainPanel
          campaigns={mockCampaigns}
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
