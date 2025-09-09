import React, { useState } from 'react';
import { 
  Plus, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Bot,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Globe,
  Mail,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { CampaignDashboard } from './components/CampaignDashboard';
import { CampaignBuilder } from './components/CampaignBuilder';
import { AudienceBuilder } from './components/AudienceBuilder';
import { TemplateManager } from './components/TemplateManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { JourneyBuilder } from './components/JourneyBuilder';
import { CopilotPanel } from './components/CopilotPanel';
import { CampaignSettings } from './components/CampaignSettings';
import type { Campaign, CampaignChannel, CampaignStatus } from '../../types/campaigns';

const CampaignsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'campaigns', name: 'Campañas', icon: Target },
    { id: 'audiences', name: 'Audiencias', icon: Users },
    { id: 'templates', name: 'Plantillas', icon: FileText },
    { id: 'journeys', name: 'Journeys', icon: Zap },
    { id: 'analytics', name: 'Analítica', icon: TrendingUp },
    { id: 'copilot', name: 'Copiloto', icon: Bot },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CampaignDashboard onSelectCampaign={setSelectedCampaign} />;
      case 'campaigns':
        return <CampaignBuilder campaign={selectedCampaign} onSave={setSelectedCampaign} />;
      case 'audiences':
        return <AudienceBuilder />;
      case 'templates':
        return <TemplateManager />;
      case 'journeys':
        return <JourneyBuilder />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'copilot':
        return <CopilotPanel />;
      case 'settings':
        return <CampaignSettings />;
      default:
        return <CampaignDashboard onSelectCampaign={setSelectedCampaign} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar izquierdo */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Campañas</h1>
              <p className="text-sm text-gray-500">Omnicanal</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Acciones rápidas */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header superior */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              {activeTab === 'campaigns' && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">3 activas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">2 programadas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">5 borradores</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Filtros rápidos */}
              {activeTab === 'dashboard' && (
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Filtros</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Últimos 30 días</span>
                  </button>
                </div>
              )}

              {/* Búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Botón de copiloto */}
              <button
                onClick={() => setLeftPanelOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Bot className="h-4 w-4" />
                <span>Copiloto IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Panel izquierdo del Copiloto */}
      {leftPanelOpen && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Copiloto IA</h2>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <CopilotPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsModule;