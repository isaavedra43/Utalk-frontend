import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Send,
  X,
  Calendar,
  Users,
  MessageCircle,
  Mail,
  MessageSquare,
  Smartphone,
  BarChart3,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignCardsViewProps {
  campaigns: Campaign[];
  onEditCampaign: (campaign: Campaign) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onSendCampaign: (campaignId: string) => void;
  onCancelCampaign: (campaignId: string) => void;
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

const channelIcons = {
  whatsapp: MessageCircle,
  facebook: MessageSquare,
  sms: Smartphone,
  email: Mail,
};

const channelColors = {
  whatsapp: "text-green-400 bg-green-900/20 border-green-500/30",
  facebook: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  sms: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  email: "text-blue-500 bg-blue-900/20 border-blue-500/30",
};

export function CampaignCardsView({
  campaigns,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onSendCampaign,
  onCancelCampaign,
}: CampaignCardsViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (campaigns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950">
        <div className="text-center text-gray-400 p-8">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay campañas</h3>
          <p className="text-sm mb-4">Crea tu primera campaña para comenzar</p>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-950">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {campaigns.map((campaign) => {
              const statusInfo = statusConfig[campaign.status];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={campaign.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-gray-900/20 cursor-pointer"
                  onClick={() => console.log("Select campaign:", campaign.id)}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate mb-1">
                        {campaign.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2">
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
                        {campaign.status === "draft" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendCampaign(campaign.id);
                            }}
                            className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Enviar
                          </DropdownMenuItem>
                        )}
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
                        {campaign.status === "scheduled" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelCampaign(campaign.id);
                            }}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
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
                  <div className="mb-3">
                    <Badge className={cn("text-xs border", statusInfo.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Channels */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Canales:</p>
                    <div className="flex flex-wrap gap-1">
                      {campaign.channels.map((channel) => {
                        const ChannelIcon = channelIcons[channel];
                        return (
                          <div
                            key={channel}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded border text-xs",
                              channelColors[channel],
                            )}
                          >
                            <ChannelIcon className="h-3 w-3" />
                            <span className="capitalize">{channel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recipients Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Destinatarios:
                      </span>
                      <span className="text-xs text-white font-medium">
                        {campaign.recipients.sent.toLocaleString()}/
                        {campaign.recipients.total.toLocaleString()}
                      </span>
                    </div>
                    {campaign.recipients.total > 0 && (
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-400 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (campaign.recipients.sent /
                                campaign.recipients.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Date Information */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {campaign.scheduledDate ? (
                        <div>
                          <span className="text-blue-400">Programada: </span>
                          <span>{formatDate(campaign.scheduledDate)}</span>
                        </div>
                      ) : (
                        <div>
                          <span>Creada: </span>
                          <span>{formatDate(campaign.createdDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics (if available) */}
                  {campaign.stats && (
                    <div className="mb-3 bg-gray-900/50 rounded p-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Estadísticas:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-green-400 font-medium">
                            {campaign.stats.delivered.toLocaleString()}
                          </p>
                          <p className="text-gray-400">Entregados</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-medium">
                            {campaign.stats.clicked.toLocaleString()}
                          </p>
                          <p className="text-gray-400">Clics</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-medium">
                            {campaign.stats.conversionRate.toFixed(1)}%
                          </p>
                          <p className="text-gray-400">Conversión</p>
                        </div>
                        <div>
                          <p className="text-yellow-400 font-medium">
                            {campaign.stats.csat.toFixed(1)}★
                          </p>
                          <p className="text-gray-400">CSAT</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assignees */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Responsables:
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {campaign.assignees.slice(0, 3).map((assignee) => (
                        <div
                          key={assignee}
                          className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center"
                          title={assignee}
                        >
                          <span className="text-xs text-white font-medium">
                            {assignee
                              .split(" ")
                              .map((n) => n.charAt(0))
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {campaign.assignees.length > 3 && (
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-300">
                            +{campaign.assignees.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {campaign.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {campaign.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {campaign.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{campaign.tags.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {campaign.status === "draft" && (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700 h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendCampaign(campaign.id);
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Enviar
                          </Button>
                        )}
                        {campaign.stats && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 px-2 text-xs"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Stats
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCampaign(campaign);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-blue-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateCampaign(campaign.id);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
