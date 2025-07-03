import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  Calendar,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignSidebarProps {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onEditCampaign: (campaign: Campaign) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

const statusConfig = {
  draft: {
    label: "Borrador",
    color: "bg-gray-600 text-white",
    icon: FileText,
  },
  scheduled: {
    label: "Programada",
    color: "bg-blue-600 text-white",
    icon: Clock,
  },
  sent: {
    label: "Enviada",
    color: "bg-green-600 text-white",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-600 text-white",
    icon: X,
  },
};

const channelColors = {
  whatsapp: "text-green-400",
  facebook: "text-blue-400",
  sms: "text-purple-400",
  email: "text-blue-500",
};

export function CampaignSidebar({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
}: CampaignSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesChannel =
      channelFilter === "all" ||
      campaign.channels.includes(channelFilter as any);

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-1/3 min-w-[350px] border-r border-gray-800 bg-gray-950">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Lista de Campañas
          </h2>
          <Badge className="bg-gray-700 text-gray-300 text-xs">
            {filteredCampaigns.length} de {campaigns.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-xs h-8">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all" className="text-white text-xs">
                Todos los estados
              </SelectItem>
              <SelectItem value="draft" className="text-white text-xs">
                Borradores
              </SelectItem>
              <SelectItem value="scheduled" className="text-white text-xs">
                Programadas
              </SelectItem>
              <SelectItem value="sent" className="text-white text-xs">
                Enviadas
              </SelectItem>
              <SelectItem value="cancelled" className="text-white text-xs">
                Canceladas
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-xs h-8">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all" className="text-white text-xs">
                Todos los canales
              </SelectItem>
              <SelectItem value="whatsapp" className="text-white text-xs">
                WhatsApp
              </SelectItem>
              <SelectItem value="facebook" className="text-white text-xs">
                Facebook
              </SelectItem>
              <SelectItem value="sms" className="text-white text-xs">
                SMS
              </SelectItem>
              <SelectItem value="email" className="text-white text-xs">
                Email
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaign List */}
      <ScrollArea className="h-[calc(100%-140px)]">
        <div className="p-2 space-y-2">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No hay campañas</p>
              <p className="text-xs">
                No se encontraron campañas que coincidan con los filtros
              </p>
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const statusInfo = statusConfig[campaign.status];
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedCampaign?.id === campaign.id;

              return (
                <div
                  key={campaign.id}
                  className={cn(
                    "bg-gray-800/50 border border-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-gray-800/70 hover:border-gray-600",
                    isSelected &&
                      "border-2 border-purple-500 bg-gray-800/70 shadow-lg shadow-purple-500/10",
                  )}
                  onClick={() => onSelectCampaign(campaign)}
                >
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate mb-1">
                        {campaign.name}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {campaign.description}
                      </p>
                    </div>

                    {/* Context Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-800 border-gray-700"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCampaign(campaign);
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateCampaign(campaign.id);
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCampaign(campaign.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs border", statusInfo.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Channels */}
                  <div className="flex items-center gap-1 mb-2">
                    {campaign.channels.map((channel) => (
                      <span
                        key={channel}
                        className={cn(
                          "text-xs px-2 py-1 rounded bg-gray-700/50 capitalize",
                          channelColors[channel],
                        )}
                      >
                        {channel}
                      </span>
                    ))}
                  </div>

                  {/* Recipients Info */}
                  <div className="text-xs text-gray-400 mb-2">
                    <span>
                      {campaign.recipients.total > 0
                        ? `${campaign.recipients.total.toLocaleString()} destinatarios`
                        : "Sin destinatarios"}
                    </span>
                    {campaign.recipients.sent > 0 && (
                      <span className="ml-2 text-green-400">
                        {campaign.recipients.sent} enviados
                      </span>
                    )}
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {campaign.scheduledDate ? (
                      <span>
                        Programada: {formatDate(campaign.scheduledDate)}
                      </span>
                    ) : (
                      <span>Creada: {formatDate(campaign.createdDate)}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {campaign.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {campaign.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {campaign.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{campaign.tags.length - 2} más
                        </span>
                      )}
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-purple-500/30">
                      <div className="flex items-center justify-center gap-2 text-purple-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">
                          Seleccionada
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
