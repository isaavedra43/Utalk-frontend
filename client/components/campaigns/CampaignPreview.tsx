import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  MessageCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignPreviewProps {
  campaign: Campaign;
}

export function CampaignPreview({ campaign }: CampaignPreviewProps) {
  const mockMessage = {
    text: "¡Hola {{firstName}}! 🎉\n\nTenemos una oferta especial solo para ti. Aprovecha nuestro descuento del 30% en todos los productos.\n\n✨ Código: ESPECIAL30\n🕐 Válido hasta el 31 de diciembre\n\n¿Te interesa conocer más detalles?",
    attachments: [
      {
        type: "image",
        url: "https://via.placeholder.com/300x200/6366f1/white?text=Oferta+Especial",
        name: "oferta-especial.jpg",
      },
    ],
    ctaButtons: [
      { label: "Ver Ofertas", url: "https://tienda.com/ofertas" },
      { label: "Contactar", url: "https://wa.me/123456789" },
    ],
  };

  const WhatsAppPreview = () => (
    <div className="bg-gray-800 rounded-lg p-4 max-w-sm mx-auto">
      {/* WhatsApp Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">Tu Empresa</p>
          <p className="text-green-400 text-xs">En línea</p>
        </div>
      </div>

      {/* Message Bubble */}
      <div className="bg-green-600 rounded-lg p-3 mb-3 ml-8">
        {/* Image Attachment */}
        {mockMessage.attachments.map((attachment, index) => (
          <div key={index} className="mb-3">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full rounded-lg"
            />
          </div>
        ))}

        {/* Message Text */}
        <p className="text-white text-sm whitespace-pre-line">
          {mockMessage.text.replace("{{firstName}}", "María")}
        </p>

        {/* CTA Buttons */}
        {mockMessage.ctaButtons.length > 0 && (
          <div className="mt-3 space-y-2">
            {mockMessage.ctaButtons.map((button, index) => (
              <button
                key={index}
                className="w-full bg-white text-green-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-green-200 mt-2 text-right">12:34 ✓✓</p>
      </div>
    </div>
  );

  const EmailPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Email Header */}
      <div className="bg-gray-100 px-4 py-3 border-b">
        <div className="text-sm text-gray-600 mb-1">De: Tu Empresa</div>
        <div className="font-semibold text-gray-900">
          Oferta Especial - 30% de Descuento
        </div>
        <div className="text-xs text-gray-500">Para: maria@ejemplo.com</div>
      </div>

      {/* Email Body */}
      <div className="p-4">
        {/* Image */}
        {mockMessage.attachments.map((attachment, index) => (
          <div key={index} className="mb-4">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full rounded-lg"
            />
          </div>
        ))}

        {/* Content */}
        <div className="prose prose-sm">
          <p className="text-gray-900 whitespace-pre-line">
            {mockMessage.text.replace("{{firstName}}", "María")}
          </p>
        </div>

        {/* CTA Buttons */}
        {mockMessage.ctaButtons.length > 0 && (
          <div className="mt-6 space-y-3">
            {mockMessage.ctaButtons.map((button, index) => (
              <button
                key={index}
                className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-blue-700 transition-colors"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          Este email fue enviado por Tu Empresa
        </div>
      </div>
    </div>
  );

  const SMSPreview = () => (
    <div className="bg-gray-800 rounded-lg p-4 max-w-sm mx-auto">
      {/* SMS Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">SMS</p>
          <p className="text-purple-400 text-xs">+52 555 123 4567</p>
        </div>
      </div>

      {/* SMS Bubble */}
      <div className="bg-purple-600 rounded-lg p-3">
        <p className="text-white text-sm whitespace-pre-line">
          {mockMessage.text.replace("{{firstName}}", "María").substring(0, 160)}
          ...
        </p>
        <p className="text-xs text-purple-200 mt-2 text-right">12:34</p>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        SMS limitado a 160 caracteres
      </p>
    </div>
  );

  const FacebookPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Facebook Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Tu Empresa</p>
          <p className="text-xs text-gray-500">Messenger</p>
        </div>
      </div>

      {/* Message */}
      <div className="p-4">
        {/* Image */}
        {mockMessage.attachments.map((attachment, index) => (
          <div key={index} className="mb-3">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full rounded-lg"
            />
          </div>
        ))}

        {/* Text */}
        <div className="bg-blue-600 text-white rounded-lg p-3 mb-3">
          <p className="text-sm whitespace-pre-line">
            {mockMessage.text.replace("{{firstName}}", "María")}
          </p>
        </div>

        {/* Quick Replies */}
        {mockMessage.ctaButtons.length > 0 && (
          <div className="space-y-2">
            {mockMessage.ctaButtons.map((button, index) => (
              <button
                key={index}
                className="w-full border border-blue-600 text-blue-600 rounded-full py-2 px-4 text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-950 flex flex-col">
      {/* Preview Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-400" />
            Vista Previa
          </h3>
          <Button
            size="sm"
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => console.log("{{editMessage}}")}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          Cómo se verá tu mensaje en cada canal
        </p>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="whatsapp" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 m-4">
            {campaign.channels.map((channel) => {
              const channelConfig = {
                whatsapp: { label: "WhatsApp", icon: MessageCircle },
                email: { label: "Email", icon: Mail },
                sms: { label: "SMS", icon: Smartphone },
                facebook: { label: "Facebook", icon: MessageSquare },
              };

              const config = channelConfig[channel];
              const Icon = config.icon;

              return (
                <TabsTrigger
                  key={channel}
                  value={channel}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full px-4 pb-4">
              <TabsContent value="whatsapp" className="mt-0">
                <WhatsAppPreview />
              </TabsContent>
              <TabsContent value="email" className="mt-0">
                <EmailPreview />
              </TabsContent>
              <TabsContent value="sms" className="mt-0">
                <SMSPreview />
              </TabsContent>
              <TabsContent value="facebook" className="mt-0">
                <FacebookPreview />
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </div>

      {/* Preview Actions */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Vista previa con datos de ejemplo
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={() => console.log("{{sendTestMessage}}")}
            >
              Enviar Prueba
            </Button>
            <Button
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => console.log("{{sendCampaign}}")}
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar Campaña
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
