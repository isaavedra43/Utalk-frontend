import React from 'react';
import { Users, Filter, Database, Target } from 'lucide-react';

export const AudienceBuilder: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Constructor de Audiencias</h2>
          <p className="text-gray-600 mb-8">
            Segmenta y crea audiencias dinámicas con filtros avanzados y consultas SQL
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <Filter className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Segmentación</h3>
              <p className="text-sm text-gray-600">Filtros demográficos, comportamiento y engagement</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Listas Dinámicas</h3>
              <p className="text-sm text-gray-600">Consultas SQL seguras y actualizaciones automáticas</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Look-alike</h3>
              <p className="text-sm text-gray-600">Audiencias similares basadas en IA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
