import React from 'react';
import { 
  Users, 
  TrendingDown, 
  DollarSign, 
  UserPlus, 
  AlertTriangle, 
  Shield,
  BarChart3,
  TrendingUp,
  Calendar,
  MapPin,
  Building2
} from 'lucide-react';

export const HRDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+5% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rotación (YTD)</p>
              <p className="text-2xl font-bold text-gray-900">8.2%</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 ml-1">+1.2% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Nómina (MTD)</p>
              <p className="text-2xl font-bold text-gray-900">$2.4M</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+3.1% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacantes Abiertas</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-600 ml-1">+2 vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ausentismo (MTD)</p>
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">-0.5% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento Docs</p>
              <p className="text-2xl font-bold text-gray-900">94.8%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">+2.1% vs mes anterior</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Extra por Mes</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de líneas - Horas extra mensuales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotación por Sede</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Oficina Central</span>
              </div>
              <span className="text-sm font-medium text-gray-900">6.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Sede Norte</span>
              </div>
              <span className="text-sm font-medium text-gray-900">9.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Sede Sur</span>
              </div>
              <span className="text-sm font-medium text-gray-900">7.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compa-ratio vs Banda</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Marketing</span>
              </div>
              <span className="text-sm font-medium text-green-600">1.05</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Tecnología</span>
              </div>
              <span className="text-sm font-medium text-green-600">1.12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Ventas</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">0.95</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riesgos (por 100 empleados)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Incidentes de seguridad</span>
              <span className="text-sm font-medium text-green-600">0.4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amonestaciones</span>
              <span className="text-sm font-medium text-yellow-600">1.2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bajo desempeño</span>
              <span className="text-sm font-medium text-red-600">2.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y notificaciones */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Documentos próximos a vencer</p>
              <p className="text-sm text-gray-600">5 empleados tienen documentos que vencen en los próximos 30 días</p>
            </div>
            <span className="text-xs text-gray-500">Hace 2 horas</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Alta rotación en Ventas</p>
              <p className="text-sm text-gray-600">La rotación en el departamento de Ventas ha aumentado al 15% este mes</p>
            </div>
            <span className="text-xs text-gray-500">Hace 4 horas</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Evaluaciones pendientes</p>
              <p className="text-sm text-gray-600">12 evaluaciones de desempeño están pendientes de completar</p>
            </div>
            <span className="text-xs text-gray-500">Hace 6 horas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
