import type { ClientMetrics } from '../../../types/client';
import { logger, LogCategory } from '../../../utils/logger';

// Mock data para métricas
const mockMetrics: ClientMetrics = {
  // Métricas generales
  totalClients: 50,
  totalValue: 8548000,
  totalOpportunities: 27,
  
  // Métricas por etapa
  stageMetrics: {
    lead: { count: 0, value: 0, averageProbability: 0 },
    prospect: { count: 0, value: 0, averageProbability: 0 },
    demo: { count: 0, value: 0, averageProbability: 0 },
    propuesta: { count: 4, value: 1697000, averageProbability: 64 },
    negociacion: { count: 23, value: 6851000, averageProbability: 78 },
    ganado: { count: 23, value: 8548000, averageProbability: 100 },
    perdido: { count: 0, value: 0, averageProbability: 0 }
  },
  
  // Métricas de contacto
  contactsToContactToday: 0,
  averageDaysToClose: 45,
  
  // Métricas de rendimiento
  winRate: 100,
  projectedRevenue: 13228990,
  
  // Métricas por agente
  agentMetrics: {
    'admin@company.com': {
      name: 'PS Pedro Sánchez',
      clientsCount: 50,
      totalValue: 8548000,
      winRate: 100,
      averageScore: 98.5
    },
    'maria@company.com': {
      name: 'MG María González',
      clientsCount: 15,
      totalValue: 2500000,
      winRate: 95,
      averageScore: 92.3
    },
    'carlos@company.com': {
      name: 'CR Carlos Ruiz',
      clientsCount: 12,
      totalValue: 1800000,
      winRate: 88,
      averageScore: 89.7
    },
    'ana@company.com': {
      name: 'AM Ana Martín',
      clientsCount: 8,
      totalValue: 1200000,
      winRate: 92,
      averageScore: 94.2
    },
    'elena@company.com': {
      name: 'ET Elena Torres',
      clientsCount: 5,
      totalValue: 800000,
      winRate: 85,
      averageScore: 87.1
    }
  },
  
  // Métricas por fuente
  sourceMetrics: {
    facebook: { count: 12, value: 1800000, conversionRate: 85 },
    linkedin: { count: 15, value: 2500000, conversionRate: 92 },
    website: { count: 8, value: 1200000, conversionRate: 78 },
    referral: { count: 6, value: 900000, conversionRate: 95 },
    cold_call: { count: 4, value: 600000, conversionRate: 65 },
    event: { count: 3, value: 450000, conversionRate: 88 },
    advertising: { count: 2, value: 300000, conversionRate: 72 }
  },
  
  // Métricas por segmento
  segmentMetrics: {
    startup: { count: 20, value: 3000000, averageValue: 150000 },
    sme: { count: 15, value: 2500000, averageValue: 166667 },
    enterprise: { count: 10, value: 2500000, averageValue: 250000 },
    freelancer: { count: 3, value: 300000, averageValue: 100000 },
    agency: { count: 2, value: 248000, averageValue: 124000 }
  },
  
  // Tendencias
  trends: {
    newClientsThisMonth: 8,
    newClientsLastMonth: 6,
    valueGrowth: 15.5,
    winRateChange: 2.3
  }
};

// Función para simular delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const metricsService = {
  // Obtener métricas del pipeline
  async getPipelineMetrics(): Promise<ClientMetrics> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas del pipeline');
      
      await delay(800);
      
      logger.info(LogCategory.API, 'Métricas del pipeline obtenidas exitosamente');
      
      return mockMetrics;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas del pipeline', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas de win rate
  async getWinRateMetrics(): Promise<{ winRate: number; winRateChange: number }> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas de win rate');
      
      await delay(300);
      
      logger.info(LogCategory.API, 'Métricas de win rate obtenidas exitosamente');
      
      return {
        winRate: mockMetrics.winRate,
        winRateChange: mockMetrics.trends.winRateChange
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas de win rate', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas de contactos
  async getContactMetrics(): Promise<{ contactsToContactToday: number; averageDaysToClose: number }> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas de contactos');
      
      await delay(300);
      
      logger.info(LogCategory.API, 'Métricas de contactos obtenidas exitosamente');
      
      return {
        contactsToContactToday: mockMetrics.contactsToContactToday,
        averageDaysToClose: mockMetrics.averageDaysToClose
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas de contactos', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas por agente
  async getAgentMetrics(): Promise<ClientMetrics['agentMetrics']> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas por agente');
      
      await delay(400);
      
      logger.info(LogCategory.API, 'Métricas por agente obtenidas exitosamente');
      
      return mockMetrics.agentMetrics;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas por agente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas por fuente
  async getSourceMetrics(): Promise<ClientMetrics['sourceMetrics']> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas por fuente');
      
      await delay(400);
      
      logger.info(LogCategory.API, 'Métricas por fuente obtenidas exitosamente');
      
      return mockMetrics.sourceMetrics;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas por fuente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas por segmento
  async getSegmentMetrics(): Promise<ClientMetrics['segmentMetrics']> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas por segmento');
      
      await delay(400);
      
      logger.info(LogCategory.API, 'Métricas por segmento obtenidas exitosamente');
      
      return mockMetrics.segmentMetrics;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas por segmento', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener tendencias
  async getTrends(): Promise<ClientMetrics['trends']> {
    try {
      logger.info(LogCategory.API, 'Obteniendo tendencias');
      
      await delay(300);
      
      logger.info(LogCategory.API, 'Tendencias obtenidas exitosamente');
      
      return mockMetrics.trends;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener tendencias', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener métricas por etapa
  async getStageMetrics(): Promise<ClientMetrics['stageMetrics']> {
    try {
      logger.info(LogCategory.API, 'Obteniendo métricas por etapa');
      
      await delay(500);
      
      logger.info(LogCategory.API, 'Métricas por etapa obtenidas exitosamente');
      
      return mockMetrics.stageMetrics;
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener métricas por etapa', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}; 