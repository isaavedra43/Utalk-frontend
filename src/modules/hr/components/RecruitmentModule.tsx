import React from 'react';
import { UserPlus, Users, FileText, TrendingUp, Clock, Target, Star, CheckCircle } from 'lucide-react';

export const RecruitmentModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ATS - Reclutamiento</h2>
          <p className="text-gray-600">Sistema de gestión de talento y reclutamiento</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4" />
            <span>Nueva Vacante</span>
          </button>
        </div>
      </div>

      {/* Métricas de reclutamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacantes Abiertas</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidatos Activos</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">28 días</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">15.2%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Reclutamiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Sourcing</h4>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">24</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">Ana García</div>
                <div className="text-xs text-gray-500">Desarrolladora Frontend</div>
                <div className="text-xs text-gray-400">Hace 2 días</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">Carlos López</div>
                <div className="text-xs text-gray-500">Diseñador UX</div>
                <div className="text-xs text-gray-400">Hace 1 día</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Screening</h4>
              <span className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full">12</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">María Rodríguez</div>
                <div className="text-xs text-gray-500">Marketing Manager</div>
                <div className="text-xs text-gray-400">Hace 3 días</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-yellow-900">Entrevista</h4>
              <span className="bg-yellow-200 text-yellow-700 text-xs px-2 py-1 rounded-full">8</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">José Martínez</div>
                <div className="text-xs text-gray-500">DevOps Engineer</div>
                <div className="text-xs text-gray-400">Hoy 2:00 PM</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-orange-900">Oferta</h4>
              <span className="bg-orange-200 text-orange-700 text-xs px-2 py-1 rounded-full">3</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">Laura Sánchez</div>
                <div className="text-xs text-gray-500">Product Manager</div>
                <div className="text-xs text-gray-400">Esperando respuesta</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-green-900">Onboarding</h4>
              <span className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full">1</span>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm font-medium text-gray-900">Roberto Díaz</div>
                <div className="text-xs text-gray-500">Sales Executive</div>
                <div className="text-xs text-gray-400">Inicia el lunes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacantes activas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vacantes Activas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidatos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Desarrollador Full Stack</div>
                    <div className="text-sm text-gray-500">$35,000 - $45,000</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Tecnología</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CDMX</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">24</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Alta</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Abierta</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Marketing Manager</div>
                    <div className="text-sm text-gray-500">$25,000 - $35,000</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Marketing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CDMX</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Media</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Abierta</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sales Executive</div>
                    <div className="text-sm text-gray-500">$20,000 - $30,000</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ventas</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Guadalajara</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Baja</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">En Proceso</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparador de candidatos */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparador de Candidatos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Ana García</h4>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">4.2</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Experiencia:</span>
                <span className="text-gray-900">5 años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Educación:</span>
                <span className="text-gray-900">Licenciatura</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Skills:</span>
                <span className="text-gray-900">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salario Esperado:</span>
                <span className="text-gray-900">$40,000</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Notas:</div>
              <div className="text-sm text-gray-700">Excelente experiencia en React y Node.js</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Carlos López</h4>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">3.8</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Experiencia:</span>
                <span className="text-gray-900">3 años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Educación:</span>
                <span className="text-gray-900">Técnico</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Skills:</span>
                <span className="text-gray-900">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salario Esperado:</span>
                <span className="text-gray-900">$35,000</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Notas:</div>
              <div className="text-sm text-gray-700">Buen potencial, necesita capacitación</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">María Rodríguez</h4>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">4.5</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Experiencia:</span>
                <span className="text-gray-900">7 años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Educación:</span>
                <span className="text-gray-900">Maestría</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Skills:</span>
                <span className="text-gray-900">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salario Esperado:</span>
                <span className="text-gray-900">$45,000</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Notas:</div>
              <div className="text-sm text-gray-700">Candidata ideal, experiencia sólida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
