import { useState, useEffect } from "react";
import { SellerList } from "./team/SellerList";
import { SellerDetail } from "./team/SellerDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    admin: boolean;
  };
  kpis: {
    chatsAttended: number;
    messagesResponded: number;
    avgResponseTime: string;
    chatsClosedWithoutEscalation: number;
    conversionRate: number;
    attributableRevenue: number;
    avgTicketValue: number;
    customerRetentionRate: number;
    csatScore: number;
    npsScore: number;
    campaignsSent: number;
    messageOpenRate: number;
    linkClickRate: number;
    positiveResponses: number;
    complaints: number;
    continuityPercentage: number;
    totalChatTime: string;
    firstTimeResolution: number;
    upsellCrosssellRate: number;
    aiQualityScore: number;
  };
  trends: {
    chatsVsSales: number[];
    responseTime: number[];
    channelDistribution: { channel: string; percentage: number }[];
  };
}

// Mock data for sellers
const mockSellers: Seller[] = [
  {
    id: "1",
    name: "María García López",
    email: "maria.garcia@company.com",
    role: "Ejecutivo WhatsApp Senior",
    status: "active",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets%2F2d1f4aff150c46d2aa10d890d5bc0fca%2Fac493c187ef4459383661e17488cac3a?format=webp&width=800",
    permissions: {
      read: true,
      write: true,
      approve: false,
      admin: false,
    },
    kpis: {
      chatsAttended: 145,
      messagesResponded: 892,
      avgResponseTime: "02:15",
      chatsClosedWithoutEscalation: 134,
      conversionRate: 23.5,
      attributableRevenue: 45600,
      avgTicketValue: 1250,
      customerRetentionRate: 87.3,
      csatScore: 4.6,
      npsScore: 72,
      campaignsSent: 28,
      messageOpenRate: 94.2,
      linkClickRate: 18.7,
      positiveResponses: 156,
      complaints: 3,
      continuityPercentage: 91.4,
      totalChatTime: "34:25",
      firstTimeResolution: 78.9,
      upsellCrosssellRate: 15.2,
      aiQualityScore: 4.5,
    },
    trends: {
      chatsVsSales: [12, 15, 18, 22, 19, 25, 20],
      responseTime: [125, 135, 120, 140, 130, 145, 135],
      channelDistribution: [
        { channel: "WhatsApp", percentage: 65 },
        { channel: "SMS", percentage: 20 },
        { channel: "Email", percentage: 15 },
      ],
    },
  },
  {
    id: "2",
    name: "Carlos López Hernández",
    email: "carlos.lopez@company.com",
    role: "Supervisor de Ventas",
    status: "active",
    permissions: {
      read: true,
      write: true,
      approve: true,
      admin: false,
    },
    kpis: {
      chatsAttended: 98,
      messagesResponded: 567,
      avgResponseTime: "01:45",
      chatsClosedWithoutEscalation: 89,
      conversionRate: 28.1,
      attributableRevenue: 52300,
      avgTicketValue: 1580,
      customerRetentionRate: 92.1,
      csatScore: 4.8,
      npsScore: 78,
      campaignsSent: 22,
      messageOpenRate: 96.5,
      linkClickRate: 22.3,
      positiveResponses: 134,
      complaints: 1,
      continuityPercentage: 94.7,
      totalChatTime: "28:15",
      firstTimeResolution: 85.6,
      upsellCrosssellRate: 19.8,
      aiQualityScore: 4.7,
    },
    trends: {
      chatsVsSales: [8, 12, 14, 16, 15, 18, 16],
      responseTime: [95, 105, 100, 110, 105, 115, 105],
      channelDistribution: [
        { channel: "WhatsApp", percentage: 45 },
        { channel: "SMS", percentage: 30 },
        { channel: "Email", percentage: 25 },
      ],
    },
  },
  {
    id: "3",
    name: "Ana Morales Ruiz",
    email: "ana.morales@company.com",
    role: "Ejecutivo Email Marketing",
    status: "active",
    permissions: {
      read: true,
      write: true,
      approve: false,
      admin: false,
    },
    kpis: {
      chatsAttended: 87,
      messagesResponded: 445,
      avgResponseTime: "03:20",
      chatsClosedWithoutEscalation: 78,
      conversionRate: 19.7,
      attributableRevenue: 32100,
      avgTicketValue: 890,
      customerRetentionRate: 82.5,
      csatScore: 4.3,
      npsScore: 65,
      campaignsSent: 35,
      messageOpenRate: 88.9,
      linkClickRate: 15.4,
      positiveResponses: 98,
      complaints: 5,
      continuityPercentage: 86.2,
      totalChatTime: "22:40",
      firstTimeResolution: 71.3,
      upsellCrosssellRate: 12.4,
      aiQualityScore: 4.2,
    },
    trends: {
      chatsVsSales: [6, 9, 11, 13, 12, 14, 13],
      responseTime: [180, 200, 190, 210, 200, 220, 200],
      channelDistribution: [
        { channel: "Email", percentage: 70 },
        { channel: "WhatsApp", percentage: 20 },
        { channel: "SMS", percentage: 10 },
      ],
    },
  },
  {
    id: "4",
    name: "Luis Hernández Torres",
    email: "luis.hernandez@company.com",
    role: "Ejecutivo SMS",
    status: "inactive",
    permissions: {
      read: true,
      write: false,
      approve: false,
      admin: false,
    },
    kpis: {
      chatsAttended: 45,
      messagesResponded: 234,
      avgResponseTime: "04:15",
      chatsClosedWithoutEscalation: 38,
      conversionRate: 14.2,
      attributableRevenue: 18900,
      avgTicketValue: 720,
      customerRetentionRate: 75.8,
      csatScore: 3.9,
      npsScore: 58,
      campaignsSent: 15,
      messageOpenRate: 82.1,
      linkClickRate: 11.2,
      positiveResponses: 52,
      complaints: 8,
      continuityPercentage: 78.9,
      totalChatTime: "15:30",
      firstTimeResolution: 65.4,
      upsellCrosssellRate: 8.7,
      aiQualityScore: 3.8,
    },
    trends: {
      chatsVsSales: [3, 5, 6, 7, 6, 8, 7],
      responseTime: [230, 255, 240, 270, 250, 285, 255],
      channelDistribution: [
        { channel: "SMS", percentage: 80 },
        { channel: "WhatsApp", percentage: 15 },
        { channel: "Email", percentage: 5 },
      ],
    },
  },
];

