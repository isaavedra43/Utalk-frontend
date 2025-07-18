import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignListViewProps {
  campaigns: Campaign[];
  onEditCampaign: (campaign: Campaign) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onSendCampaign: (campaignId: string) => void;
  onCancelCampaign: (campaignId: string) => void;
}

const statusConfig = {
  draft: { label: "Borrador", color: "bg-gray-600 text-white" },
  scheduled: { label: "Programada", color: "bg-blue-600 text-white" },
  sent: { label: "Enviada", color: "bg-green-600 text-white" },
  cancelled: { label: "Cancelada", color: "bg-red-600 text-white" },
};

const channelIcons = {
  whatsapp: MessageCircle,
  facebook: MessageSquare,
  sms: Smartphone,
  email: Mail,
};

const channelColors = {
  whatsapp: "text-green-400",
  facebook: "text-blue-400",
  sms: "text-blue-400",
  email: "text-blue-500",
};

export function CampaignListView({
  campaigns,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onSendCampaign,
  onCancelCampaign,
}: CampaignListViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="text-gray-300">Nombre</TableHead>
                <TableHead className="text-gray-300">Estado</TableHead>
                <TableHead className="text-gray-300">Canales</TableHead>
                <TableHead className="text-gray-300">Enviados/Total</TableHead>
                <TableHead className="text-gray-300">Fecha</TableHead>
                <TableHead className="text-gray-300">Responsables</TableHead>
                <TableHead className="text-gray-300 w-[50px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const statusInfo = statusConfig[campaign.status];

                return (
                  <TableRow
                    key={campaign.id}
                    className="border-gray-800 hover:bg-gray-900/30 cursor-pointer"
                    onClick={() => console.log("Select campaign:", campaign.id)}
                  >
                    {/* Name */}
                    <TableCell>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {campaign.description}
                        </p>
                        {campaign.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
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
                                +{campaign.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={cn("text-xs", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    {/* Channels */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {campaign.channels.map((channel) => {
                          const ChannelIcon = channelIcons[channel];
                          return (
                            <div
                              key={channel}
                              className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1"
                            >
                              <ChannelIcon
                                className={cn(
                                  "h-3 w-3",
                                  channelColors[channel],
                                )}
                              />
                              <span className="text-xs text-gray-300 capitalize">
                                {channel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Recipients */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {campaign.recipients.sent.toLocaleString()}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-300">
                            {campaign.recipients.total.toLocaleString()}
                          </span>
                        </div>
                        {campaign.recipients.total > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-green-400 h-1 rounded-full transition-all"
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
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="text-xs">
                        {campaign.scheduledDate ? (
                          <div>
                            <p className="text-blue-400 font-medium">
                              Programada
                            </p>
                            <p className="text-gray-400">
                              {formatDate(campaign.scheduledDate)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-400">Creada</p>
                            <p className="text-gray-300">
                              {formatDate(campaign.createdDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Assignees */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {campaign.assignees.slice(0, 2).map((assignee) => (
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
                        {campaign.assignees.length > 2 && (
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-300">
                              +{campaign.assignees.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
