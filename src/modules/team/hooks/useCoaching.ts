import { useState, useCallback } from 'react';
import type { TeamMember, CoachingPlan, CoachingTask, Strength, ImprovementArea } from '../../../types/team';
import { teamService } from '../services/teamService';
import { logger } from '../../../utils/logger';

export const useCoaching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachingPlans] = useState<CoachingPlan[]>([]);
  const [coachingTasks] = useState<CoachingTask[]>([]);

  // Generar fortalezas basadas en métricas
  const generateStrengths = useCallback((member: TeamMember): Strength[] => {
    const strengths: Strength[] = [];
    const metrics = member.performanceMetrics;

    if (!metrics) return strengths;

    if (metrics.csatScore >= 4.5) {
      strengths.push({
        id: '1',
        title: 'Excelente satisfacción del cliente',
        description: 'Mantiene un CSAT alto consistentemente',
        category: 'communication'
      });
    }

    if (metrics.averageResponseTime <= '2:30') {
      strengths.push({
        id: '2',
        title: 'Excelente tiempo de respuesta',
        description: 'Responde rápidamente a las consultas',
        category: 'technical'
      });
    }

    if (metrics.conversionRate >= 20) {
      strengths.push({
        id: '3',
        title: 'Alta tasa de conversión',
        description: 'Convierte efectivamente las oportunidades',
        category: 'sales'
      });
    }

    if (metrics.chatsClosedWithoutEscalation >= 80) {
      strengths.push({
        id: '4',
        title: 'Independencia en resolución',
        description: 'Resuelve la mayoría de casos sin escalación',
        category: 'technical'
      });
    }

    return strengths;
  }, []);

  // Generar áreas de mejora basadas en métricas
  const generateImprovementAreas = useCallback((member: TeamMember): ImprovementArea[] => {
    const areas: ImprovementArea[] = [];
    const metrics = member.performanceMetrics;

    if (!metrics) return areas;

    if (metrics.csatScore < 4.0) {
      areas.push({
        id: '1',
        title: 'Satisfacción del cliente',
        description: 'Necesita mejorar la satisfacción del cliente',
        priority: 'high',
        category: 'communication'
      });
    }

    if (metrics.averageResponseTime > '5:00') {
      areas.push({
        id: '2',
        title: 'Tiempo de respuesta',
        description: 'Debe reducir el tiempo de respuesta',
        priority: 'medium',
        category: 'technical'
      });
    }

    if (metrics.conversionRate < 15) {
      areas.push({
        id: '3',
        title: 'Técnicas de cierre',
        description: 'Necesita mejorar las técnicas de cierre de ventas',
        priority: 'high',
        category: 'sales'
      });
    }

    if (metrics.chatsClosedWithoutEscalation < 60) {
      areas.push({
        id: '4',
        title: 'Manejo de objeciones',
        description: 'Requiere más práctica en manejo de objeciones',
        priority: 'medium',
        category: 'technical'
      });
    }

    return areas;
  }, []);

  // Generar plan de coaching personalizado
  const generateCoachingPlan = useCallback((member: TeamMember): CoachingPlan => {
    const strengths = generateStrengths(member);
    const improvementAreas = generateImprovementAreas(member);
    
    // Generar tareas basadas en áreas de mejora
    const tasks: CoachingTask[] = improvementAreas.map((area, index) => ({
      id: `task-${index + 1}`,
      title: `Mejorar ${area.title.toLowerCase()}`,
      description: `Trabajar en ${area.description.toLowerCase()}`,
      category: area.category,
      priority: area.priority,
      duration: area.priority === 'high' ? 60 : 45,
      status: 'pending',
      dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000) // Días futuros
    }));

    return {
      id: `plan-${member.id}`,
      memberId: member.id,
      title: `Plan de desarrollo para ${member.name}`,
      duration: 7, // 7 días
      strengths,
      improvementAreas,
      tasks,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, [generateStrengths, generateImprovementAreas]);

  // Actualizar plan de coaching
  const updateCoachingPlan = useCallback(async (
    memberId: string, 
    plan: CoachingPlan
  ): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);

      const updatedMember = await teamService.updateMember(memberId, { 
        coachingPlan: plan 
      });
      
      logger.systemInfo('Coaching plan updated', { 
        memberId, 
        planId: plan.id,
        tasksCount: plan.tasks.length 
      });
      
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar plan de coaching';
      setError(errorMessage);
      logger.systemInfo('Error updating coaching plan', { error: errorMessage, memberId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar tarea específica
  const updateCoachingTask = useCallback(async (
    memberId: string, 
    taskId: string, 
    updates: Partial<CoachingTask>
  ): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el miembro actual
      const currentMember = await teamService.getMember(memberId);
      if (!currentMember.coachingPlan) {
        throw new Error('No hay plan de coaching para este miembro');
      }

      // Actualizar la tarea específica
      const updatedTasks = currentMember.coachingPlan.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );

      // Calcular progreso general
      const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
      const progress = (completedTasks / updatedTasks.length) * 100;

      const updatedPlan: CoachingPlan = {
        ...currentMember.coachingPlan,
        tasks: updatedTasks,
        progress,
        updatedAt: new Date()
      };

      const updatedMember = await teamService.updateMember(memberId, { 
        coachingPlan: updatedPlan 
      });
      
      logger.systemInfo('Coaching task updated', { 
        memberId, 
        taskId, 
        updates 
      });
      
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar tarea';
      setError(errorMessage);
      logger.systemInfo('Error updating coaching task', { error: errorMessage, memberId, taskId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Completar tarea
  const completeCoachingTask = useCallback(async (
    memberId: string, 
    taskId: string
  ): Promise<TeamMember | null> => {
    return updateCoachingTask(memberId, taskId, { 
      status: 'completed',
      completedAt: new Date()
    });
  }, [updateCoachingTask]);

  // Obtener estadísticas de coaching
  const getCoachingStats = useCallback(() => {
    return {
      totalPlans: coachingPlans.length,
      activePlans: coachingPlans.filter(plan => plan.progress < 100).length,
      completedPlans: coachingPlans.filter(plan => plan.progress >= 100).length,
      pendingTasks: coachingTasks.filter(task => task.status === 'pending').length
    };
  }, [coachingPlans, coachingTasks]);

  // Generar sugerencias de mejora
  const generateImprovementSuggestions = useCallback((member: TeamMember): string[] => {
    const suggestions: string[] = [];
    const metrics = member.performanceMetrics;

    if (!metrics) return suggestions;

    if (metrics.csatScore < 4.0) {
      suggestions.push('Practicar técnicas de comunicación empática');
      suggestions.push('Revisar casos de baja satisfacción para identificar patrones');
    }

    if (metrics.averageResponseTime > '5:00') {
      suggestions.push('Utilizar plantillas de respuesta para casos comunes');
      suggestions.push('Implementar atajos de teclado para respuestas rápidas');
    }

    if (metrics.conversionRate < 15) {
      suggestions.push('Participar en sesiones de roleplay de cierre de ventas');
      suggestions.push('Estudiar técnicas de manejo de objeciones');
    }

    if (metrics.chatsClosedWithoutEscalation < 60) {
      suggestions.push('Recibir entrenamiento en resolución de problemas complejos');
      suggestions.push('Colaborar con supervisores en casos difíciles');
    }

    return suggestions;
  }, []);

  return {
    // Estado
    loading,
    error,
    
    // Coaching
    generateStrengths,
    generateImprovementAreas,
    generateCoachingPlan,
    updateCoachingPlan,
    updateCoachingTask,
    completeCoachingTask,
    getCoachingStats,
    generateImprovementSuggestions
  };
}; 