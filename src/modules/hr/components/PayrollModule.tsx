import React from 'react';
import { DollarSign, Calculator, FileText, Download, Plus, Calendar, Users, TrendingUp } from 'lucide-react';

export const PayrollModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Módulo de Nómina</h2>
          <p className="text-gray-600">Gestión completa de nómina con catálogos fiscales MX</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Nuevo Periodo</span>
          </button>
        </div>
      </div>

      {/* Métricas de nómina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Periodos Activos</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Total MTD</p>
              <p className="text-2xl font-bold text-gray-900">$2.4M</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recibos Generados</p>
              <p className="text-2xl font-bold text-gray-900">741</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Payroll Run Wizard</h3>
              <p className="text-sm text-gray-500">Proceso completo de cálculo de nómina</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">1. Seleccionar Periodo</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">2. Simular con Diferencias</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">3. Ajustes Manuales</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">4. Aprobar & Cerrar</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Simuladores</h3>
              <p className="text-sm text-gray-500">Análisis de impacto en cambios</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Cambio de Sueldo</div>
              <div className="text-sm text-gray-500">Impacto en SBC, IMSS, ISR, INFONAVIT</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Finiquito/Liquidación</div>
              <div className="text-sm text-gray-500">Cálculo de prestaciones y indemnizaciones</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Horas Extra</div>
              <div className="text-sm text-gray-500">Impacto en nómina y costos</div>
            </button>
          </div>
        </div>
      </div>

      {/* Catálogos fiscales */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catálogos Fiscales MX</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">UMA 2024</h4>
            <p className="text-sm text-gray-600">$103.74 diario</p>
            <p className="text-sm text-gray-600">$3,112.20 mensual</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">SMG 2024</h4>
            <p className="text-sm text-gray-600">$248.93 diario</p>
            <p className="text-sm text-gray-600">$7,467.90 mensual</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ISR Tabla 2024</h4>
            <p className="text-sm text-gray-600">Actualizada</p>
            <p className="text-sm text-gray-600">Vigente desde enero</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">IMSS Cuotas</h4>
            <p className="text-sm text-gray-600">Empleado: 1.75%</p>
            <p className="text-sm text-gray-600">Patrón: 5.15%</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">INFONAVIT</h4>
            <p className="text-sm text-gray-600">VSM: 5%</p>
            <p className="text-sm text-gray-600">Cuota fija: $1,500</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Feriados DOF</h4>
            <p className="text-sm text-gray-600">15 días oficiales</p>
            <p className="text-sm text-gray-600">2024 actualizado</p>
          </div>
        </div>
      </div>

      {/* Periodos recientes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Periodos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Noviembre 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mensual</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,400,000</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Cerrado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Semana 47</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Semanal</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$600,000</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Aprobado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
