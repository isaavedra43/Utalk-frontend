import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target, Shield, AlertTriangle } from 'lucide-react';

export const AnalyticsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analítica de RH</h2>
          <p className="text-gray-600">KPIs y métricas en tiempo real</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Últimos 30 días</option>
            <option>Últimos 90 días</option>
            <option>Último año</option>
            <option>Personalizado</option>
          </select>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Headcount</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
              <p className="text-sm text-green-600">+5% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Altas/Bajas</p>
              <p className="text-2xl font-bold text-gray-900">+12/-8</p>
              <p className="text-sm text-green-600">+4 neto</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rotación</p>
              <p className="text-2xl font-bold text-gray-900">8.2%</p>
              <p className="text-sm text-red-600">+1.2% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Nómina</p>
              <p className="text-2xl font-bold text-gray-900">$2.4M</p>
              <p className="text-sm text-green-600">+3.1% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Headcount por Área</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de barras - Headcount por área</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Rotación</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de líneas - Rotación mensual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ausentismo</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa general</span>
              <span className="text-sm font-medium text-gray-900">3.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Por departamento</span>
              <span className="text-sm font-medium text-gray-900">Ver detalle</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tendencia</span>
              <span className="text-sm font-medium text-green-600">↓ -0.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Extra</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total mensual</span>
              <span className="text-sm font-medium text-gray-900">1,247 hrs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Costo total</span>
              <span className="text-sm font-medium text-gray-900">$187,050</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Por empleado</span>
              <span className="text-sm font-medium text-gray-900">5.0 hrs</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiempo de Cobertura</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Promedio general</span>
              <span className="text-sm font-medium text-gray-900">28 días</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tecnología</span>
              <span className="text-sm font-medium text-gray-900">35 días</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ventas</span>
              <span className="text-sm font-medium text-gray-900">21 días</span>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de cohortes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Cohortes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Retención por Fecha de Ingreso</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Q1 2024</span>
                <span className="text-sm font-medium text-gray-900">94%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Q2 2024</span>
                <span className="text-sm font-medium text-gray-900">89%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Q3 2024</span>
                <span className="text-sm font-medium text-gray-900">96%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Q4 2024</span>
                <span className="text-sm font-medium text-gray-900">98%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Funnel de Reclutamiento</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Aplicaciones</span>
                <span className="text-sm font-medium text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Entrevistas</span>
                <span className="text-sm font-medium text-gray-900">48</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Ofertas</span>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Contratados</span>
                <span className="text-sm font-medium text-gray-900">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmaps y mapas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Heatmap de Ausentismo</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Heatmap de ausentismo por sede y departamento</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa por Sede</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Distribución geográfica de empleados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de calidad */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Calidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600">Calidad de Contratación 90d</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">42 hrs</div>
            <div className="text-sm text-gray-600">Entrenamiento (hrs/FTE)</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">94.8%</div>
            <div className="text-sm text-gray-600">Cumplimiento Docs</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Riesgos Críticos</div>
          </div>
        </div>
      </div>
    </div>
  );
};
