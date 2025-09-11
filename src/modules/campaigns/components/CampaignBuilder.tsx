import React from 'react';
import { Target, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import type { Campaign } from '../../../types/campaigns';

interface CampaignBuilderProps {
  campaign?: Campaign | null;
  onSave: (campaign: Campaign) => void;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ campaign, onSave }) => {
  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8 lg:py-12">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Constructor de Campañas</h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
            Crea campañas omnicanal con editor visual, pruebas A/B y optimización automática
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <Mail className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm lg:text-base">Email</h3>
              <p className="text-xs lg:text-sm text-gray-600">Campañas por correo</p>
            </div>
            
            <div className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm lg:text-base">SMS</h3>
              <p className="text-xs lg:text-sm text-gray-600">Mensajes de texto</p>
            </div>
            
            <div className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <Smartphone className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm lg:text-base">WhatsApp</h3>
              <p className="text-xs lg:text-sm text-gray-600">Mensajes WhatsApp</p>
            </div>
            
            <div className="p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
              <Globe className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm lg:text-base">Multicanal</h3>
              <p className="text-xs lg:text-sm text-gray-600">Todos los canales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
