// Vista Kanban para tareas

import React from 'react';
import type { Task } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { Plus } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onCreateTask?: (status: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onTaskClick,
  onTaskMove,
  onCreateTask,
}) => {
  const columns = [
    { id: 'not_started', title: 'Por Iniciar', color: 'border-gray-300' },
    { id: 'in_progress', title: 'En Progreso', color: 'border-blue-500' },
    { id: 'review', title: 'En Revisión', color: 'border-purple-500' },
    { id: 'blocked', title: 'Bloqueadas', color: 'border-red-500' },
    { id: 'completed', title: 'Completadas', color: 'border-green-500' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg border-2 ${column.color}`}
          >
            {/* Column header */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500">{columnTasks.length}</span>
              </div>
              
              <button
                onClick={() => onCreateTask?.(column.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva tarea</span>
              </button>
            </div>

            {/* Column content */}
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  Sin tareas
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

