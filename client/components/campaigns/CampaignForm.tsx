import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Users,
  MessageSquare,
  Calendar,
  X,
  Save,
  Send,
  Upload,
  Plus,
  Trash2,
  Bot,
  Clock,
  Globe,
  Target,
  Tag,
  Bell,
  Archive,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignFormProps {
  campaign: Campaign | null;
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function CampaignForm({
  campaign,
  mode,
  isOpen,
  onClose,
  onSave,
}: CampaignFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    // General
    name: campaign?.name || "",
    description: campaign?.description || "",
    channels: campaign?.channels || [],

    // Recipients
    segment: "",
    includeList: [],
    excludeList: [],

    // Message
    template: "",
    messageBody: "",
    attachments: [],
    ctaButtons: [],

    // Scheduling & Advanced
    sendImmediate: true,
    scheduledDate: "",
    isRecurring: false,
    timezone: "America/Mexico_City",
    sendRate: 100,
    retryPolicy: "exponential",
    fallbackChannel: "",
    requireApproval: false,
    abTesting: false,
    abVariants: 2,
    aiOptimizeTime: false,
    utmParams: {
      source: "",
      medium: "",
      campaign: "",
    },
    tags: campaign?.tags || [],
    assignees: campaign?.assignees || [],
    errorNotifications: true,
    completionNotifications: true,
    autoArchive: false,
    voiceBroadcast: false,
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    console.log(`${key} changed to:`, value);
  };

  const handleNestedChange = (parent: string, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [key]: value,
      },
    }));
    console.log(`${parent}.${key} changed to:`, value);
  };

  const handleChannelToggle = (channel: string) => {
    const newChannels = formData.channels.includes(channel as any)
      ? formData.channels.filter((c) => c !== channel)
      : [...formData.channels, channel as any];
    handleInputChange("channels", newChannels);
  };

  const handleSave = () => {
    console.log("saveCampaign - Saving campaign data:", formData);
    onSave(formData);
  };

  const handleSend = () => {
    console.log("sendCampaign - Sending campaign:", formData);
    onSave({ ...formData, status: "scheduled" });
  };

  const addCTAButton = () => {
    const newButton = { label: "", url: "", style: "primary" };
    handleInputChange("ctaButtons", [...formData.ctaButtons, newButton]);
  };

  const removeCTAButton = (index: number) => {
    const newButtons = formData.ctaButtons.filter((_, i) => i !== index);
    handleInputChange("ctaButtons", newButtons);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange("tags", [...formData.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((t) => t !== tag),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              {mode === "create" ? "Nueva Campaña" : "Editar Campaña"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-900">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="recipients"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Destinatarios
              </TabsTrigger>
              <TabsTrigger
                value="message"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensaje
              </TabsTrigger>
              <TabsTrigger
                value="scheduling"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Programación
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(90vh-200px)] overflow-y-auto">
              {/* Tab 1: General */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Nombre de la Campaña *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ej: Black Friday 2024"
                      className="bg-gray-900 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Descripción Interna
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe el objetivo y contexto de esta campaña..."
                      className="bg-gray-900 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">
                      Canales de Envío *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "whatsapp", label: "WhatsApp", color: "green" },
                        { id: "facebook", label: "Facebook", color: "blue" },
                        { id: "sms", label: "SMS", color: "purple" },
                        { id: "email", label: "Email", color: "blue" },
                      ].map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700"
                        >
                          <Checkbox
                            id={channel.id}
                            checked={formData.channels.includes(
                              channel.id as any,
                            )}
                            onCheckedChange={() =>
                              handleChannelToggle(channel.id)
                            }
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <label
                            htmlFor={channel.id}
                            className="text-white font-medium cursor-pointer"
                          >
                            {channel.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Recipients */}
              <TabsContent value="recipients" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Segmento Base
                    </label>
                    <Select
                      value={formData.segment}
                      onValueChange={(value) =>
                        handleInputChange("segment", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                        <SelectValue placeholder="Seleccionar segmento..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white">
                          Todos los contactos
                        </SelectItem>
                        <SelectItem value="customers" className="text-white">
                          Solo clientes
                        </SelectItem>
                        <SelectItem value="leads" className="text-white">
                          Solo leads
                        </SelectItem>
                        <SelectItem value="active" className="text-white">
                          Contactos activos
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Lista de Inclusión
                    </label>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 min-h-[100px]">
                      <p className="text-gray-400 text-sm">
                        Contactos específicos a incluir (0)
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-gray-600 text-gray-300"
                        onClick={() =>
                          console.log("selectContacts - Opening selector")
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Seleccionar Contactos
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Lista de Exclusión
                    </label>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 min-h-[100px]">
                      <p className="text-gray-400 text-sm">
                        Contactos a excluir de la campaña (0)
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-gray-600 text-gray-300"
                        onClick={() =>
                          console.log("excludeContacts - Opening selector")
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Excluir Contactos
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">
                      Resumen de Destinatarios
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="text-white font-bold text-lg">
                          0
                        </p>
                        <p className="text-gray-400">Total</p>
                      </div>
                      <div>
                        <p className="text-green-400 font-bold text-lg">
                          0
                        </p>
                        <p className="text-gray-400">Incluidos</p>
                      </div>
                      <div>
                        <p className="text-red-400 font-bold text-lg">
                          0
                        </p>
                        <p className="text-gray-400">Excluidos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Message */}
              <TabsContent value="message" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Plantilla Base
                    </label>
                    <Select
                      value={formData.template}
                      onValueChange={(value) =>
                        handleInputChange("template", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                        <SelectValue placeholder="Seleccionar plantilla..." />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="promocional" className="text-white">
                          Plantilla Promocional
                        </SelectItem>
                        <SelectItem value="seguimiento" className="text-white">
                          Plantilla Seguimiento
                        </SelectItem>
                        <SelectItem value="recordatorio" className="text-white">
                          Plantilla Recordatorio
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Cuerpo del Mensaje
                    </label>
                    <Textarea
                      value={formData.messageBody}
                      onChange={(e) =>
                        handleInputChange("messageBody", e.target.value)
                      }
                      placeholder="Hola {firstName}, tenemos una oferta especial para ti... 🎉"
                      className="bg-gray-900 border-gray-600 text-white min-h-[150px]"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Variables disponibles: {"{firstName}"}, {"{lastName}"},
                      {"{company}"}, {"{lastOrder}"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Adjuntos
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Soportado: Imagen, Vídeo, Audio, PDF (0)
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">
                        Botones CTA
                      </label>
                      <Button
                        size="sm"
                        onClick={addCTAButton}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.ctaButtons.map((button, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg"
                        >
                          <Input
                            placeholder="Texto del botón"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          <Input
                            placeholder="URL destino"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCTAButton(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Scheduling & Advanced */}
              <TabsContent value="scheduling" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Scheduling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Programación
                    </h3>

                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.sendImmediate}
                        onCheckedChange={(checked) =>
                          handleInputChange("sendImmediate", checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <label className="text-white">Envío inmediato</label>
                    </div>

                    {!formData.sendImmediate && (
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Fecha y Hora
                        </label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) =>
                            handleInputChange("scheduledDate", e.target.value)
                          }
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Zona Horaria
                      </label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) =>
                          handleInputChange("timezone", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem
                            value="America/Mexico_City"
                            className="text-white"
                          >
                            México (GMT-6)
                          </SelectItem>
                          <SelectItem
                            value="America/New_York"
                            className="text-white"
                          >
                            Nueva York (GMT-5)
                          </SelectItem>
                          <SelectItem
                            value="Europe/Madrid"
                            className="text-white"
                          >
                            Madrid (GMT+1)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Configuración Avanzada
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Velocidad de Envío (msg/min)
                      </label>
                      <Input
                        type="number"
                        value={formData.sendRate}
                        onChange={(e) =>
                          handleInputChange("sendRate", Number(e.target.value))
                        }
                        className="bg-gray-900 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Política de Reintentos
                      </label>
                      <Select
                        value={formData.retryPolicy}
                        onValueChange={(value) =>
                          handleInputChange("retryPolicy", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="immediate" className="text-white">
                            Inmediato
                          </SelectItem>
                          <SelectItem
                            value="exponential"
                            className="text-white"
                          >
                            Exponencial
                          </SelectItem>
                          <SelectItem value="manual" className="text-white">
                            Manual
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          key: "requireApproval",
                          label: "Flujo de aprobación",
                          icon: Target,
                        },
                        {
                          key: "abTesting",
                          label: "A/B Testing",
                          icon: Bot,
                        },
                        {
                          key: "aiOptimizeTime",
                          label: "Optimización IA de hora",
                          icon: Clock,
                        },
                        {
                          key: "errorNotifications",
                          label: "Notificaciones de error",
                          icon: Bell,
                        },
                        {
                          key: "autoArchive",
                          label: "Auto-archivar tras envío",
                          icon: Archive,
                        },
                        {
                          key: "voiceBroadcast",
                          label: "Voice broadcast",
                          icon: Mic,
                        },
                      ].map((setting) => {
                        const Icon = setting.icon;
                        return (
                          <div
                            key={setting.key}
                            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-blue-400" />
                              <span className="text-white text-sm">
                                {setting.label}
                              </span>
                            </div>
                            <Switch
                              checked={
                                formData[setting.key as keyof typeof formData]
                              }
                              onCheckedChange={(checked) =>
                                handleInputChange(setting.key, checked)
                              }
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* UTM Parameters */}
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">
                    Parámetros UTM
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Source
                      </label>
                      <Input
                        value={formData.utmParams.source}
                        onChange={(e) =>
                          handleNestedChange(
                            "utmParams",
                            "source",
                            e.target.value,
                          )
                        }
                        placeholder="campaign"
                        className="bg-gray-900 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Medium
                      </label>
                      <Input
                        value={formData.utmParams.medium}
                        onChange={(e) =>
                          handleNestedChange(
                            "utmParams",
                            "medium",
                            e.target.value,
                          )
                        }
                        placeholder="whatsapp"
                        className="bg-gray-900 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Campaign
                      </label>
                      <Input
                        value={formData.utmParams.campaign}
                        onChange={(e) =>
                          handleNestedChange(
                            "utmParams",
                            "campaign",
                            e.target.value,
                          )
                        }
                        placeholder="blackfriday2024"
                        className="bg-gray-900 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-blue-600 text-white flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-blue-700 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nueva etiqueta..."
                      className="bg-gray-900 border-gray-600 text-white flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
                                  onClick={() => console.log("exportRecipients")}
              className="border-gray-600 text-gray-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              Exportar Lista
            </Button>
            <Button
              variant="outline"
                                  onClick={() => console.log("previewCampaign")}
              className="border-gray-600 text-gray-300"
            >
              Vista Previa
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button
              onClick={handleSend}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {formData.sendImmediate ? "Enviar Ahora" : "Programar Envío"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
