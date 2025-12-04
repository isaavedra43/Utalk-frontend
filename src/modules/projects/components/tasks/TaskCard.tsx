// Tarjeta de tarea reutilizable

import React from 'react';
import type { Task } from '../../types';
import { 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronRight 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
  showPhase?: boolean;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  showProject = false,
  showPhase = false,
  compact = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{task.name}</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.code && (
              <span className="text-xs text-gray-500 font-mono">{task.code}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                Retrasada
              </span>
            )}
          </div>
          
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {task.name}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {task.description}
            </p>
          )}
        </div>
        
        <div className={`flex-shrink-0 ml-3 ${getPriorityColor(task.priority)}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Progreso</span>
            <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                task.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta información */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
        
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{task.assignedTo.length} asignado{task.assignedTo.length > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {task.estimatedHours > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
        
        {task.checklist && task.checklist.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

