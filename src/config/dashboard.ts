// Configuración del módulo de Dashboard

export const DASHBOARD_CONFIG = {
  // Configuración de datos
  data: {
    useMockData: true, // Cambiar a false para datos reales
    refreshInterval: 30000, // 30 segundos
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
  },

  // Configuración de gráficos
  charts: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      warning: '#F97316',
      success: '#10B981',
      neutral: '#6B7280',
    },
    animation: {
      duration: 300,
      easing: 'ease-in-out',
    },
    responsive: {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280,
      },
    },
  },

  // Configuración de métricas
  metrics: {
    updateInterval: 10000, // 10 segundos
    thresholds: {
      sentiment: {
        low: 50,
        medium: 70,
        high: 85,
      },
      responseTime: {
        excellent: 1, // minutos
        good: 2,
        acceptable: 3,
        poor: 5,
      },
      resolution: {
        excellent: 90, // porcentaje
        good: 80,
        acceptable: 70,
        poor: 60,
      },
    },
  },

  // Configuración de agentes
  agents: {
    statusColors: {
      active: '#10B981',
      busy: '#F59E0B',
      absent: '#EF4444',
      offline: '#6B7280',
    },
    performanceLevels: {
      excellent: { min: 90, color: '#10B981' },
      good: { min: 80, color: '#3B82F6' },
      average: { min: 70, color: '#F59E0B' },
      poor: { min: 0, color: '#EF4444' },
    },
  },

  // Configuración de sentimiento
  sentiment: {
    keywords: {
      positive: [
        'gracias', 'excelente', 'perfecto', 'genial', 'me gusta', 
        'bueno', 'satisfecho', 'feliz', 'contento', 'agradecido'
      ],
      negative: [
        'malo', 'terrible', 'pésimo', 'enojado', 'molesto', 
        'problema', 'queja', 'insatisfecho', 'frustrado', 'decepcionado'
      ],
      neutral: [
        'pregunta', 'consulta', 'información', 'duda', 'ayuda'
      ],
    },
    channels: {
      whatsapp: { color: '#25D366', name: 'WhatsApp' },
      facebook: { color: '#1877F2', name: 'Facebook' },
      webchat: { color: '#8B5CF6', name: 'Web Chat' },
      email: { color: '#EA4335', name: 'Email' },
      phone: { color: '#34A853', name: 'Teléfono' },
    },
  },

  // Configuración de temas y alertas
  themes: {
    severityLevels: {
      critical: { color: '#EF4444', priority: 1 },
      high: { color: '#F97316', priority: 2 },
      medium: { color: '#F59E0B', priority: 3 },
      low: { color: '#10B981', priority: 4 },
    },
    categories: {
      complaint: { icon: '⚠️', color: '#EF4444' },
      question: { icon: '❓', color: '#3B82F6' },
      compliment: { icon: '⭐', color: '#10B981' },
      request: { icon: '📝', color: '#8B5CF6' },
    },
  },

  // Configuración de IA
  ai: {
    confidenceThresholds: {
      high: 90,
      medium: 70,
      low: 50,
    },
    updateFrequency: 5 * 60 * 1000, // 5 minutos
    maxRecommendations: 10,
  },

  // Configuración de testing
  testing: {
    enabled: (typeof import.meta !== 'undefined' ? import.meta.env.DEV : false),
    mockDataRefresh: 5000, // 5 segundos
    errorSimulation: {
      enabled: false,
      probability: 0.1, // 10% de probabilidad
    },
  },

  // Configuración de exportación
  export: {
    formats: ['pdf', 'csv', 'json'],
    dateFormat: 'DD/MM/YYYY HH:mm',
    timezone: 'America/Mexico_City',
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    types: {
      critical: { sound: true, popup: true },
      warning: { sound: false, popup: true },
      info: { sound: false, popup: false },
    },
  },
};

// Tipos de configuración
export type DashboardConfig = typeof DASHBOARD_CONFIG;

// Funciones de utilidad para la configuración
export const getMetricColor = (value: number, metric: 'sentiment' | 'responseTime' | 'resolution'): string => {
  const thresholds = DASHBOARD_CONFIG.metrics.thresholds[metric];
  
  if (metric === 'sentiment') {
    const sentimentThresholds = thresholds as { low: number; medium: number; high: number };
    if (value >= sentimentThresholds.high) return DASHBOARD_CONFIG.charts.colors.success;
    if (value >= sentimentThresholds.medium) return DASHBOARD_CONFIG.charts.colors.primary;
    if (value >= sentimentThresholds.low) return DASHBOARD_CONFIG.charts.colors.warning;
    return DASHBOARD_CONFIG.charts.colors.danger;
  }
  
  if (metric === 'resolution') {
    const resolutionThresholds = thresholds as { excellent: number; good: number; acceptable: number; poor: number };
    if (value >= resolutionThresholds.excellent) return DASHBOARD_CONFIG.charts.colors.success;
    if (value >= resolutionThresholds.good) return DASHBOARD_CONFIG.charts.colors.primary;
    if (value >= resolutionThresholds.acceptable) return DASHBOARD_CONFIG.charts.colors.warning;
    return DASHBOARD_CONFIG.charts.colors.danger;
  }
  
  if (metric === 'responseTime') {
    const responseTimeThresholds = thresholds as { excellent: number; good: number; acceptable: number; poor: number };
    if (value <= responseTimeThresholds.excellent) return DASHBOARD_CONFIG.charts.colors.success;
    if (value <= responseTimeThresholds.good) return DASHBOARD_CONFIG.charts.colors.primary;
    if (value <= responseTimeThresholds.acceptable) return DASHBOARD_CONFIG.charts.colors.warning;
    return DASHBOARD_CONFIG.charts.colors.danger;
  }
  
  return DASHBOARD_CONFIG.charts.colors.neutral;
};

export const getAgentPerformanceLevel = (performance: number) => {
  const levels = DASHBOARD_CONFIG.agents.performanceLevels;
  
  if (performance >= levels.excellent.min) return 'excellent';
  if (performance >= levels.good.min) return 'good';
  if (performance >= levels.average.min) return 'average';
  return 'poor';
};

export const getSentimentKeywords = (text: string): 'positive' | 'negative' | 'neutral' => {
  const keywords = DASHBOARD_CONFIG.sentiment.keywords;
  const lowerText = text.toLowerCase();
  
  const positiveCount = keywords.positive.filter(word => lowerText.includes(word)).length;
  const negativeCount = keywords.negative.filter(word => lowerText.includes(word)).length;
  const neutralCount = keywords.neutral.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > neutralCount) return 'positive';
  if (negativeCount > positiveCount && negativeCount > neutralCount) return 'negative';
  return 'neutral';
}; 