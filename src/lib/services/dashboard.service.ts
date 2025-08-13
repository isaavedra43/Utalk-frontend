/**
 * Dashboard Service - UTalk
 * Servicio para obtener datos del dashboard con simulación realista
 *
 * Features:
 * - Datos simulados realistas para desarrollo
 * - Métodos async que simulan llamadas a API
 * - Generación de datos consistentes con fechas
 * - Filtros funcionales
 * - Cache y optimización
 */

import type {
  ActivityData,
  AgentData,
  AIInsight,
  DashboardFilters,
  EmergingTopic,
  KPIData,
  SentimentData
} from '$lib/types/dashboard';

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

const MOCK_DELAY = 500; // Simular latencia de red (ms)
const CHANNELS: ('whatsapp' | 'facebook' | 'webchat' | 'email')[] = [
  'whatsapp',
  'facebook',
  'webchat',
  'email'
];
const AGENT_NAMES = [
  'Ana García',
  'Carlos López',
  'María Rodriguez',
  'José Martínez',
  'Sofía Hernández',
  'Diego Torres',
  'Laura Morales',
  'Miguel Ángel'
];

// Función para simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para generar datos consistentes basados en fecha
const generateSeed = (date: Date) => {
  return date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
};

// Función random con seed para consistencia
const seededRandom = (seed: number, min: number = 0, max: number = 1) => {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return min + random * (max - min);
};

// ============================================================================
// GENERADORES DE DATOS MOCK
// ============================================================================

/**
 * Genera datos de KPIs realistas
 */
export const generateKPIData = (): KPIData[] => {
  return [
    {
      id: 'sentiment-global',
      title: 'Sentimiento Global',
      value: '78%',
      previousValue: '72%',
      change: 8.3,
      changeType: 'increase',
      icon: 'Smile',
      color: 'green',
      description: 'Porcentaje de interacciones positivas hoy'
    },
    {
      id: 'response-time',
      title: 'Tiempo de Respuesta',
      value: '2.3min',
      previousValue: '2.8min',
      change: -17.9,
      changeType: 'increase', // Disminución es buena para tiempo de respuesta
      icon: 'Clock',
      color: 'blue',
      description: 'Tiempo promedio de primera respuesta'
    },
    {
      id: 'resolution-rate',
      title: 'Tasa de Resolución',
      value: '94%',
      previousValue: '91%',
      change: 3.3,
      changeType: 'increase',
      icon: 'CheckCircle',
      color: 'green',
      description: 'Casos resueltos en primer contacto'
    },
    {
      id: 'active-conversations',
      title: 'Conversaciones Activas',
      value: '127',
      previousValue: '142',
      change: -10.6,
      changeType: 'decrease',
      icon: 'MessageCircle',
      color: 'yellow',
      description: 'Conversaciones en curso ahora mismo'
    }
  ];
};

/**
 * Genera datos de actividad por horas
 */
export const generateActivityData = (): ActivityData[] => {
  const _today = new Date();
  const data: ActivityData[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const timestamp = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate(), hour);
    const seed = generateSeed(timestamp) + hour;

    // Patrón realista de actividad (más alta durante horas laborales)
    let baseActivity = 50;
    if (hour >= 9 && hour <= 18) {
      baseActivity = 150; // Horas laborales
    } else if (hour >= 19 && hour <= 22) {
      baseActivity = 100; // Tarde
    }

    const messages = Math.floor(seededRandom(seed, baseActivity * 0.7, baseActivity * 1.3));
    const previousDay = Math.floor(seededRandom(seed + 1000, messages * 0.8, messages * 1.2));

    data.push({
      hour: hour.toString().padStart(2, '0') + ':00',
      messages,
      previousDay,
      timestamp
    });
  }

  return data;
};

/**
 * Genera datos de agentes
 */
