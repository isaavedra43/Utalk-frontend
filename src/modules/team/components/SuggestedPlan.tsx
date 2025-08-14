import React from 'react';
import type { TeamMember } from '../../../types/team';

interface SuggestedPlanProps {
  member: TeamMember;
}

const SuggestedPlan: React.FC<SuggestedPlanProps> = () => {
  return (
    <div className="p-4">
      {/* Banner de advertencia */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium text-yellow-800">
            Uso de plantillas predefinidas
          </span>
        </div>
      </div>

      {/* Plan sugerido */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Plan sugerido 7 días
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          Progreso: 1/3
        </div>
      </div>

      {/* Tareas del plan */}
      <div className="space-y-3">
        {/* Tarea 1 */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-medium text-gray-900">Revisar técnicas de cierre</h4>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Estudiar y practicar 3 técnicas de cierre de ventas efectivas
              </p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">high</span>
                <span className="text-xs text-gray-500">60 min</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Tarea 2 */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-medium text-gray-900">Roleplay con supervisor</h4>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Sesión práctica de manejo de objeciones con supervisor
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">45 min</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Tarea 3 - Completada */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-medium text-gray-900">Crear plantillas personalizadas</h4>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Desarrollar 5 plantillas para respuestas frecuentes
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">90 min</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedPlan; 