import { useMemo } from 'react';

// Tipos genéricos para estadísticas
export interface BaseStats {
  total: number;
  active: number;
  inactive: number;
}

export interface PerformanceStats {
  averageScore: number;
  totalValue: number;
  conversionRate: number;
}

// Hook genérico para estadísticas básicas
export function useBaseStats(
  items: Array<{ status?: string; [key: string]: unknown }>,
  statusField: string = 'status',
  activeValue: string = 'active',
  inactiveValue: string = 'inactive'
) {
  return useMemo(() => {
    const total = items.length;
    const active = items.filter(item => item[statusField] === activeValue).length;
    const inactive = items.filter(item => item[statusField] === inactiveValue).length;

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      inactivePercentage: total > 0 ? (inactive / total) * 100 : 0
    };
  }, [items, statusField, activeValue, inactiveValue]);
}

// Hook para estadísticas de rendimiento
export function usePerformanceStats(
  items: Array<{ [key: string]: unknown }>,
  config: {
    scoreField: string;
    valueField: string;
    conversionField?: string;
  }
) {
  return useMemo(() => {
    if (items.length === 0) {
      return {
        averageScore: 0,
        totalValue: 0,
        conversionRate: 0,
        topPerformers: [],
        needsImprovement: []
      };
    }

    const scores = items.map(item => Number(item[config.scoreField]) || 0);
    const values = items.map(item => Number(item[config.valueField]) || 0);
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const totalValue = values.reduce((sum, value) => sum + value, 0);
    
    let conversionRate = 0;
    if (config.conversionField) {
      const conversions = items.map(item => Number(item[config.conversionField!]) || 0);
      conversionRate = conversions.reduce((sum, conv) => sum + conv, 0) / conversions.length;
    }

    // Top performers (top 20%)
    const sortedByScore = [...items].sort((a, b) => 
      (Number(b[config.scoreField]) || 0) - (Number(a[config.scoreField]) || 0)
    );
    const topCount = Math.ceil(items.length * 0.2);
    const topPerformers = sortedByScore.slice(0, topCount);

    // Necesitan mejora (score < promedio)
    const needsImprovement = items.filter(item => 
      (Number(item[config.scoreField]) || 0) < averageScore
    );

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topPerformers,
      needsImprovement
    };
  }, [items, config]);
}

// Hook para estadísticas de tendencias
export function useTrendStats(
  items: Array<{ [key: string]: unknown }>,
  dateField: string,
  valueField: string,
  period: '7d' | '30d' | '90d' = '30d'
) {
  return useMemo(() => {
    const now = new Date();
    const periodMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }[period];

    const cutoffDate = new Date(now.getTime() - periodMs);

    const recentItems = items.filter(item => {
      const itemDate = new Date(String(item[dateField]));
      return itemDate >= cutoffDate;
    });

    const oldItems = items.filter(item => {
      const itemDate = new Date(String(item[dateField]));
      return itemDate < cutoffDate;
    });

    const recentValue = recentItems.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
    const oldValue = oldItems.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);

    const growth = oldValue > 0 ? ((recentValue - oldValue) / oldValue) * 100 : 0;

    return {
      recentCount: recentItems.length,
      oldCount: oldItems.length,
      recentValue,
      oldValue,
      growth: Math.round(growth * 100) / 100,
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
  }, [items, dateField, valueField, period]);
}

// Hook específico para estadísticas de clientes
export function useClientStats(clients: Array<{ 
  status?: string; 
  score?: number; 
  expectedValue?: number; 
  probability?: number; 
  createdAt?: string | Date;
  [key: string]: unknown;
}>) {
  const baseStats = useBaseStats(clients, 'status', 'active', 'inactive');
  const performanceStats = usePerformanceStats(clients, {
    scoreField: 'score',
    valueField: 'expectedValue',
    conversionField: 'probability'
  });
  const trendStats = useTrendStats(clients, 'createdAt', 'expectedValue', '30d');

  return {
    ...baseStats,
    ...performanceStats,
    ...trendStats
  };
}

// Hook específico para estadísticas de equipo
export function useTeamStats(members: Array<{ 
  status?: string; 
  performanceMetrics?: { 
    csatScore?: number; 
    conversionRate?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}>) {
  const baseStats = useBaseStats(members, 'status', 'active', 'inactive');
  const performanceStats = usePerformanceStats(members, {
    scoreField: 'performanceMetrics.csatScore',
    valueField: 'performanceMetrics.conversionRate'
  });

  return {
    ...baseStats,
    ...performanceStats
  };
} 