export const generateAgentData = (): AgentData[] => {
  const _today = new Date();
  const seed = generateSeed(_today);

  return AGENT_NAMES.map((name, index) => {
    const agentSeed = seed + index * 100;
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('');

    // Estados realistas (más agentes activos durante horas laborales)
    const hour = new Date().getHours();
    let statusProb;
    if (hour >= 9 && hour <= 18) {
      statusProb = seededRandom(agentSeed, 0, 1);
    } else {
      statusProb = seededRandom(agentSeed, 0.3, 1);
    }

    let status: AgentData['status'];
    if (statusProb < 0.6) status = 'active';
    else if (statusProb < 0.8) status = 'busy';
    else if (statusProb < 0.95) status = 'away';
    else status = 'inactive';

    return {
      id: `agent-${index + 1}`,
      name,
      initials,
      conversationsHandled: Math.floor(seededRandom(agentSeed + 1, 15, 35)),
      averageResponseTime: parseFloat(seededRandom(agentSeed + 2, 1.2, 4.5).toFixed(1)),
      satisfactionRate: Math.floor(seededRandom(agentSeed + 3, 85, 98)),
      totalResolved: Math.floor(seededRandom(agentSeed + 5, 10, 30)),
      rank: index + 1,
      status,
      lastActivity: new Date(Date.now() - seededRandom(agentSeed + 4, 0, 3600000)), // Última hora
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`
    };
  });
};

/**
 * Genera datos de sentimiento por canal
 */
export const generateSentimentData = (): SentimentData[] => {
  const _today = new Date();
  const seed = generateSeed(_today);

  return CHANNELS.map((channel, index) => {
    const channelSeed = seed + index * 200;
    const total = Math.floor(seededRandom(channelSeed, 100, 500));
    const positive = Math.floor(seededRandom(channelSeed + 1, total * 0.4, total * 0.8));
    const negative = Math.floor(seededRandom(channelSeed + 2, total * 0.05, total * 0.25));

    return {
      channel,
      channelName: channel.charAt(0).toUpperCase() + channel.slice(1),
      positive,
      neutral: total - positive - negative,
      negative,
      totalMessages: total,
      color: getChannelColor(channel)
    };
  });
};

/**
 * Genera temas emergentes detectados por IA
 */
export const generateEmergingTopics = (): EmergingTopic[] => {
  const topics = [
    'Problemas con pagos',
    'Consultas sobre envíos',
    'Solicitudes de reembolso',
    'Dudas sobre productos',
    'Quejas sobre servicio'
  ];

  const _today = new Date();
  const seed = generateSeed(_today);

  return topics.map((topic, index) => {
    const topicSeed = seed + index * 300;

    return {
      id: `topic-${index + 1}`,
      topic,
      frequency: Math.floor(seededRandom(topicSeed, 25, 150)),
      sentiment:
        seededRandom(topicSeed + 1, 0, 1) > 0.7
          ? 'negative'
          : seededRandom(topicSeed + 1, 0, 1) > 0.4
            ? 'neutral'
            : 'positive',
      category: ['complaint', 'question', 'compliment', 'suggestion'][
        Math.floor(seededRandom(topicSeed + 2, 0, 4))
      ],
      keywords: [`keyword-${index}-1`, `keyword-${index}-2`],
      trend: seededRandom(topicSeed + 3, 0, 1) > 0.6 ? 'rising' : 'stable',
      priority: seededRandom(topicSeed + 4, 0, 1) > 0.8 ? 'high' : 'medium'
    } as EmergingTopic;
  });
};

/**
 * Genera insights de IA
 */
export const generateAIInsights = (): AIInsight[] => {
  const insights = [
    {
      type: 'summary' as const,
      title: 'Resumen del Día',
      content:
        'Las consultas sobre envíos aumentaron 35% comparado con ayer. Se recomienda reforzar el equipo de logística.',
      confidence: 92
    },
    {
      type: 'alert' as const,
      title: 'Cliente VIP en Riesgo',
      content: 'El cliente "Empresa ABC" no ha tenido contacto en 15 días. Valor: $45,000 anuales.',
      confidence: 87
    },
    {
      type: 'recommendation' as const,
      title: 'Optimización de Horarios',
      content:
        'La carga de trabajo entre 14:00-16:00 supera la capacidad. Considerar redistribuir turnos.',
      confidence: 94
    }
  ];

  const _today = new Date();

  return insights.map(
    (insight, index) =>
      ({
        id: `insight-${index + 1}`,
        ...insight,
        actionable: insight.type !== 'summary',
        priority: insight.confidence > 90 ? 'high' : 'medium',
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Última hora
        tags: [`tag-${index + 1}`]
      }) as AIInsight
  );
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getChannelColor(channel: string): string {
  const colors: Record<string, string> = {
    WhatsApp: '#25d366',
    Facebook: '#1877f2',
    Instagram: '#e4405f',
    Telegram: '#0088cc',
    'Web Chat': '#6366f1'
  };
  return colors[channel] || '#6b7280';
}

// ============================================================================
// API PRINCIPAL DEL SERVICIO
// ============================================================================

export const dashboardService = {
  /**
   * Obtiene todos los KPIs
   */
  async getKPIs(_filters?: DashboardFilters): Promise<KPIData[]> {
    await delay(MOCK_DELAY);
    return generateKPIData();
  },

  /**
   * Obtiene datos de actividad
   */
  async getActivity(_filters?: DashboardFilters): Promise<ActivityData[]> {
    await delay(MOCK_DELAY);
    return generateActivityData();
  },

  /**
   * Obtiene datos de agentes
   */
  async getAgents(_filters?: DashboardFilters): Promise<AgentData[]> {
    await delay(MOCK_DELAY);
    return generateAgentData();
  },

  /**
   * Obtiene datos de sentimiento
   */
  async getSentiment(_filters?: DashboardFilters): Promise<SentimentData[]> {
    await delay(MOCK_DELAY);
    return generateSentimentData();
  },

  /**
   * Obtiene temas emergentes
   */
  async getEmergingTopics(_filters?: DashboardFilters): Promise<EmergingTopic[]> {
    await delay(MOCK_DELAY);
    return generateEmergingTopics();
  },

  /**
   * Obtiene insights de IA
   */
  async getAIInsights(_filters?: DashboardFilters): Promise<AIInsight[]> {
    await delay(MOCK_DELAY);
    return generateAIInsights();
  },

  /**
   * Carga todos los datos del dashboard de una vez
   */
  async getAllDashboardData(_filters?: DashboardFilters) {
    const [kpis, activity, agents, sentiment, topics, insights] = await Promise.all([
      this.getKPIs(_filters),
      this.getActivity(_filters),
      this.getAgents(_filters),
      this.getSentiment(_filters),
      this.getEmergingTopics(_filters),
      this.getAIInsights(_filters)
    ]);

    return {
      kpis,
      activity,
      agents,
      sentiment,
      topics,
      insights,
      lastUpdated: new Date()
    };
  },

  /**
   * Simula actualización en tiempo real de un KPI específico
   */
  async updateKPI(kpiId: string): Promise<KPIData | null> {
    await delay(200);
    const kpis = generateKPIData();
    return kpis.find(kpi => kpi.id === kpiId) || null;
  },

  /**
   * Simula actualización del estado de un agente
   */
  async updateAgentStatus(_agentId: string, _status: AgentData['status']): Promise<boolean> {
    await delay(300);
    return true; // Simula éxito
  }
};

export default dashboardService;
