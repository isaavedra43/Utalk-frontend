import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Campaign, CampaignFormData } from "@/types/api";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import { Loader2 } from "lucide-react";

interface CampaignFormProps {
  campaign: Campaign | null;
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
}

export function CampaignForm({ campaign, mode, isOpen, onClose, onSave }: CampaignFormProps) {
  const [formData, setFormData] = useState<Partial<CampaignFormData>>({});
  
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

  useEffect(() => {
    if (mode === 'edit' && campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        channels: campaign.channels,
        tags: campaign.tags,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        channels: [],
        tags: []
      });
    }
  }, [campaign, mode, isOpen]);

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (mode === 'create') {
      createCampaignMutation.mutate(formData as CampaignFormData, {
        onSuccess: (newCampaign) => {
          onSave(newCampaign);
          onClose();
        }
      });
    } else if (campaign) {
      updateCampaignMutation.mutate({ campaignId: campaign.id, data: formData }, {
        onSuccess: (updatedCampaign) => {
          onSave(updatedCampaign);
          onClose();
        }
      });
    }
  };
  
  const isLoading = createCampaignMutation.isLoading || updateCampaignMutation.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Crear Nueva Campaña' : 'Editar Campaña'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
                <label>Nombre de la Campaña</label>
                <Input value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
            </div>
            <div>
                <label>Descripción</label>
                <Textarea value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
            </div>
             <div>
                <label>Canales</label>
                {/* Aquí iría un selector de canales múltiple */}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
