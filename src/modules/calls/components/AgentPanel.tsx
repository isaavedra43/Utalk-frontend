import React from 'react';
import { User, Phone, Clock, Target, TrendingUp, TrendingDown, Bell, Settings } from 'lucide-react';

export const AgentPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Panel del Agente</h3>
        <p className="text-gray-600">Vista personalizada para agentes con métricas y controles</p>
      </div>
    </div>
  );
};
