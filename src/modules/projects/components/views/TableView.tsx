// Vista de tabla (tipo Excel) para tareas

import React, { useState } from 'react';
import type { Task } from '../../types';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  Calendar,
  User,
  CheckCircle 
} from 'lucide-react';

interface TableViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const toggleSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const renderTaskRow = (task: Task, level: number = 0) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isSelected = selectedTasks.has(task.id);
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return (
      <React.Fragment key={task.id}>
        <tr
          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50' : ''
          }`}
        >
          {/* Checkbox + Nombre */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(task.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              
              {hasSubtasks && (
                <button
                  onClick={() => toggleExpand(task.id)}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTaskClick?.(task)}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {task.name}
                  </button>
                  {task.code && (
                    <span className="text-xs text-gray-500 font-mono">{task.code}</span>
                  )}
                </div>
              </div>
            </div>
          </td>

          {/* Estado */}
          <td className="px-4 py-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </td>

          {/* Prioridad */}
          <td className="px-4 py-3">
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </td>

          {/* Asignado */}
          <td className="px-4 py-3">
            {task.assignedTo && task.assignedTo.length > 0 ? (
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-700">{task.assignedTo.length}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>

          {/* Fecha inicio */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date(task.startDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </div>
          </td>

          {/* Fecha fin */}
          <td className="px-4 py-3">
            <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
              <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
              {new Date(task.dueDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
            </div>
          </td>

          {/* Progreso */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${task.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8 text-right">{task.progress}%</span>
            </div>
          </td>

          {/* Acciones */}
          <td className="px-4 py-3">
            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </td>
        </tr>

        {/* Subtareas */}
        {hasSubtasks && isExpanded && task.subtasks.map(subtask => 
          renderTaskRow(subtask, level + 1)
        )}
      </React.Fragment>
    );
  };

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Tarea
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Prioridad
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Asignado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Inicio
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Fin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Progreso
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay tareas aún</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Crear Primera Tarea
                </button>
              </td>
            </tr>
          ) : (
            tasks.map(task => renderTaskRow(task, 0))
          )}
        </tbody>
      </table>
    </div>
  );
};

