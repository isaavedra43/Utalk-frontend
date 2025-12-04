// Hook de timeline y cronograma

import { useState, useCallback, useMemo } from 'react';
import { timelineService } from '../services/timelineService';
import type { 
  ProjectTimeline,
  ProjectPhase,
  Milestone,
  TimelineVariance 
} from '../types';

export const useTimeline = (projectId: string) => {
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar timeline
  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedTimeline = await timelineService.getTimeline(projectId);
      setTimeline(fetchedTimeline);
      setPhases(fetchedTimeline.phases || []);
      setMilestones(fetchedTimeline.milestones || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar timeline';
      setError(errorMessage);
      console.error('Error loading timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Crear fase
  const createPhase = useCallback(async (phaseData: Partial<ProjectPhase>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPhase = await timelineService.createPhase(projectId, phaseData);
      setPhases(prev => [...prev, newPhase]);
      
      return newPhase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear fase';
      setError(errorMessage);
      console.error('Error creating phase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar fase
  const updatePhase = useCallback(async (
    phaseId: string,
    updates: Partial<ProjectPhase>
  ) => {
    try {
      const updated = await timelineService.updatePhase(projectId, phaseId, updates);
      
      setPhases(prev => prev.map(p => p.id === phaseId ? updated : p));
      
      return updated;
    } catch (err) {
      console.error('Error updating phase:', err);
      throw err;
    }
  }, [projectId]);

  // Eliminar fase
  const deletePhase = useCallback(async (phaseId: string) => {
    try {
      await timelineService.deletePhase(projectId, phaseId);
      
      setPhases(prev => prev.filter(p => p.id !== phaseId));
    } catch (err) {
      console.error('Error deleting phase:', err);
      throw err;
    }
  }, [projectId]);

  // Crear milestone
  const createMilestone = useCallback(async (milestoneData: Partial<Milestone>) => {
    try {
      const newMilestone = await timelineService.createMilestone(projectId, milestoneData);
      setMilestones(prev => [...prev, newMilestone]);
      
      return newMilestone;
    } catch (err) {
      console.error('Error creating milestone:', err);
      throw err;
    }
  }, [projectId]);

  // Obtener datos para Gantt
  const getGanttData = useCallback(async (config?: any) => {
    try {
      const ganttData = await timelineService.getGanttData(projectId, config);
      return ganttData;
    } catch (err) {
      console.error('Error fetching Gantt data:', err);
      throw err;
    }
  }, [projectId]);

  // Crear baseline
  const createBaseline = useCallback(async (name: string, description?: string) => {
    try {
      const baseline = await timelineService.createBaseline(projectId, { name, description });
      return baseline;
    } catch (err) {
      console.error('Error creating baseline:', err);
      throw err;
    }
  }, [projectId]);

  // Obtener varianza
  const getVariance = useCallback(async (baselineId?: string) => {
    try {
      const variance = await timelineService.getVariance(projectId, baselineId);
      return variance;
    } catch (err) {
      console.error('Error fetching variance:', err);
      throw err;
    }
  }, [projectId]);

  // Recalcular cronograma
  const recalculateSchedule = useCallback(async () => {
    try {
      setLoading(true);
      
      const updated = await timelineService.recalculateSchedule(projectId);
      setTimeline(updated);
    } catch (err) {
      console.error('Error recalculating schedule:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Estadísticas del timeline
  const timelineStats = useMemo(() => {
    if (!timeline) return null;

    const now = new Date();
    const start = new Date(timeline.startDate);
    const end = new Date(timeline.plannedEndDate);
    const total = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return {
      daysTotal: Math.ceil(total),
      daysElapsed: Math.ceil(Math.max(0, elapsed)),
      daysRemaining: Math.ceil(Math.max(0, total - elapsed)),
      percentageElapsed: Math.min(100, (elapsed / total) * 100),
      isOverdue: now > end,
      totalPhases: phases.length,
      completedPhases: phases.filter(p => p.status === 'completed').length,
      totalMilestones: milestones.length,
      achievedMilestones: milestones.filter(m => m.status === 'achieved').length,
    };
  }, [timeline, phases, milestones]);

  return {
    // Estado
    timeline,
    phases,
    milestones,
    loading,
    error,
    timelineStats,
    
    // Acciones
    loadTimeline,
    createPhase,
    updatePhase,
    deletePhase,
    createMilestone,
    getGanttData,
    createBaseline,
    getVariance,
    recalculateSchedule,
  };
};

