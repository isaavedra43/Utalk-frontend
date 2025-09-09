import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Download, Bell, Users } from 'lucide-react';

export const ComplianceModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cumplimiento</h2>
          <p className="text-gray-600">Monitoreo de vencimientos y cumplimiento normativo</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Métricas de cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento General</p>
              <p className="text-2xl font-bold text-gray-900">94.8%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de vencimiento */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Vencimiento</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-red-900">Documentos Vencidos</h4>
                <span className="text-xs text-red-600">Crítico</span>
              </div>
              <p className="text-sm text-red-700 mt-1">5 empleados tienen documentos vencidos que requieren atención inmediata</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-red-600">
                <span>• Ana García - RFC (vencido hace 5 días)</span>
                <span>• Carlos López - CURP (vencido hace 2 días)</span>
                <span>• María Rodríguez - NSS (vencido hace 1 día)</span>
              </div>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
              Ver Detalle
            </button>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-yellow-900">Próximos a Vencer (30 días)</h4>
                <span className="text-xs text-yellow-600">Advertencia</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">12 documentos vencen en los próximos 30 días</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-yellow-600">
                <span>• 3 RFCs</span>
                <span>• 4 CURPs</span>
                <span>• 5 NSS</span>
              </div>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 transition-colors">
              Ver Detalle
            </button>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-900">Evaluaciones Pendientes</h4>
                <span className="text-xs text-blue-600">Información</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">8 evaluaciones de desempeño están pendientes de completar</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                <span>• Marketing: 3 pendientes</span>
                <span>• Tecnología: 2 pendientes</span>
                <span>• Ventas: 3 pendientes</span>
              </div>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Ver Detalle
            </button>
          </div>
        </div>
      </div>

      {/* Cumplimiento por área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumplimiento por Área</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Marketing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">98%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Tecnología</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">96%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ventas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">89%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Recursos Humanos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">82%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Documentos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">RFC</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">247/247</div>
                <div className="text-xs text-green-600">100%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">CURP</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">245/247</div>
                <div className="text-xs text-yellow-600">99.2%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">NSS</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">243/247</div>
                <div className="text-xs text-yellow-600">98.4%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Contratos</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">247/247</div>
                <div className="text-xs text-green-600">100%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Políticas</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">240/247</div>
                <div className="text-xs text-red-600">97.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporte de cumplimiento */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte de Cumplimiento Legal</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Documentos Completos</span>
              </div>
              <div className="text-2xl font-bold text-green-900">234</div>
              <div className="text-sm text-green-700">empleados</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Pendientes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">8</div>
              <div className="text-sm text-yellow-700">empleados</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Vencidos</span>
              </div>
              <div className="text-2xl font-bold text-red-900">5</div>
              <div className="text-sm text-red-700">empleados</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Evidencia de Consentimientos</h4>
                <p className="text-sm text-gray-600">Firmas digitales y aceptación de políticas</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">247/247</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Políticas Actualizadas</h4>
                <p className="text-sm text-gray-600">Última actualización: Noviembre 2024</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">240/247</span>
                <span className="text-sm font-medium text-yellow-600">97.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones recomendadas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Recomendadas</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900">Urgente: Renovar documentos vencidos</h4>
              <p className="text-sm text-red-700 mt-1">5 empleados tienen documentos vencidos que requieren renovación inmediata para mantener el cumplimiento legal.</p>
              <div className="mt-2">
                <button className="text-sm font-medium text-red-600 hover:text-red-700">Ver lista de empleados →</button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-900">Programar renovaciones preventivas</h4>
              <p className="text-sm text-yellow-700 mt-1">12 documentos vencen en los próximos 30 días. Programar renovaciones para evitar vencimientos.</p>
              <div className="mt-2">
                <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">Crear recordatorios →</button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Completar evaluaciones pendientes</h4>
              <p className="text-sm text-blue-700 mt-1">8 evaluaciones de desempeño están pendientes. Completar para mantener el cumplimiento del proceso de evaluación.</p>
              <div className="mt-2">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver evaluaciones →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
