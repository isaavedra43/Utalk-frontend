// KPIs del proyecto

import React from 'react';
import type { ProjectMetrics } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle 
} from 'lucide-react';

interface ProjectKPIsProps {
  metrics: ProjectMetrics | null;
}

export const ProjectKPIs: React.FC<ProjectKPIsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: 'Progreso General',
      value: `${metrics.overallProgress}%`,
      icon: CheckCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      trend: metrics.overallProgress >= 50 ? 'up' : 'neutral',
      subtitle: `${metrics.completedTasks} de ${metrics.totalTasks} tareas`,
    },
    {
      label: 'Presupuesto',
      value: `${metrics.percentageSpent.toFixed(1)}%`,
      icon: DollarSign,
      color: metrics.onBudget ? 'green' : 'red',
      bgColor: metrics.onBudget ? 'bg-green-50' : 'bg-red-50',
      textColor: metrics.onBudget ? 'text-green-600' : 'text-red-600',
      borderColor: metrics.onBudget ? 'border-green-200' : 'border-red-200',
      trend: metrics.onBudget ? 'up' : 'down',
      subtitle: `$${(metrics.spentBudget / 1000).toFixed(0)}k de $${(metrics.totalBudget / 1000).toFixed(0)}k`,
    },
    {
      label: 'Tiempo Transcurrido',
      value: `${metrics.percentageTimeElapsed.toFixed(0)}%`,
      icon: Calendar,
      color: metrics.onSchedule ? 'purple' : 'orange',
      bgColor: metrics.onSchedule ? 'bg-purple-50' : 'bg-orange-50',
      textColor: metrics.onSchedule ? 'text-purple-600' : 'text-orange-600',
      borderColor: metrics.onSchedule ? 'border-purple-200' : 'border-orange-200',
      trend: metrics.onSchedule ? 'up' : 'down',
      subtitle: `${metrics.daysRemaining} días restantes`,
    },
    {
      label: 'Equipo',
      value: metrics.totalTeamMembers.toString(),
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      trend: 'neutral',
      subtitle: `${metrics.activeMembers} activos`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`${kpi.bgColor} rounded-lg border ${kpi.borderColor} p-6`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${kpi.bgColor} border ${kpi.borderColor}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.textColor}`} />
            </div>
            {kpi.trend !== 'neutral' && (
              <div className={`flex items-center ${kpi.textColor}`}>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-600 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.textColor} mb-1`}>
              {kpi.value}
            </p>
            <p className="text-xs text-gray-500">{kpi.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

