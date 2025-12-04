// Hook de gestión de tareas

import { useState, useCallback, useMemo } from 'react';
import { tasksService } from '../services/tasksService';
import type { Task, TaskFilters, TaskDependency } from '../types';

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});

  // Cargar tareas
  const loadTasks = useCallback(async (options?: {
    filters?: TaskFilters;
    includeSubtasks?: boolean;
    includeCompleted?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedTasks = await tasksService.getTasks(projectId, options);
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(errorMessage);
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Crear tarea
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newTask = await tasksService.createTask(projectId, taskData);
      setTasks(prev => [...prev, newTask]);
      
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tarea';
      setError(errorMessage);
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar tarea
  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<Task>
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedTask = await tasksService.updateTask(projectId, taskId, updates);
      
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      
      if (selectedTask?.id === taskId) {
        setSelectedTask(updatedTask);
      }
      
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarea';
      setError(errorMessage);
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedTask]);

  // Eliminar tarea
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await tasksService.deleteTask(projectId, taskId);
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarea';
      setError(errorMessage);
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedTask]);

  // Agregar dependencia
  const addDependency = useCallback(async (
    taskId: string,
    dependency: {
      predecessorId: string;
      type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
      lag?: number;
    }
  ) => {
    try {
      const newDependency = await tasksService.addDependency(projectId, taskId, dependency);
      
      // Actualizar tarea en lista
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            dependencies: [...(t.dependencies || []), newDependency]
          };
        }
        return t;
      }));
      
      return newDependency;
    } catch (err) {
      console.error('Error adding dependency:', err);
      throw err;
    }
  }, [projectId]);

  // Actualizar progreso
  const updateProgress = useCallback(async (
    taskId: string,
    progress: number
  ) => {
    try {
      const updated = await tasksService.updateProgress(projectId, taskId, progress);
      
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      
      return updated;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [projectId]);

  // Cambiar estado
  const updateStatus = useCallback(async (
    taskId: string,
    status: string
  ) => {
    try {
      const updated = await tasksService.updateStatus(projectId, taskId, status);
      
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      
      return updated;
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  }, [projectId]);

  // Asignar tarea
  const assignTask = useCallback(async (
    taskId: string,
    assignees: string[]
  ) => {
    try {
      const updated = await tasksService.assignTask(projectId, taskId, assignees);
      
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      
      return updated;
    } catch (err) {
      console.error('Error assigning task:', err);
      throw err;
    }
  }, [projectId]);

  // Tareas filtradas
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter(t => filters.status!.includes(t.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(t => filters.priority!.includes(t.priority));
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      result = result.filter(t => 
        t.assignedTo.some(a => filters.assignedTo!.includes(a))
      );
    }

    if (filters.isOverdue) {
      const now = new Date();
      result = result.filter(t => 
        new Date(t.dueDate) < now && t.status !== 'completed'
      );
    }

    return result;
  }, [tasks, filters]);

  // Estadísticas de tareas
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
      overdue: tasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length,
      avgProgress: tasks.length > 0 
        ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length 
        : 0,
    };
  }, [tasks]);

  return {
    // Estado
    tasks,
    filteredTasks,
    selectedTask,
    loading,
    error,
    taskStats,
    filters,
    
    // Acciones
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    addDependency,
    updateProgress,
    updateStatus,
    assignTask,
    setSelectedTask,
    setFilters,
  };
};

