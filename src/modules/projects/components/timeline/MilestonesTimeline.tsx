// Timeline de milestones

import React from 'react';
import type { Milestone } from '../../types';
import { Flag, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface MilestonesTimelineProps {
  milestones: Milestone[];
  projectStartDate: Date;
  projectEndDate: Date;
  onClick?: (milestone: Milestone) => void;
}

export const MilestonesTimeline: React.FC<MilestonesTimelineProps> = ({
  milestones,
  projectStartDate,
  projectEndDate,
  onClick,
}) => {
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getPosition = (date: Date) => {
    const start = projectStartDate.getTime();
    const end = projectEndDate.getTime();
    const current = new Date(date).getTime();
    
    const percentage = ((current - start) / (end - start)) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const getStatusIcon = (milestone: Milestone) => {
    switch (milestone.status) {
      case 'achieved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'missed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Flag className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (milestone: Milestone) => {
    switch (milestone.status) {
      case 'achieved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Flag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay milestones definidos</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Agregar Milestone
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Milestones del Proyecto</h3>
      
      {/* Timeline horizontal */}
      <div className="relative">
        {/* Línea base */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300 rounded-full"></div>
        
        {/* Marcador de hoy */}
        <div
          className="absolute top-6 h-5 w-0.5 bg-red-500"
          style={{ left: `${getPosition(new Date())}%` }}
        >
          <div className="absolute -top-1 -left-3 text-xs text-red-500 font-medium">Hoy</div>
        </div>
        
        {/* Milestones */}
        <div className="relative h-32">
          {sortedMilestones.map((milestone, index) => {
            const position = getPosition(milestone.date);
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={milestone.id}
                className="absolute"
                style={{ 
                  left: `${position}%`,
                  top: isEven ? '0' : '80px',
                  transform: 'translateX(-50%)'
                }}
              >
                {/* Conector vertical */}
                <div className={`absolute left-1/2 w-0.5 bg-gray-300 ${
                  isEven ? 'top-12 h-8' : 'bottom-12 h-8'
                }`}></div>
                
                {/* Card del milestone */}
                <button
                  onClick={() => onClick?.(milestone)}
                  className={`relative z-10 p-3 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(milestone)} min-w-[120px]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(milestone)}
                    <span className="text-xs font-semibold truncate">{milestone.name}</span>
                  </div>
                  <p className="text-xs">
                    {new Date(milestone.date).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {milestone.critical && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de milestones */}
      <div className="mt-8 space-y-2">
        {sortedMilestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => onClick?.(milestone)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getStatusColor(milestone)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(milestone)}
              <div>
                <p className="font-medium text-sm">{milestone.name}</p>
                <p className="text-xs opacity-75">
                  {new Date(milestone.date).toLocaleDateString('es-MX', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            {milestone.critical && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
                Crítico
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

