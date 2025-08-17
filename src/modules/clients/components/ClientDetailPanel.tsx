import React, { useState } from 'react';
import { 
  X, 
  MoreVertical, 
  User,
  Activity,
  Briefcase,
  Brain
} from 'lucide-react';
import type { Client } from '../../../types/client';
import { 
  ClientProfileTab, 
  ClientActivityTab, 
  ClientDealsTab, 
  ClientAITab 
} from './tabs';

interface ClientDetailPanelProps {
  client: Client;
  onClose: () => void;
  onUpdate: (updates: Partial<Client>) => void;
}

type TabType = 'perfil' | 'actividad' | 'deals' | 'ia';

export const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({
  client,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'actividad', label: 'Actividad', icon: Activity },
    { id: 'deals', label: 'Deals', icon: Briefcase },
    { id: 'ia', label: 'IA', icon: Brain }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <ClientProfileTab client={client} onUpdate={onUpdate} />;
      case 'actividad':
        return <ClientActivityTab client={client} />;
      case 'deals':
        return <ClientDealsTab client={client} />;
      case 'ia':
        return <ClientAITab client={client} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle del Cliente
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdate({})}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Información del cliente */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium">
              {client.initials}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{client.name}</h4>
            <p className="text-sm text-gray-500">{client.company}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
            <p className="text-xs text-gray-500 mt-1">Score: {client.score}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido del tab */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {renderTabContent()}
      </div>
    </div>
  );
}; 