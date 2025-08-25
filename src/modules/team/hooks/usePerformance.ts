import { useState, useCallback } from 'react';
import type { TeamMember, PerformanceMetrics } from '../../../types/team';
import { logger } from '../../../utils/logger';

export const usePerformance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular métricas agregadas del equipo
  const calculateTeamMetrics = useCallback((members: TeamMember[]) => {
    if (!members.length) {
      return {
        averageCSAT: 0,
        averageConversionRate: 0,
        averageResponseTime: '0:00',
        totalChats: 0,
        totalMessages: 0,
        totalMembers: 0,
        activeMembers: 0
      };
    }

    const activeMembers = members.filter(m => m.status === 'active');
    const totalChats = members.reduce((sum, m) => sum + (m.performanceMetrics?.chatsAttended || 0), 0);
    const totalMessages = members.reduce((sum, m) => sum + (m.performanceMetrics?.messagesReplied || 0), 0);
    const totalCSAT = members.reduce((sum, m) => sum + (m.performanceMetrics?.csatScore || 0), 0);
    const totalConversion = members.reduce((sum, m) => sum + (m.performanceMetrics?.conversionRate || 0), 0);

    // Calcular tiempo promedio de respuesta
    const responseTimes = members
      .filter(m => m.performanceMetrics?.averageResponseTime)
      .map(m => {
        const [minutes, seconds] = m.performanceMetrics!.averageResponseTime.split(':').map(Number);
        return minutes * 60 + seconds;
      });
    const avgResponseSeconds = responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
    const avgMinutes = Math.floor(avgResponseSeconds / 60);
    const avgSeconds = Math.floor(avgResponseSeconds % 60);
    const averageResponseTime = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;

    return {
      averageCSAT: totalCSAT / members.length,
      averageConversionRate: totalConversion / members.length,
      averageResponseTime,
      totalChats,
      totalMessages,
      totalMembers: members.length,
      activeMembers: activeMembers.length
    };
  }, []);

  // Obtener métricas de un miembro específico
  const getMemberMetrics = useCallback((member: TeamMember): PerformanceMetrics | undefined => {
    return member.performanceMetrics;
  }, []);

  // Calcular tendencias de un miembro
  const calculateMemberTrends = useCallback((member: TeamMember) => {
    const metrics = member.performanceMetrics;
    if (!metrics) {
      return {
        direction: 'stable',
        percentage: 0,
        status: 'neutral',
        isImproving: false,
        isDeclining: false,
        isStable: true
      };
    }
    const trend = metrics.trend;

    return {
      direction: trend.direction,
      percentage: trend.percentage,
      status: trend.status,
      isImproving: trend.direction === 'up',
      isDeclining: trend.direction === 'down',
      isStable: trend.direction === 'stable'
    };
  }, []);

  // Comparar métricas entre miembros
  const compareMembers = useCallback((member1: TeamMember, member2: TeamMember) => {
    const metrics1 = member1.performanceMetrics;
    const metrics2 = member2.performanceMetrics;

    if (!metrics1 || !metrics2) {
      return {
        csatDifference: 0,
        conversionDifference: 0,
        chatsDifference: 0,
        responseTimeDifference: 0
      };
    }

    return {
      csatDifference: metrics1.csatScore - metrics2.csatScore,
      conversionDifference: metrics1.conversionRate - metrics2.conversionRate,
      chatsDifference: metrics1.chatsAttended - metrics2.chatsAttended,
      responseTimeDifference: metrics1.averageResponseTime.localeCompare(metrics2.averageResponseTime)
    };
  }, []);

  // Obtener top performers
  const getTopPerformers = useCallback((members: TeamMember[], metric: keyof PerformanceMetrics, limit: number = 5) => {
    return members
      .filter(m => m.status === 'active')
      .sort((a, b) => {
        const aValue = a.performanceMetrics[metric];
        const bValue = b.performanceMetrics[metric];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return bValue.localeCompare(aValue);
        }
        
        return (bValue as number) - (aValue as number);
      })
      .slice(0, limit);
  }, []);

  // Obtener miembros que necesitan mejora
  const getMembersNeedingImprovement = useCallback((members: TeamMember[], threshold: number = 3.5) => {
    return members.filter(m => 
      m.status === 'active' && 
      m.performanceMetrics.csatScore < threshold
    );
  }, []);

  // Generar reporte de rendimiento
  const generatePerformanceReport = useCallback((members: TeamMember[]) => {
    try {
      setLoading(true);
      setError(null);

      const teamMetrics = calculateTeamMetrics(members);
      const topPerformers = getTopPerformers(members, 'csatScore', 3);
      const needsImprovement = getMembersNeedingImprovement(members);

      const report = {
        teamMetrics,
        topPerformers,
        needsImprovement,
        totalMembers: members.length,
        activeMembers: teamMetrics.activeMembers,
        inactiveMembers: members.length - teamMetrics.activeMembers,
        generatedAt: new Date().toISOString()
      };

      logger.systemInfo('Performance report generated', { report });
      return report;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar reporte';
      setError(errorMessage);
      logger.systemInfo('Error generating performance report', { error: errorMessage });
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculateTeamMetrics, getTopPerformers, getMembersNeedingImprovement]);

  return {
    // Estado
    loading,
    error,
    
    // Métricas
    calculateTeamMetrics,
    getMemberMetrics,
    calculateMemberTrends,
    compareMembers,
    getTopPerformers,
    getMembersNeedingImprovement,
    generatePerformanceReport
  };
}; 