interface EquipoPerformanceProps {
  className?: string;
}

export function EquipoPerformance({ className }: EquipoPerformanceProps) {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(
    mockSellers[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh KPIs every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        setLastUpdate(new Date());
      },
      2 * 60 * 1000,
    ); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Filter sellers based on search and status
  const getFilteredSellers = () => {
    let filtered = mockSellers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (seller) =>
          seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((seller) => seller.status === statusFilter);
    }

    return filtered;
  };

  const handleSellerSelect = (seller: Seller) => {
    setSelectedSeller(seller);
    console.log(`Selected seller: ${seller.name}`);
  };

  const handleCreateSeller = () => {
    console.log("Creating new seller...");
    // TODO: Open modal for creating seller
  };

  const handleEditSeller = (sellerId: string) => {
    console.log(`Editing seller: ${sellerId}`);
    // TODO: Open edit modal
  };

  const handleDeactivateSeller = (sellerId: string) => {
    console.log(`Deactivating seller: ${sellerId}`);
    // TODO: Show confirmation and deactivate
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  const filteredSellers = getFilteredSellers();
  const activeCount = mockSellers.filter((s) => s.status === "active").length;
  const inactiveCount = mockSellers.filter(
    (s) => s.status === "inactive",
  ).length;

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden", className)}>
      {/* Module Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-0 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Equipo & Performance
              </h1>
              <p className="text-sm text-gray-400">
                Gestiona tu equipo de ventas y analiza su rendimiento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white text-xs">
                {activeCount} activos
              </Badge>
              <Badge className="bg-red-600 text-white text-xs">
                {inactiveCount} inactivos
              </Badge>
            </div>
            <Button
              onClick={handleCreateSeller}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Vendedor
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, rol o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 ml-4">
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {["all", "active", "inactive"].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? "default" : "ghost"}
                  onClick={() => setStatusFilter(status as any)}
                  className={cn(
                    "h-8 px-3",
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

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Última actualización: {lastUpdate.toLocaleTimeString()} |{" "}
          {filteredSellers.length} de {mockSellers.length} vendedores
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex h-[calc(100%-140px)] overflow-hidden">
        {/* Left Column (1/3) - Sellers List */}
        <div className="w-1/3 min-w-[350px] border-r border-gray-800">
          <SellerList
            sellers={filteredSellers}
            selectedSeller={selectedSeller}
            onSellerSelect={handleSellerSelect}
            onEditSeller={handleEditSeller}
            onDeactivateSeller={handleDeactivateSeller}
          />
        </div>

        {/* Right Column (2/3) - Seller Detail */}
        <div className="flex-1">
          {selectedSeller ? (
            <SellerDetail
              seller={selectedSeller}
              onEditProfile={() => handleEditSeller(selectedSeller.id)}
              onReassignPermissions={() => console.log("Reassign permissions")}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-950">
              <div className="text-center text-gray-400 p-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Selecciona un vendedor
                </h3>
                <p className="text-sm">
                  Elige un vendedor de la lista para ver su información
                  detallada y KPIs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
