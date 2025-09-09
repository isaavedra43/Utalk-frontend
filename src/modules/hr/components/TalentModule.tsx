import React from 'react';
import { Target, Star, TrendingUp, Users, Award, BookOpen, BarChart3 } from 'lucide-react';

export const TalentModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Módulo de Talento</h2>
          <p className="text-gray-600">Gestión de evaluaciones, habilidades y desarrollo</p>
        </div>
      </div>

      {/* Métricas de talento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluaciones Activas</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Score Promedio</p>
              <p className="text-2xl font-bold text-gray-900">4.2/5</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planes de Desarrollo</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Habilidades Mapeadas</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Matriz 9-Box */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz 9-Box (Desempeño vs Potencial)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Alto Potencial</div>
                <div className="text-xs text-gray-500">Alto Desempeño</div>
                <div className="text-lg font-bold text-green-600">12</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Estrellas</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Alto Potencial</div>
                <div className="text-xs text-gray-500">Medio Desempeño</div>
                <div className="text-lg font-bold text-blue-600">8</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Diamantes</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Alto Potencial</div>
                <div className="text-xs text-gray-500">Bajo Desempeño</div>
                <div className="text-lg font-bold text-yellow-600">3</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Preguntas</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Medio Potencial</div>
                <div className="text-xs text-gray-500">Alto Desempeño</div>
                <div className="text-lg font-bold text-green-600">15</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Futuros Líderes</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Medio Potencial</div>
                <div className="text-xs text-gray-500">Medio Desempeño</div>
                <div className="text-lg font-bold text-gray-600">45</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Contribuidores</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Medio Potencial</div>
                <div className="text-xs text-gray-500">Bajo Desempeño</div>
                <div className="text-lg font-bold text-orange-600">7</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">En Desarrollo</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Bajo Potencial</div>
                <div className="text-xs text-gray-500">Alto Desempeño</div>
                <div className="text-lg font-bold text-green-600">22</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Especialistas</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Bajo Potencial</div>
                <div className="text-xs text-gray-500">Medio Desempeño</div>
                <div className="text-lg font-bold text-gray-600">38</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Estables</div>
          </div>
          <div className="text-center">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Bajo Potencial</div>
                <div className="text-xs text-gray-500">Bajo Desempeño</div>
                <div className="text-lg font-bold text-red-600">5</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Acción Requerida</div>
          </div>
        </div>
      </div>

      {/* Evaluaciones recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluaciones Recientes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Evaluación 360° Q4 2024</div>
                <div className="text-sm text-gray-500">Marketing Team</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">4.2/5</div>
                <div className="text-sm text-gray-500">85% completado</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">OKR Q4 2024</div>
                <div className="text-sm text-gray-500">Tecnología</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">3.8/5</div>
                <div className="text-sm text-gray-500">92% completado</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">Evaluación de Habilidades</div>
                <div className="text-sm text-gray-500">Ventas</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">4.0/5</div>
                <div className="text-sm text-gray-500">78% completado</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planes de Desarrollo</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Liderazgo Ejecutivo</div>
              <div className="text-sm text-blue-700">12 empleados</div>
              <div className="text-xs text-blue-600 mt-1">Duración: 6 meses</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900">Habilidades Técnicas</div>
              <div className="text-sm text-green-700">25 empleados</div>
              <div className="text-xs text-green-600 mt-1">Duración: 3 meses</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900">Soft Skills</div>
              <div className="text-sm text-purple-700">18 empleados</div>
              <div className="text-xs text-purple-600 mt-1">Duración: 2 meses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de habilidades */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matriz de Habilidades por Puesto</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habilidades Requeridas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaps Identificados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos Sugeridos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Gerente de Marketing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8/10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver Detalle</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Desarrollador Senior</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">9/10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver Detalle</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Analista RH</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">7/10</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver Detalle</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
