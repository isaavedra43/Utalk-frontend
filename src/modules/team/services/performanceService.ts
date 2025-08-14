import type { PerformanceMetrics, TeamApiResponse } from '../../../types/team';
import { api } from '../../../config/api';
import { logger } from '../../../utils/logger';

// Datos mock para desarrollo
const mockPerformanceData = {
  '1': {
    chatsAttended: 145,
    csatScore: 4.5,
    conversionRate: 23.5,
    averageResponseTime: '2:15',
    messagesReplied: 342,
    chatsClosedWithoutEscalation: 89,
    trend: {
      direction: 'up' as const,
      percentage: 12.5,
      status: 'improving' as const
    }
  },
  '2': {
    chatsAttended: 98,
    csatScore: 4.5,
    conversionRate: 28.7,
    averageResponseTime: '1:45',
    messagesReplied: 234,
    chatsClosedWithoutEscalation: 76,
    trend: {
      direction: 'up' as const,
      percentage: 8.3,
      status: 'improving' as const
    }
  }
};

class PerformanceService {
  // Obtener métricas de rendimiento de un miembro
  async getMemberMetrics(memberId: string): Promise<PerformanceMetrics> {
    try {
      if (import.meta.env.DEV) {
        logger.systemInfo('Using mock performance data');
        
        const mockData = mockPerformanceData[memberId as keyof typeof mockPerformanceData];
        if (!mockData) {
          throw new Error('Métricas no encontradas para este miembro');
        }
        
        return mockData;
      }
      
      const response = await api.get<TeamApiResponse<PerformanceMetrics>>(`/team/performance/${memberId}`);
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error fetching member performance', { error, memberId });
      throw new Error('Error al obtener métricas de rendimiento');
    }
  }

  // Obtener métricas agregadas del equipo
  async getTeamMetrics(): Promise<{
    averageCSAT: number;
    averageConversionRate: number;
    averageResponseTime: string;
    totalChats: number;
    totalMessages: number;
    totalMembers: number;
    activeMembers: number;
  }> {
    try {
      if (import.meta.env.DEV) {
        logger.systemInfo('Using mock team performance data');
        
        const members = Object.values(mockPerformanceData);
        const totalChats = members.reduce((sum, m) => sum + m.chatsAttended, 0);
        const totalMessages = members.reduce((sum, m) => sum + m.messagesReplied, 0);
        const totalCSAT = members.reduce((sum, m) => sum + m.csatScore, 0);
        const totalConversion = members.reduce((sum, m) => sum + m.conversionRate, 0);
        
        // Calcular tiempo promedio de respuesta
        const responseTimes = members.map(m => {
          const [minutes, seconds] = m.averageResponseTime.split(':').map(Number);
          return minutes * 60 + seconds;
        });
        const avgResponseSeconds = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
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
          activeMembers: members.length
        };
      }
      
      const response = await api.get<TeamApiResponse<{
        averageCSAT: number;
        averageConversionRate: number;
        averageResponseTime: string;
        totalChats: number;
        totalMessages: number;
        totalMembers: number;
        activeMembers: number;
      }>>('/team/performance');
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error fetching team performance', { error });
      throw new Error('Error al obtener métricas del equipo');
    }
  }

  // Actualizar métricas de rendimiento
  async updateMemberMetrics(
    memberId: string, 
    metrics: Partial<PerformanceMetrics>
  ): Promise<PerformanceMetrics> {
    try {
      if (import.meta.env.DEV) {
        logger.systemInfo('Updating mock performance data');
        
        const currentData = mockPerformanceData[memberId as keyof typeof mockPerformanceData];
        if (!currentData) {
          throw new Error('Métricas no encontradas para este miembro');
        }
        
        const updatedData = { ...currentData, ...metrics } as PerformanceMetrics;
        (mockPerformanceData as Record<string, PerformanceMetrics>)[memberId] = updatedData;
        
        return updatedData;
      }
      
      const response = await api.put<TeamApiResponse<PerformanceMetrics>>(
        `/team/performance/${memberId}`, 
        metrics
      );
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error updating member performance', { error, memberId });
      throw new Error('Error al actualizar métricas de rendimiento');
    }
  }

  // Obtener tendencias de rendimiento
  async getPerformanceTrends(
    memberId: string, 
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<{
    dates: string[];
    csatScores: number[];
    conversionRates: number[];
    responseTimes: string[];
    chatCounts: number[];
  }> {
    try {
      if (import.meta.env.DEV) {
        logger.systemInfo('Using mock performance trends');
        
        // Generar datos de tendencia simulados
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const dates: string[] = [];
        const csatScores: number[] = [];
        const conversionRates: number[] = [];
        const responseTimes: string[] = [];
        const chatCounts: number[] = [];
        
        const baseDate = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
          
          // Generar datos simulados con variación
          csatScores.push(4.2 + Math.random() * 0.6);
          conversionRates.push(20 + Math.random() * 10);
          responseTimes.push(`${Math.floor(1 + Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`);
          chatCounts.push(Math.floor(10 + Math.random() * 20));
        }
        
        return {
          dates,
          csatScores,
          conversionRates,
          responseTimes,
          chatCounts
        };
      }
      
      const response = await api.get<TeamApiResponse<{
        dates: string[];
        csatScores: number[];
        conversionRates: number[];
        responseTimes: string[];
        chatCounts: number[];
      }>>(`/team/performance/${memberId}/trends?period=${period}`);
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error fetching performance trends', { error, memberId, period });
      throw new Error('Error al obtener tendencias de rendimiento');
    }
  }

  // Generar reporte de rendimiento
  async generatePerformanceReport(memberIds: string[]): Promise<{
    reportId: string;
    generatedAt: string;
    summary: {
      totalMembers: number;
      averageCSAT: number;
      averageConversionRate: number;
      topPerformers: string[];
      needsImprovement: string[];
    };
    details: Record<string, PerformanceMetrics>;
  }> {
    try {
      if (import.meta.env.DEV) {
        logger.systemInfo('Generating mock performance report');
        
        const details: Record<string, PerformanceMetrics> = {};
        let totalCSAT = 0;
        let totalConversion = 0;
        
        memberIds.forEach(id => {
          const metrics = mockPerformanceData[id as keyof typeof mockPerformanceData];
          if (metrics) {
            details[id] = metrics;
            totalCSAT += metrics.csatScore;
            totalConversion += metrics.conversionRate;
          }
        });
        
        const validMembers = Object.keys(details);
        const topPerformers = validMembers
          .sort((a, b) => details[b].csatScore - details[a].csatScore)
          .slice(0, 3);
        
        const needsImprovement = validMembers
          .filter(id => details[id].csatScore < 4.0)
          .slice(0, 3);
        
        return {
          reportId: `report-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          summary: {
            totalMembers: validMembers.length,
            averageCSAT: totalCSAT / validMembers.length,
            averageConversionRate: totalConversion / validMembers.length,
            topPerformers,
            needsImprovement
          },
          details
        };
      }
      
      const response = await api.post<TeamApiResponse<{
        reportId: string;
        generatedAt: string;
        summary: {
          totalMembers: number;
          averageCSAT: number;
          averageConversionRate: number;
          topPerformers: string[];
          needsImprovement: string[];
        };
        details: Record<string, PerformanceMetrics>;
      }>>('/team/performance/report', { memberIds });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error generating performance report', { error, memberIds });
      throw new Error('Error al generar reporte de rendimiento');
    }
  }
}

export const performanceService = new PerformanceService(); 