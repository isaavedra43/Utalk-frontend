import { useState, useCallback } from 'react';
import type { TeamMember, CoachingPlan, CoachingTask, Strength, ImprovementArea } from '../../../types/team';
import { teamService } from '../services/teamService';
import { logger } from '../../../utils/logger';

// Tipos adicionales para coaching
interface PerformanceMetrics {
  csatScore: number;
  averageResponseTime: string;
  conversionRate: number;
  chatsClosedWithoutEscalation: number;
}

interface CoachingRecommendation {
  id: string;
  type: 'positive' | 'improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  suggestedActions: {
    id: string;
    title: string;
    description: string;
  }[];
}

interface CoachingArea {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  suggestedActions: {
    id: string;
    title: string;
    description: string;
  }[];
}

export const useCoaching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar fortalezas basadas en métricas
  const generateStrengths = useCallback((member: TeamMember): Strength[] => {
    const strengths: Strength[] = [];
    const metrics = member.performanceMetrics;

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

  // Evaluar rendimiento del agente
  const evaluatePerformance = useCallback((metrics: PerformanceMetrics) => {
    const recommendations: CoachingRecommendation[] = [];

    // Evaluar CSAT
    if (metrics?.csatScore >= 4.5) {
      recommendations.push({
        id: 'csat-excellent',
        type: 'positive',
        title: 'Excelente CSAT',
        description: 'Tu CSAT está por encima del promedio. ¡Sigue así!',
        priority: 'low',
        suggestedActions: [
          {
            id: 'share-best-practices',
            title: 'Compartir mejores prácticas',
            description: 'Ayuda a otros agentes a mejorar su CSAT'
          }
        ]
      });
    }

    // Evaluar tiempo de respuesta
    if (metrics?.averageResponseTime <= '2:30') {
      recommendations.push({
        id: 'response-time-excellent',
        type: 'positive',
        title: 'Tiempo de respuesta excelente',
        description: 'Tu tiempo de respuesta promedio es muy bueno',
        priority: 'low',
        suggestedActions: [
          {
            id: 'mentor-others',
            title: 'Mentorear a otros',
            description: 'Ayuda a otros agentes a mejorar su velocidad'
          }
        ]
      });
    }

    // Evaluar tasa de conversión
    if (metrics?.conversionRate >= 20) {
      recommendations.push({
        id: 'conversion-excellent',
        type: 'positive',
        title: 'Tasa de conversión sobresaliente',
        description: 'Tu tasa de conversión está muy por encima del promedio',
        priority: 'low',
        suggestedActions: [
          {
            id: 'share-techniques',
            title: 'Compartir técnicas',
            description: 'Comparte tus técnicas de conversión con el equipo'
          }
        ]
      });
    }

    // Evaluar chats cerrados sin escalación
    if (metrics?.chatsClosedWithoutEscalation >= 80) {
      recommendations.push({
        id: 'escalation-excellent',
        type: 'positive',
        title: 'Excelente manejo de chats',
        description: 'Cierras la mayoría de chats sin necesidad de escalación',
        priority: 'low',
        suggestedActions: [
          {
            id: 'train-others',
            title: 'Entrenar a otros',
            description: 'Ayuda a otros agentes a mejorar su resolución'
          }
        ]
      });
    }

    return recommendations;
  }, []);

  // Identificar áreas de mejora
  const identifyImprovementAreas = useCallback((metrics: PerformanceMetrics) => {
    const areas: CoachingArea[] = [];

    // CSAT bajo
    if (metrics?.csatScore < 4.0) {
      areas.push({
        id: 'csat-improvement',
        title: 'Mejorar CSAT',
        description: 'Tu CSAT está por debajo del objetivo de 4.0',
        priority: 'high',
        suggestedActions: [
          {
            id: 'csat-training',
            title: 'Entrenamiento de CSAT',
            description: 'Completar módulo de mejora de satisfacción del cliente'
          },
          {
            id: 'review-conversations',
            title: 'Revisar conversaciones',
            description: 'Analizar conversaciones con CSAT bajo'
          }
        ]
      });
    }

    // Tiempo de respuesta alto
    if (metrics?.averageResponseTime > '5:00') {
      areas.push({
        id: 'response-time-improvement',
        title: 'Reducir tiempo de respuesta',
        description: 'Tu tiempo de respuesta promedio es superior a 5 minutos',
        priority: 'high',
        suggestedActions: [
          {
            id: 'response-training',
            title: 'Entrenamiento de velocidad',
            description: 'Completar módulo de mejora de velocidad de respuesta'
          },
          {
            id: 'optimize-workflow',
            title: 'Optimizar flujo de trabajo',
            description: 'Revisar y optimizar tu flujo de trabajo'
          }
        ]
      });
    }

    // Tasa de conversión baja
    if (metrics?.conversionRate < 15) {
      areas.push({
        id: 'conversion-improvement',
        title: 'Mejorar tasa de conversión',
        description: 'Tu tasa de conversión está por debajo del objetivo de 15%',
        priority: 'medium',
        suggestedActions: [
          {
            id: 'conversion-training',
            title: 'Entrenamiento de conversión',
            description: 'Completar módulo de técnicas de conversión'
          },
          {
            id: 'practice-scenarios',
            title: 'Practicar escenarios',
            description: 'Practicar con escenarios de conversión difíciles'
          }
        ]
      });
    }

    // Muchos chats escalados
    if (metrics?.chatsClosedWithoutEscalation < 60) {
      areas.push({
        id: 'escalation-improvement',
        title: 'Reducir escalaciones',
        description: 'Muchos de tus chats requieren escalación',
        priority: 'medium',
        suggestedActions: [
          {
            id: 'escalation-training',
            title: 'Entrenamiento de resolución',
            description: 'Completar módulo de resolución de problemas'
          },
          {
            id: 'knowledge-base',
            title: 'Revisar base de conocimientos',
            description: 'Familiarizarse con la base de conocimientos'
          }
        ]
      });
    }

    return areas;
  }, []);

  // Obtener estadísticas de coaching
  const getCoachingStats = useCallback((members: TeamMember[]) => {
    const stats = {
      totalMembers: members.length,
      membersWithPlan: 0,
      averageProgress: 0,
      completedTasks: 0,
      totalTasks: 0,
      highPriorityTasks: 0
    };

    let totalProgress = 0;
    let totalCompletedTasks = 0;
    let totalTasks = 0;
    let totalHighPriorityTasks = 0;

    members.forEach(member => {
      if (member.coachingPlan) {
        stats.membersWithPlan++;
        totalProgress += member.coachingPlan.progress;
        totalCompletedTasks += member.coachingPlan.tasks.filter(t => t.status === 'completed').length;
        totalTasks += member.coachingPlan.tasks.length;
        totalHighPriorityTasks += member.coachingPlan.tasks.filter(t => t.priority === 'high').length;
      }
    });

    stats.averageProgress = stats.membersWithPlan > 0 ? totalProgress / stats.membersWithPlan : 0;
    stats.completedTasks = totalCompletedTasks;
    stats.totalTasks = totalTasks;
    stats.highPriorityTasks = totalHighPriorityTasks;

    return stats;
  }, []);

  // Generar sugerencias de mejora
  const generateImprovementSuggestions = useCallback((member: TeamMember): string[] => {
    const suggestions: string[] = [];
    const metrics = member.performanceMetrics;

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