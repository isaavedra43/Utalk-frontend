import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  channel: "whatsapp" | "email" | "sms" | "facebook";
  totalChats: number;
  avgResponseTime: string;
  purchaseValue: number;
  status: "active" | "inactive";
}

interface TopClientsTableProps {
  clients: Client[];
  title: string;
}

type SortField = "name" | "totalChats" | "avgResponseTime" | "purchaseValue";
type SortDirection = "asc" | "desc";

const channelIcons = {
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  email: Mail,
  sms: Phone,
};

const channelColors = {
  whatsapp: "text-green-400 bg-green-900/20 border-green-500/30",
  facebook: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  email: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  sms: "text-blue-400 bg-blue-900/20 border-blue-500/30",
};

const channelNames = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  email: "Email",
  sms: "SMS",
};

export function TopClientsTable({ clients, title }: TopClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("purchaseValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Filter and sort clients
  const getFilteredAndSortedClients = () => {
    let filtered = clients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "totalChats":
          aValue = a.totalChats;
          bValue = b.totalChats;
          break;
        case "avgResponseTime":
          // Convert time to minutes for sorting
          aValue = parseInt(a.avgResponseTime.split(":")[1]);
          bValue = parseInt(b.avgResponseTime.split(":")[1]);
          break;
        case "purchaseValue":
          aValue = a.purchaseValue;
          bValue = b.purchaseValue;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-400" />
    );
  };

  const filteredClients = getFilteredAndSortedClients();
  const activeCount = clients.filter((c) => c.status === "active").length;
  const inactiveCount = clients.filter((c) => c.status === "inactive").length;

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            {title}
            <Badge className="bg-gray-700 text-gray-300 text-xs">
              {filteredClients.length} de {clients.length}
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white text-xs">
              {activeCount} activos
            </Badge>
            <Badge className="bg-red-600 text-white text-xs">
              {inactiveCount} inactivos
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 h-8"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-900/50 rounded-lg p-1">
            {["all", "active", "inactive"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "ghost"}
                onClick={() => setStatusFilter(status as any)}
                className={cn(
                  "h-6 px-2 text-xs",
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                {status === "all"
                  ? "Todos"
                  : status === "active"
                    ? "Activos"
                    : "Inactivos"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredClients.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">
              No se encontraron clientes
            </p>
            <p className="text-xs">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="h-8 px-2 text-gray-300 hover:text-white"
                    >
                      Cliente
                      <SortIcon field="name" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px]">Canal</TableHead>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalChats")}
                      className="h-8 px-2 text-gray-300 hover:text-white"
                    >
                      Chats
                      <SortIcon field="totalChats" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("avgResponseTime")}
                      className="h-8 px-2 text-gray-300 hover:text-white"
                    >
                      Tiempo Resp.
                      <SortIcon field="avgResponseTime" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("purchaseValue")}
                      className="h-8 px-2 text-gray-300 hover:text-white"
                    >
                      Valor Compras
                      <SortIcon field="purchaseValue" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => {
                  const ChannelIcon = channelIcons[client.channel];
                  const isTopPerformer = index < 3;

                  return (
                    <TableRow
                      key={client.id}
                      className="border-gray-700 hover:bg-gray-800/30 cursor-pointer"
                      onClick={() => console.log(`View client: ${client.name}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {isTopPerformer && (
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                              {index + 1}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              #{client.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border text-xs",
                            channelColors[client.channel],
                          )}
                        >
                          <ChannelIcon className="h-3 w-3 mr-1" />
                          {channelNames[client.channel]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-white font-medium">
                          {client.totalChats}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-300">
                          {client.avgResponseTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400 font-semibold">
                          ${client.purchaseValue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {client.status === "active" ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-medium",
                              client.status === "active"
                                ? "text-green-400"
                                : "text-red-400",
                            )}
                          >
                            {client.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Table Summary */}
        {filteredClients.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Chats</p>
              <p className="text-lg font-bold text-white">
                {filteredClients.reduce((sum, c) => sum + c.totalChats, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Valor Total</p>
              <p className="text-lg font-bold text-green-400">
                $
                {filteredClients
                  .reduce((sum, c) => sum + c.purchaseValue, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tiempo Promedio</p>
              <p className="text-lg font-bold text-yellow-400">
                {Math.round(
                  filteredClients.reduce((sum, c) => {
                    const [hours, minutes] = c.avgResponseTime.split(":");
                    return sum + parseInt(hours) * 60 + parseInt(minutes);
                  }, 0) /
                    filteredClients.length /
                    60,
                )
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.round(
                  (filteredClients.reduce((sum, c) => {
                    const [hours, minutes] = c.avgResponseTime.split(":");
                    return sum + parseInt(hours) * 60 + parseInt(minutes);
                  }, 0) /
                    filteredClients.length) %
                    60,
                )
                  .toString()
                  .padStart(2, "0")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
