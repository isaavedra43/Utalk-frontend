import type { Seller } from "@/types/api";
import { SellerCard } from "./SellerCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SellerListProps {
  sellers: Seller[];
  selectedSeller: Seller | null;
  onSelectSeller: (seller: Seller) => void;
}

export function SellerList({
  sellers,
  selectedSeller,
  onSelectSeller,
}: SellerListProps) {
  const handleEditSeller = (sellerId: string) => {
    console.log("Editing seller:", sellerId);
    // Lógica para abrir modal de edición
  };

  const handleDeactivateSeller = (sellerId: string) => {
    console.log("Deactivating seller:", sellerId);
    // Lógica para desactivar/activar vendedor
  };

  return (
    <ScrollArea className="flex-1 -mx-4">
        <div className="px-4 space-y-2">
            {sellers.map((seller) => (
                <SellerCard
                    key={seller.id}
                    seller={seller}
                    isSelected={selectedSeller?.id === seller.id}
                    onSelect={() => onSelectSeller(seller)}
                    onEdit={() => handleEditSeller(seller.id)}
                    onDeactivate={() => handleDeactivateSeller(seller.id)}
                />
            ))}
        </div>
    </ScrollArea>
  );
}
