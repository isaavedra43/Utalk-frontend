import React from 'react';
import { BarChart3, TrendingUp, Users, Mail, MessageSquare, Smartphone, Globe, Target } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analítica Avanzada</h2>
          <p className="text-gray-600">Métricas en tiempo real y análisis de rendimiento</p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campañas</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Alcance Total</p>
                <p className="text-2xl font-bold text-gray-900">2.4M</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">ROI Promedio</p>
                <p className="text-2xl font-bold text-gray-900">4,826%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+15% vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">$3,050</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 ml-1">+5% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Gráficos y análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Canal</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">42.3% apertura</span>
                  <span className="text-sm text-gray-600">8.7% clics</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">SMS</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">98.2% entrega</span>
                  <span className="text-sm text-gray-600">12.4% clics</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">WhatsApp</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">95.8% entrega</span>
                  <span className="text-sm text-gray-600">15.2% clics</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Temporales</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de tendencias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis de cohortes y atribución */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Cohortes</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Matriz de cohortes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atribución Multi-touch</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Modelo de atribución</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
