import { ScrollArea } from "@/components/ui/scroll-area";
import { SellerCard } from "./SellerCard";
import { Users } from "lucide-react";
import type { Seller } from "../EquipoPerformance";

interface SellerListProps {
  sellers: Seller[];
  selectedSeller: Seller | null;
  onSellerSelect: (seller: Seller) => void;
  onEditSeller: (sellerId: string) => void;
  onDeactivateSeller: (sellerId: string) => void;
}

export function SellerList({
  sellers,
  selectedSeller,
  onSellerSelect,
  onEditSeller,
  onDeactivateSeller,
}: SellerListProps) {
  if (sellers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-950 p-8">
        <div className="text-center text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay vendedores</h3>
          <p className="text-sm">
            No se encontraron vendedores que coincidan con los filtros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-950">
      {/* List Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Lista de Vendedores
          </h2>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {sellers.length}
          </span>
        </div>
      </div>

      {/* Scrollable Seller Cards */}
      <ScrollArea className="h-[calc(100%-73px)]">
        <div className="p-3 space-y-3">
          {sellers.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              isSelected={selectedSeller?.id === seller.id}
              onSelect={() => onSellerSelect(seller)}
              onEdit={() => onEditSeller(seller.id)}
              onDeactivate={() => onDeactivateSeller(seller.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
