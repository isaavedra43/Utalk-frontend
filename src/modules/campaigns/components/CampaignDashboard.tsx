import React, { useState } from 'react';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Eye,
  BarChart3,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Download,
  MoreHorizontal
} from 'lucide-react';
import type { Campaign, CampaignChannel, CampaignStatus } from '../../../types/campaigns';

interface CampaignDashboardProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ onSelectCampaign }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [filterChannel, setFilterChannel] = useState<CampaignChannel | 'all'>('all');

  // Datos mock para demostración
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Black Friday 2024',
      description: 'Campaña promocional para Black Friday con descuentos especiales',
      type: 'blast',
      channels: ['email', 'sms', 'whatsapp'],
      status: 'running',
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-22'),
      scheduledAt: new Date('2024-11-24'),
      startedAt: new Date('2024-11-24'),
      budget: 50000,
      pacing: 'daily',
      sendTimeOptimization: true,
      frequencyCapping: { enabled: true, maxPerDay: 2 },
      objectives: { primary: 'conversion', kpis: ['ctr', 'conversion_rate'], targetValue: 5.5 },
      tags: ['promocional', 'black-friday', 'multicanal'],
      createdBy: 'Ana García',
      approvedBy: 'Carlos López',
      approvedAt: new Date('2024-11-23'),
      channelConfig: {
        email: {
          subject: '¡Black Friday! Hasta 70% OFF',
          fromName: 'Tienda Online',
          fromEmail: 'promos@tienda.com',
          templateId: 'black-friday-2024',
          variables: { discount: '70', category: 'electronics' },
          utmParams: { source: 'email', medium: 'campaign', campaign: 'black-friday-2024' },
          tracking: { opens: true, clicks: true, unsubscribes: true }
        }
      },
      metrics: {
        totalRecipients: 50000,
        validRecipients: 48500,
        invalidRecipients: 1500,
        optedOut: 0,
        sent: 48500,
        delivered: 47200,
        failed: 1300,
        bounced: 800,
        opened: 18880,
        clicked: 4720,
        replied: 236,
        unsubscribed: 48,
        conversions: 1180,
        revenue: 118000,
        deliveryRate: 97.3,
        openRate: 40.0,
        clickRate: 10.0,
        replyRate: 0.5,
        conversionRate: 2.5,
        unsubscribeRate: 0.1,
        bounceRate: 1.7,
        totalCost: 2425,
        costPerDelivery: 0.05,
        costPerClick: 0.51,
        costPerConversion: 2.05,
        roi: 4763.9,
        avgTimeToOpen: 2.5,
        avgTimeToClick: 15.2,
        avgTimeToConversion: 45.8,
        channelMetrics: {
          email: {
            sent: 30000, delivered: 29200, opened: 11680, clicked: 2920,
            replied: 146, bounced: 500, failed: 300, unsubscribed: 30,
            conversions: 720, revenue: 72000, cost: 1500
          },
          sms: {
            sent: 10000, delivered: 9800, opened: 4900, clicked: 980,
            replied: 49, bounced: 200, failed: 0, unsubscribed: 10,
            conversions: 245, revenue: 24500, cost: 500
          },
          whatsapp: {
            sent: 8500, delivered: 8200, opened: 2300, clicked: 820,
            replied: 41, bounced: 100, failed: 200, unsubscribed: 8,
            conversions: 215, revenue: 21500, cost: 425
          }
        }
      }
    },
    {
      id: '2',
      name: 'Welcome Series - Nuevos Usuarios',
      description: 'Serie de bienvenida para nuevos usuarios registrados',
      type: 'journey',
      channels: ['email'],
      status: 'running',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-11-20'),
      startedAt: new Date('2024-11-15'),
      budget: 10000,
      pacing: 'asap',
      sendTimeOptimization: true,
      frequencyCapping: { enabled: false },
      objectives: { primary: 'engagement', kpis: ['open_rate', 'click_rate'], targetValue: 25 },
      tags: ['onboarding', 'welcome', 'automated'],
      createdBy: 'María Rodríguez',
      approvedBy: 'Ana García',
      approvedAt: new Date('2024-11-15'),
      channelConfig: {
        email: {
          subject: '¡Bienvenido a nuestra plataforma!',
          fromName: 'Equipo de Soporte',
          fromEmail: 'welcome@tienda.com',
          templateId: 'welcome-series-1',
          variables: { userName: '{{user.name}}' },
          utmParams: { source: 'email', medium: 'onboarding', campaign: 'welcome-series' },
          tracking: { opens: true, clicks: true, unsubscribes: true }
        }
      },
      metrics: {
        totalRecipients: 2500,
        validRecipients: 2500,
        invalidRecipients: 0,
        optedOut: 0,
        sent: 2500,
        delivered: 2475,
        failed: 25,
        bounced: 15,
        opened: 1485,
        clicked: 371,
        replied: 19,
        unsubscribed: 5,
        conversions: 124,
        revenue: 12400,
        deliveryRate: 99.0,
        openRate: 60.0,
        clickRate: 15.0,
        replyRate: 0.8,
        conversionRate: 5.0,
        unsubscribeRate: 0.2,
        bounceRate: 0.6,
        totalCost: 125,
        costPerDelivery: 0.05,
        costPerClick: 0.34,
        costPerConversion: 1.01,
        roi: 9816.0,
        avgTimeToOpen: 1.2,
        avgTimeToClick: 8.5,
        avgTimeToConversion: 25.3,
        channelMetrics: {
          email: {
            sent: 2500, delivered: 2475, opened: 1485, clicked: 371,
            replied: 19, bounced: 15, failed: 25, unsubscribed: 5,
            conversions: 124, revenue: 12400, cost: 125
          }
        }
      }
    },
    {
      id: '3',
      name: 'A/B Test - Subject Lines',
      description: 'Prueba A/B para optimizar líneas de asunto en emails promocionales',
      type: 'ab_test',
      channels: ['email'],
      status: 'running',
      createdAt: new Date('2024-11-18'),
      updatedAt: new Date('2024-11-21'),
      startedAt: new Date('2024-11-21'),
      budget: 15000,
      pacing: 'daily',
      sendTimeOptimization: false,
      frequencyCapping: { enabled: true, maxPerDay: 1 },
      objectives: { primary: 'engagement', kpis: ['open_rate'], targetValue: 35 },
      tags: ['ab-test', 'optimization', 'email'],
      createdBy: 'Luis Martínez',
      approvedBy: 'Carlos López',
      approvedAt: new Date('2024-11-20'),
      abTest: {
        enabled: true,
        variants: [
          {
            id: 'control',
            name: 'Control - Descuento 50%',
            weight: 50,
            isControl: true,
            channelConfig: {
              email: {
                subject: '¡Descuento del 50% en toda la tienda!',
                fromName: 'Tienda Online',
                fromEmail: 'promos@tienda.com',
                templateId: 'promo-50-off',
                variables: { discount: '50' },
                utmParams: { source: 'email', medium: 'campaign', campaign: 'ab-test-subject' },
                tracking: { opens: true, clicks: true, unsubscribes: true }
              }
            }
          },
          {
            id: 'variant-a',
            name: 'Variante A - Urgencia',
            weight: 50,
            isControl: false,
            channelConfig: {
              email: {
                subject: '¡Solo por hoy! 50% OFF - No te lo pierdas',
                fromName: 'Tienda Online',
                fromEmail: 'promos@tienda.com',
                templateId: 'promo-50-off',
                variables: { discount: '50' },
                utmParams: { source: 'email', medium: 'campaign', campaign: 'ab-test-subject' },
                tracking: { opens: true, clicks: true, unsubscribes: true }
              }
            }
          }
        ],
        trafficSplit: [50, 50],
        metric: 'open_rate',
        minimumSampleSize: 1000,
        confidenceLevel: 95,
        autoOptimize: true,
        winnerDeployment: true
      },
      channelConfig: {
        email: {
          subject: '¡Descuento del 50% en toda la tienda!',
          fromName: 'Tienda Online',
          fromEmail: 'promos@tienda.com',
          templateId: 'promo-50-off',
          variables: { discount: '50' },
          utmParams: { source: 'email', medium: 'campaign', campaign: 'ab-test-subject' },
          tracking: { opens: true, clicks: true, unsubscribes: true }
        }
      },
      metrics: {
        totalRecipients: 10000,
        validRecipients: 9800,
        invalidRecipients: 200,
        optedOut: 0,
        sent: 9800,
        delivered: 9604,
        failed: 196,
        bounced: 100,
        opened: 3842,
        clicked: 768,
        replied: 38,
        unsubscribed: 20,
        conversions: 192,
        revenue: 19200,
        deliveryRate: 98.0,
        openRate: 40.0,
        clickRate: 8.0,
        replyRate: 0.4,
        conversionRate: 2.0,
        unsubscribeRate: 0.2,
        bounceRate: 1.0,
        totalCost: 480,
        costPerDelivery: 0.05,
        costPerClick: 0.63,
        costPerConversion: 2.5,
        roi: 3900.0,
        avgTimeToOpen: 2.8,
        avgTimeToClick: 12.5,
        avgTimeToConversion: 38.2,
        variantMetrics: {
          control: {
            totalRecipients: 5000,
            validRecipients: 4900,
            invalidRecipients: 100,
            optedOut: 0,
            sent: 4900,
            delivered: 4802,
            failed: 98,
            bounced: 50,
            opened: 1921,
            clicked: 384,
            replied: 19,
            unsubscribed: 10,
            conversions: 96,
            revenue: 9600,
            deliveryRate: 98.0,
            openRate: 40.0,
            clickRate: 8.0,
            replyRate: 0.4,
            conversionRate: 2.0,
            unsubscribeRate: 0.2,
            bounceRate: 1.0,
            totalCost: 240,
            costPerDelivery: 0.05,
            costPerClick: 0.63,
            costPerConversion: 2.5,
            roi: 3900.0,
            avgTimeToOpen: 2.8,
            avgTimeToClick: 12.5,
            avgTimeToConversion: 38.2,
            channelMetrics: {
              email: {
                sent: 4900, delivered: 4802, opened: 1921, clicked: 384,
                replied: 19, bounced: 50, failed: 98, unsubscribed: 10,
                conversions: 96, revenue: 9600, cost: 240
              }
            }
          },
          'variant-a': {
            totalRecipients: 5000,
            validRecipients: 4900,
            invalidRecipients: 100,
            optedOut: 0,
            sent: 4900,
            delivered: 4802,
            failed: 98,
            bounced: 50,
            opened: 1921,
            clicked: 384,
            replied: 19,
            unsubscribed: 10,
            conversions: 96,
            revenue: 9600,
            deliveryRate: 98.0,
            openRate: 40.0,
            clickRate: 8.0,
            replyRate: 0.4,
            conversionRate: 2.0,
            unsubscribeRate: 0.2,
            bounceRate: 1.0,
            totalCost: 240,
            costPerDelivery: 0.05,
            costPerClick: 0.63,
            costPerConversion: 2.5,
            roi: 3900.0,
            avgTimeToOpen: 2.8,
            avgTimeToClick: 12.5,
            avgTimeToConversion: 38.2,
            channelMetrics: {
              email: {
                sent: 4900, delivered: 4802, opened: 1921, clicked: 384,
                replied: 19, bounced: 50, failed: 98, unsubscribed: 10,
                conversions: 96, revenue: 9600, cost: 240
              }
            }
          }
        },
        channelMetrics: {
          email: {
            sent: 9800, delivered: 9604, opened: 3842, clicked: 768,
            replied: 38, bounced: 100, failed: 196, unsubscribed: 20,
            conversions: 192, revenue: 19200, cost: 480
          }
        }
      }
    }
  ];

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: CampaignChannel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'whatsapp':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'multichannel':
        return <Globe className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
    if (filterChannel !== 'all' && !campaign.channels.includes(filterChannel)) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campañas Activas</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+12% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enviados</p>
              <p className="text-2xl font-bold text-gray-900">61,000</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+8% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
              <p className="text-2xl font-bold text-gray-900">42.3%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+2.1% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Promedio</p>
              <p className="text-2xl font-bold text-gray-900">4,826%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+15% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Estado:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="draft">Borrador</option>
                <option value="scheduled">Programada</option>
                <option value="running">Activa</option>
                <option value="paused">Pausada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Canal:</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as CampaignChannel | 'all')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="multichannel">Multicanal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de campañas */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectCampaign(campaign)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {getStatusIcon(campaign.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  {campaign.channels.map((channel) => (
                    <div key={channel} className="flex items-center space-x-1">
                      {getChannelIcon(channel)}
                      <span className="text-xs text-gray-600 capitalize">{channel}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Enviados</p>
                    <p className="text-sm font-semibold text-gray-900">{campaign.metrics.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tasa Apertura</p>
                    <p className="text-sm font-semibold text-gray-900">{campaign.metrics.openRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tasa Clic</p>
                    <p className="text-sm font-semibold text-gray-900">{campaign.metrics.clickRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ROI</p>
                    <p className="text-sm font-semibold text-gray-900">{campaign.metrics.roi.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Creado por</span>
                    <span className="text-xs font-medium text-gray-900">{campaign.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaña
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Canales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apertura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectCampaign(campaign)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(campaign.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {campaign.channels.map((channel) => (
                          <div key={channel} className="flex items-center space-x-1">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.openRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.clickRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.metrics.roi.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
