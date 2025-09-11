import React from 'react';
import { Users, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import type { TeamMember } from '../../../types/team';

interface CoachingPanelProps {
  member: TeamMember;
}

const CoachingPanel: React.FC<CoachingPanelProps> = ({ member }) => {
  return (
    <div className="p-4 lg:p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-gray-500" />
          Coaching
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      </h3>
      
      <div className="space-y-4">
        {/* Progreso general */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Progreso de {member.name}</span>
            <span className="text-sm text-blue-700">75%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Fortalezas IA */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Fortalezas IA</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Excelente tiempo de respuesta</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Alta satisfacción del cliente</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Comunicación empática y clara</span>
            </div>
          </div>
        </div>

        {/* Áreas a mejorar */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Áreas a mejorar</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">Técnicas de cierre de ventas</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">Manejo de objeciones complejas</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">Uso de plantillas predefinidas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingPanel; 