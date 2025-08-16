import api from './api';
import { 
  mockDashboardData, 
  validateDashboardData, 
  transformAPIDataToDashboard,
  generateDynamicMockData 
} from '../utils/mockDashboardData';
import type { 
  DashboardData, 
  DashboardMetrics, 
  SentimentAnalysis, 
  AgentRanking, 
  DailyActivity, 
  ThemesAlerts, 
  ActivityCalendar, 
  AIInsights,
  DashboardFilters 
} from '../types/dashboard';
import type { Conversation, Message, Contact } from '../types';
import { logger, LogCategory } from '../utils/logger';

// Servicio para el módulo de Dashboard
// Reutiliza datos existentes y los transforma para el dashboard

export class DashboardService {
  private static instance: DashboardService;
  private useMockData: boolean = false; // Cambiar a false cuando tengamos datos reales

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Configurar si usar datos mock o reales
   */
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
    logger.info(LogCategory.SYSTEM, 'Dashboard service configurado', { useMockData: useMock });
  }

  /**
   * Obtiene todos los datos del dashboard
   */
  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    try {
      logger.info(LogCategory.SYSTEM, 'Obteniendo datos del dashboard', { filters, useMockData: this.useMockData });
      
      if (this.useMockData) {
        // Usar datos mock para desarrollo
        return this.getMockDashboardData(filters);
      } else {
        // Usar datos reales de la API
        return this.getRealDashboardData(filters);
      }
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener datos del dashboard', error as Error, { error });
      // En caso de error, fallback a datos mock
      return this.getMockDashboardData(filters);
    }
  }

  /**
   * Obtiene datos mock del dashboard
   */
  private async getMockDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generar datos dinámicos para testing
    const data = generateDynamicMockData();
    
    // Aplicar filtros si existen (simulado)
    // Los filtros se usarán cuando tengamos datos reales
    if (filters) {
      logger.info(LogCategory.SYSTEM, 'Filtros recibidos para datos mock (no aplicados)', { filters });
      // Aquí se aplicarían los filtros a los datos mock cuando sea necesario
    }
    
    return data;
  }

  /**
   * Obtiene datos reales del dashboard
   */
  private async getRealDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    try {
      // Obtener datos base de conversaciones y mensajes
      const [conversations, messages, contacts] = await Promise.all([
        this.getConversations(),
        this.getMessages(),
        this.getContacts()
      ]);
      
      // Los filtros se usarán cuando tengamos datos reales
      if (filters) {
        logger.info(LogCategory.SYSTEM, 'Filtros recibidos para datos reales (no aplicados)', { filters });
        // Aquí se aplicarían los filtros a los datos reales cuando sea necesario
      }

      // Transformar datos para el dashboard
      const dashboardData: DashboardData = {
        header: this.generateHeader(),
        metrics: this.calculateMetrics(conversations, messages),
        sentimentAnalysis: this.analyzeSentiment(messages),
        agentRanking: this.calculateAgentRanking(conversations, contacts),
        dailyActivity: this.calculateDailyActivity(messages),
        themesAlerts: this.detectThemes(messages),
        activityCalendar: this.generateActivityCalendar(messages),
        aiInsights: this.generateAIInsights(conversations, messages, contacts),
        lastUpdated: new Date().toISOString()
      };

      logger.info(LogCategory.SYSTEM, 'Datos reales del dashboard generados exitosamente');
      return dashboardData;
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener datos reales del dashboard', error as Error, { error });
      throw error;
    }
  }

  /**
   * Obtiene métricas principales del dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      if (this.useMockData) {
        return mockDashboardData.metrics;
      }

      const [conversations, messages] = await Promise.all([
        this.getConversations(),
        this.getMessages()
      ]);

      return this.calculateMetrics(conversations, messages);
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener métricas del dashboard', error as Error, { error });
      return mockDashboardData.metrics;
    }
  }

  /**
   * Obtiene análisis de sentimiento
   */
  async getSentimentAnalysis(): Promise<SentimentAnalysis> {
    try {
      if (this.useMockData) {
        return mockDashboardData.sentimentAnalysis;
      }

      const messages = await this.getMessages();
      return this.analyzeSentiment(messages);
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener análisis de sentimiento', error as Error, { error });
      return mockDashboardData.sentimentAnalysis;
    }
  }

  /**
   * Obtiene ranking de agentes
   */
  async getAgentRanking(): Promise<AgentRanking> {
    try {
      if (this.useMockData) {
        return mockDashboardData.agentRanking;
      }

      // No necesitamos obtener datos para el ranking de agentes mock

      return this.calculateAgentRanking([], []);
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener ranking de agentes', error as Error, { error });
      return mockDashboardData.agentRanking;
    }
  }

  /**
   * Obtiene insights de IA
   */
  async getAIInsights(): Promise<AIInsights> {
    try {
      if (this.useMockData) {
        return mockDashboardData.aiInsights;
      }

      const [conversations, messages] = await Promise.all([
        this.getConversations(),
        this.getMessages()
      ]);

      return this.generateAIInsights(conversations, messages, []);
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener insights de IA', error as Error, { error });
      return mockDashboardData.aiInsights;
    }
  }

  /**
   * Valida y transforma datos de API externa
   */
  async transformExternalAPIData(apiData: unknown): Promise<DashboardData> {
    try {
      if (validateDashboardData(apiData)) {
        logger.info(LogCategory.SYSTEM, 'Datos de API externa validados correctamente');
        return apiData;
      } else {
        logger.warn(LogCategory.SYSTEM, 'Datos de API externa no válidos, transformando...');
        return transformAPIDataToDashboard();
      }
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al transformar datos de API externa', error as Error, { error });
      return mockDashboardData;
    }
  }

  // Métodos privados para obtener datos base
  private async getConversations(): Promise<Conversation[]> {
    try {
      const response = await api.get('/conversations');
      return response.data.data || [];
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener conversaciones para dashboard', error as Error, { error });
      return [];
    }
  }

  private async getMessages(): Promise<Message[]> {
    try {
      const response = await api.get('/messages');
      return response.data.data || [];
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener mensajes para dashboard', error as Error, { error });
      return [];
    }
  }

  private async getContacts(): Promise<Contact[]> {
    try {
      const response = await api.get('/contacts');
      return response.data.data || [];
    } catch (error) {
      logger.error(LogCategory.SYSTEM, 'Error al obtener contactos para dashboard', error as Error, { error });
      return [];
    }
  }

  // Métodos privados para transformar datos
  private generateHeader() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Buenos días';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Buenas tardes';
    } else if (hour >= 18) {
      greeting = 'Buenas noches';
    }

    return {
      greeting: `${greeting}, Israel 👋`,
      currentTime: now.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }),
      lastUpdated: 'hace 2 minutos',
      searchPlaceholder: 'Buscar en dashboard...',
      user: {
        name: 'Israel',
        avatar: ''
      },
      actions: {
        aiView: true,
        refresh: true,
        notifications: 3
      }
    };
  }

  private calculateMetrics(conversations: Conversation[], messages: Message[]): DashboardMetrics {
    // Calcular sentimiento global
    const positiveMessages = messages.filter(m => this.isPositiveMessage(m)).length;
    const totalMessages = messages.length;
    const sentimentPercentage = totalMessages > 0 ? (positiveMessages / totalMessages) * 100 : 0;

    // Calcular tiempo promedio de respuesta
    const responseTimes = this.calculateResponseTimes(messages);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Calcular conversaciones resueltas
    const resolvedConversations = conversations.filter(c => c.status === 'resolved').length;

    // Calcular ventas (simulado)
    const salesAmount = this.calculateSalesFromConversations(conversations);

    return {
      globalSentiment: {
        value: Math.round(sentimentPercentage),
        previousValue: Math.round(sentimentPercentage * 0.92), // Simulado
        trend: 8.3,
        description: 'Porcentaje de interacciones positivas hoy',
        icon: '😊',
        color: 'green'
      },
      averageResponseTime: {
        value: `${avgResponseTime.toFixed(1)} min`,
        previousValue: `${(avgResponseTime * 1.3).toFixed(1)} min`,
        trend: -22.6,
        description: 'Tiempo promedio de primera respuesta',
        icon: '⏰',
        color: 'purple'
      },
      resolvedConversations: {
        value: resolvedConversations,
        previousValue: Math.round(resolvedConversations * 0.9),
        trend: 11.4,
        description: 'Conversaciones cerradas exitosamente hoy',
        icon: '✅',
        color: 'blue'
      },
      salesFromChats: {
        value: `€${salesAmount.toLocaleString()}`,
        previousValue: `€${Math.round(salesAmount * 0.79).toLocaleString()}`,
        trend: 27.0,
        description: 'Revenue generado desde conversaciones',
        icon: '📈',
        color: 'blue'
      }
    };
  }

  private analyzeSentiment(messages: Message[]): SentimentAnalysis {
    const totalMessages = messages.length;
    const positiveMessages = messages.filter(m => this.isPositiveMessage(m)).length;
    const negativeMessages = messages.filter(m => this.isNegativeMessage(m)).length;
    const neutralMessages = totalMessages - positiveMessages - negativeMessages;

    return {
      distribution: {
        positive: {
          count: positiveMessages,
          percentage: totalMessages > 0 ? (positiveMessages / totalMessages) * 100 : 0,
          color: '#10B981',
          icon: '😊'
        },
        neutral: {
          count: neutralMessages,
          percentage: totalMessages > 0 ? (neutralMessages / totalMessages) * 100 : 0,
          color: '#6B7280',
          icon: '😐'
        },
        negative: {
          count: negativeMessages,
          percentage: totalMessages > 0 ? (negativeMessages / totalMessages) * 100 : 0,
          color: '#EF4444',
          icon: '😞'
        }
      },
      byChannel: [
        {
          channel: 'WhatsApp',
          messageCount: Math.round(totalMessages * 0.48),
          positivePercentage: 58.9,
          trend: 'up',
          color: '#25D366'
        },
        {
          channel: 'Facebook',
          messageCount: Math.round(totalMessages * 0.30),
          positivePercentage: 58.6,
          trend: 'up',
          color: '#1877F2'
        },
        {
          channel: 'Web Chat',
          messageCount: Math.round(totalMessages * 0.22),
          positivePercentage: 59.3,
          trend: 'up',
          color: '#8B5CF6'
        }
      ],
      totalMessages
    };
  }

  private calculateAgentRanking(conversations: Conversation[], contacts: Contact[]): AgentRanking {
    // Los parámetros conversations y contacts se usarán cuando tengamos datos reales
    // Por ahora usamos datos simulados para el desarrollo
    // TODO: Implementar lógica real basada en conversations y contacts
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _conversations = conversations; // Para uso futuro con datos reales
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _contacts = contacts; // Para uso futuro con datos reales
    const agents: Array<{
      id: string;
      name: string;
      avatar: string;
      initials: string;
      rank: number;
      conversations: number;
      responseTime: string;
      resolvedCount: number;
      status: 'active' | 'busy' | 'absent';
      performance: number;
      lastActivity: string;
      isTopPerformer?: boolean;
      crown?: boolean;
    }> = [
      {
        id: '1',
        name: 'Ana García',
        avatar: '',
        initials: 'AG',
        rank: 1,
        conversations: 23,
        responseTime: '1.8min',
        resolvedCount: 21,
        status: 'active' as const,
        performance: 96,
        lastActivity: 'hace 17 minutos',
        isTopPerformer: true,
        crown: true
      },
      {
        id: '2',
        name: 'Carlos Ruiz',
        avatar: '',
        initials: 'CR',
        rank: 2,
        conversations: 19,
        responseTime: '2.1min',
        resolvedCount: 18,
        status: 'active' as const,
        performance: 94,
        lastActivity: 'hace 14 minutos'
      },
      {
        id: '3',
        name: 'María López',
        avatar: '',
        initials: 'ML',
        rank: 3,
        conversations: 17,
        responseTime: '2.5min',
        resolvedCount: 15,
        status: 'busy' as const,
        performance: 91,
        lastActivity: 'hace 13 minutos'
      },
      {
        id: '4',
        name: 'David Fernández',
        avatar: '',
        initials: 'DF',
        rank: 4,
        conversations: 15,
        responseTime: '3.2min',
        resolvedCount: 13,
        status: 'absent' as const,
        performance: 88,
        lastActivity: 'hace 37 minutos'
      },
      {
        id: '5',
        name: 'Laura Sánchez',
        avatar: '',
        initials: 'LS',
        rank: 5,
        conversations: 12,
        responseTime: '2.8min',
        resolvedCount: 11,
        status: 'active' as const,
        performance: 92,
        lastActivity: 'hace 8 minutos'
      }
    ];

    return {
      agents,
      totalAgents: agents.length,
      date: new Date().toLocaleDateString('es-ES')
    };
  }

  private calculateDailyActivity(messages: Message[]): DailyActivity {
    // El parámetro messages se usará cuando tengamos datos reales
    // Por ahora usamos datos simulados para el desarrollo
    // TODO: Implementar lógica real basada en messages
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _messages = messages; // Para uso futuro con datos reales
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, '0') + ':00';
      const isPeak = hour === 12 || hour === 14;
      const baseMessages = Math.floor(Math.random() * 30) + 10;
      const messages = isPeak ? baseMessages * 2 : baseMessages;
      
      return {
        hour: hourStr,
        messages,
        isPeak,
        color: isPeak ? '#1E40AF' : '#3B82F6'
      };
    });

    const totalMessages = hourlyData.reduce((sum, hour) => sum + hour.messages, 0);
    const peakHour = hourlyData.reduce((peak, hour) => 
      hour.messages > peak.messages ? hour : peak
    ).hour;

    return {
      title: 'Actividad del Día',
      subtitle: `Mensajes por hora • Pico: ${peakHour}`,
      totalMessages,
      comparison: 'vs ayer +36.0%',
      peakHour,
      chartData: hourlyData
    };
  }

  private detectThemes(messages: Message[]): ThemesAlerts {
    // El parámetro messages se usará cuando tengamos datos reales
    // Por ahora usamos datos simulados para el desarrollo
    // TODO: Implementar lógica real basada en messages
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _messages = messages; // Para uso futuro con datos reales
    const themes = [
      {
        id: '1',
        title: 'Problemas de facturación',
        icon: '⚠️',
        count: 12,
        trend: 'up' as const,
        trendValue: 12,
        severity: 'critical' as const,
        category: 'Complaint' as const,
        keywords: ['factura', 'cobro', 'cargo'],
        color: '#EF4444'
      },
      {
        id: '2',
        title: 'Problemas de entrega',
        icon: '⚠️',
        count: 23,
        trend: 'up' as const,
        trendValue: 23,
        severity: 'high' as const,
        category: 'Complaint' as const,
        keywords: ['entrega', 'retraso', 'pedido'],
        color: '#F97316'
      },
      {
        id: '3',
        title: 'Consultas sobre productos',
        icon: '❓',
        count: 45,
        trend: 'stable' as const,
        trendValue: 45,
        severity: 'medium' as const,
        category: 'Question' as const,
        keywords: ['producto', 'precio', 'disponibilidad'],
        color: '#3B82F6'
      },
      {
        id: '4',
        title: 'Felicitaciones por servicio',
        icon: '⭐',
        count: 18,
        trend: 'up' as const,
        trendValue: 18,
        severity: 'low' as const,
        category: 'Compliment' as const,
        keywords: ['excelente', 'gracias', 'satisfecho'],
        color: '#10B981'
      }
    ];

    return {
      themes,
      totalThemes: themes.length,
      activeTab: 'themes'
    };
  }

  private generateActivityCalendar(messages: Message[]): ActivityCalendar {
    // El parámetro messages se usará cuando tengamos datos reales
    // Por ahora usamos datos simulados para el desarrollo
    // TODO: Implementar lógica real basada en messages
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _messages = messages; // Para uso futuro con datos reales
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Generar días del calendario
    const days: Array<{
      date: Date;
      messageCount: number;
      intensity: number;
      isCurrentMonth: boolean;
    }> = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Agregar días del mes anterior
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({
        date,
        messageCount: Math.floor(Math.random() * 20),
        intensity: Math.floor(Math.random() * 3),
        isCurrentMonth: false
      });
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const messageCount = Math.floor(Math.random() * 50) + 10;
      const intensity = Math.min(Math.floor(messageCount / 10), 4);
      
      days.push({
        date,
        messageCount,
        intensity,
        isCurrentMonth: true
      });
    }
    
    // Agregar días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        messageCount: Math.floor(Math.random() * 20),
        intensity: Math.floor(Math.random() * 3),
        isCurrentMonth: false
      });
    }

    return {
      month: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      year: currentYear,
      totalMessages: days.reduce((sum, day) => sum + day.messageCount, 0),
      days,
      legend: {
        levels: [
          { intensity: 0, color: '#F3F4F6', label: 'Menos' },
          { intensity: 1, color: '#D1FAE5', label: '' },
          { intensity: 2, color: '#A7F3D0', label: '' },
          { intensity: 3, color: '#6EE7B7', label: '' },
          { intensity: 4, color: '#10B981', label: 'Más' }
        ]
      }
    };
  }

  private generateAIInsights(conversations: Conversation[], messages: Message[], contacts: Contact[]): AIInsights {
    // Los parámetros se usarán cuando tengamos datos reales
    // Por ahora usamos datos simulados para el desarrollo
    // TODO: Implementar lógica real basada en conversations, messages y contacts
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _conversations = conversations; // Para uso futuro con datos reales
    // @ts-expect-error -- Variable para uso futuro con datos reales
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _contacts = contacts; // Para uso futuro con datos reales
    const totalMessages = messages.length;
    const positiveSentiment = messages.filter(m => this.isPositiveMessage(m)).length;
    const sentimentPercentage = totalMessages > 0 ? (positiveSentiment / totalMessages) * 100 : 0;

    return {
      dailySummary: {
        content: `Hoy recibiste ${totalMessages} mensajes con un ${Math.round(sentimentPercentage)}% de sentimiento positivo. Ana García fue la agente más rápida con 1.8 min de respuesta promedio. Hubo un pico de mensajes a las 14:00 debido a consultas sobre la nueva promoción.`,
        confidence: 95,
        timestamp: 'hace 12 minutos',
        metrics: {
          totalMessages,
          positiveSentiment: Math.round(sentimentPercentage),
          fastestAgent: 'Ana García',
          peakHour: '14:00',
          peakReason: 'consultas sobre la nueva promoción'
        }
      },
      recommendations: [
        {
          id: '1',
          type: 'recommendation',
          title: 'Optimización recomendada',
          content: 'Se detectaron 23 casos de "problemas de entrega" con tendencia al alza. Recomiendo crear una plantilla de respuesta automática y formar al equipo en gestión de expectativas de envío.',
          confidence: 87,
          timestamp: 'hace alrededor de 2 horas',
          severity: 'high',
          tags: ['delivery', 'templates', 'training'],
          actions: {
            action: true,
            copy: true,
            details: true
          },
          icon: '💡',
          color: '#F59E0B'
        },
        {
          id: '2',
          type: 'trend',
          title: 'Tendencia positiva detectada',
          content: 'Las felicitaciones por servicio aumentaron 40% esta semana. El programa de formación en soft skills está mostrando resultados efectivos en la satisfacción del cliente.',
          confidence: 78,
          timestamp: 'hace alrededor de 4 horas',
          severity: 'low',
          tags: ['positive-trend', 'training-results'],
          actions: {
            action: false,
            copy: true,
            details: true
          },
          icon: '📈',
          color: '#10B981'
        }
      ],
      totalRecommendations: 2
    };
  }

  // Métodos auxiliares
  private isPositiveMessage(message: Message): boolean {
    const positiveWords = ['gracias', 'excelente', 'perfecto', 'genial', 'me gusta', 'bueno', 'satisfecho'];
    return positiveWords.some(word => 
      message.content.toLowerCase().includes(word)
    );
  }

  private isNegativeMessage(message: Message): boolean {
    const negativeWords = ['malo', 'terrible', 'pésimo', 'enojado', 'molesto', 'problema', 'queja'];
    return negativeWords.some(word => 
      message.content.toLowerCase().includes(word)
    );
  }

  private calculateResponseTimes(messages: Message[]): number[] {
    // Simular tiempos de respuesta
    return messages
      .filter(m => m.direction === 'outbound')
      .map(() => Math.random() * 5 + 1); // Entre 1 y 6 minutos
  }

  private calculateSalesFromConversations(conversations: Conversation[]): number {
    // Simular ventas basadas en conversaciones
    return conversations.length * 85; // €85 promedio por conversación
  }
}

// Exportar instancia singleton
export const dashboardService = DashboardService.getInstance(); 