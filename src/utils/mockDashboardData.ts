import type { 
  DashboardData, 
  DashboardMetrics, 
  SentimentAnalysis, 
  AgentRanking, 
  DailyActivity, 
  ThemesAlerts, 
  ActivityCalendar, 
  AIInsights,
  DashboardHeader 
} from '../types/dashboard';

// Datos de prueba realistas para el dashboard
// Estos datos están estructurados para ser compatibles con datos reales de la API

export const mockDashboardHeader: DashboardHeader = {
  greeting: 'Buenas noches, Israel 👋',
  currentTime: '11 de agosto, 20:58',
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

export const mockDashboardMetrics: DashboardMetrics = {
  globalSentiment: {
    value: 78,
    previousValue: 72,
    trend: 8.3,
    description: 'Porcentaje de interacciones positivas hoy',
    icon: '😊',
    color: 'green'
  },
  averageResponseTime: {
    value: '2.4 min',
    previousValue: '3.1 min',
    trend: -22.6,
    description: 'Tiempo promedio de primera respuesta',
    icon: '⏰',
    color: 'purple'
  },
  resolvedConversations: {
    value: 147,
    previousValue: 132,
    trend: 11.4,
    description: 'Conversaciones cerradas exitosamente hoy',
    icon: '✅',
    color: 'blue'
  },
  salesFromChats: {
    value: '€12,450',
    previousValue: '€9,800',
    trend: 27.0,
    description: 'Revenue generado desde conversaciones',
    icon: '📈',
    color: 'blue'
  }
};

export const mockSentimentAnalysis: SentimentAnalysis = {
  distribution: {
    positive: {
      count: 301,
      percentage: 58.9,
      color: '#10B981',
      icon: '😊'
    },
    neutral: {
      count: 157,
      percentage: 30.7,
      color: '#6B7280',
      icon: '😐'
    },
    negative: {
      count: 53,
      percentage: 10.4,
      color: '#EF4444',
      icon: '😞'
    }
  },
  byChannel: [
    {
      channel: 'WhatsApp',
      messageCount: 246,
      positivePercentage: 58.9,
      trend: 'up',
      color: '#25D366'
    },
    {
      channel: 'Facebook',
      messageCount: 152,
      positivePercentage: 58.6,
      trend: 'up',
      color: '#1877F2'
    },
    {
      channel: 'Web Chat',
      messageCount: 113,
      positivePercentage: 59.3,
      trend: 'up',
      color: '#8B5CF6'
    }
  ],
  totalMessages: 511
};

export const mockAgentRanking: AgentRanking = {
  agents: [
    {
      id: '1',
      name: 'Ana García',
      avatar: '',
      initials: 'AG',
      rank: 1,
      conversations: 23,
      responseTime: '1.8min',
      resolvedCount: 21,
      status: 'active',
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
      status: 'active',
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
      status: 'busy',
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
      status: 'absent',
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
      status: 'active',
      performance: 92,
      lastActivity: 'hace 8 minutos'
    }
  ],
  totalAgents: 5,
  date: new Date().toLocaleDateString('es-ES')
};

export const mockDailyActivity: DailyActivity = {
  title: 'Actividad del Día',
  subtitle: 'Mensajes por hora • Pico: 12:00',
  totalMessages: 1174,
  comparison: 'vs ayer +36.0%',
  peakHour: '12:00',
  chartData: [
    { hour: '00:00', messages: 15, isPeak: false, color: '#3B82F6' },
    { hour: '01:00', messages: 8, isPeak: false, color: '#3B82F6' },
    { hour: '02:00', messages: 5, isPeak: false, color: '#3B82F6' },
    { hour: '03:00', messages: 3, isPeak: false, color: '#3B82F6' },
    { hour: '04:00', messages: 2, isPeak: false, color: '#3B82F6' },
    { hour: '05:00', messages: 4, isPeak: false, color: '#3B82F6' },
    { hour: '06:00', messages: 12, isPeak: false, color: '#3B82F6' },
    { hour: '07:00', messages: 25, isPeak: false, color: '#3B82F6' },
    { hour: '08:00', messages: 45, isPeak: false, color: '#3B82F6' },
    { hour: '09:00', messages: 67, isPeak: false, color: '#3B82F6' },
    { hour: '10:00', messages: 89, isPeak: false, color: '#3B82F6' },
    { hour: '11:00', messages: 78, isPeak: false, color: '#3B82F6' },
    { hour: '12:00', messages: 92, isPeak: true, color: '#1E40AF' },
    { hour: '13:00', messages: 85, isPeak: false, color: '#3B82F6' },
    { hour: '14:00', messages: 88, isPeak: true, color: '#1E40AF' },
    { hour: '15:00', messages: 76, isPeak: false, color: '#3B82F6' },
    { hour: '16:00', messages: 82, isPeak: false, color: '#3B82F6' },
    { hour: '17:00', messages: 95, isPeak: false, color: '#3B82F6' },
    { hour: '18:00', messages: 73, isPeak: false, color: '#3B82F6' },
    { hour: '19:00', messages: 58, isPeak: false, color: '#3B82F6' },
    { hour: '20:00', messages: 42, isPeak: false, color: '#3B82F6' },
    { hour: '21:00', messages: 35, isPeak: false, color: '#3B82F6' },
    { hour: '22:00', messages: 28, isPeak: false, color: '#3B82F6' },
    { hour: '23:00', messages: 18, isPeak: false, color: '#3B82F6' }
  ]
};

export const mockThemesAlerts: ThemesAlerts = {
  themes: [
    {
      id: '1',
      title: 'Problemas de facturación',
      icon: '⚠️',
      count: 12,
      trend: 'up',
      trendValue: 12,
      severity: 'critical',
      category: 'Complaint',
      keywords: ['factura', 'cobro', 'cargo'],
      color: '#EF4444'
    },
    {
      id: '2',
      title: 'Problemas de entrega',
      icon: '⚠️',
      count: 23,
      trend: 'up',
      trendValue: 23,
      severity: 'high',
      category: 'Complaint',
      keywords: ['entrega', 'retraso', 'pedido'],
      color: '#F97316'
    },
    {
      id: '3',
      title: 'Consultas sobre productos',
      icon: '❓',
      count: 45,
      trend: 'stable',
      trendValue: 45,
      severity: 'medium',
      category: 'Question',
      keywords: ['producto', 'precio', 'disponibilidad'],
      color: '#3B82F6'
    },
    {
      id: '4',
      title: 'Felicitaciones por servicio',
      icon: '⭐',
      count: 18,
      trend: 'up',
      trendValue: 18,
      severity: 'low',
      category: 'Compliment',
      keywords: ['excelente', 'gracias', 'satisfecho'],
      color: '#10B981'
    }
  ],
  totalThemes: 4,
  activeTab: 'themes'
};

export const mockActivityCalendar: ActivityCalendar = {
  month: 'agosto 2025',
  year: 2025,
  totalMessages: 629,
  days: generateCalendarDays(),
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

export const mockAIInsights: AIInsights = {
  dailySummary: {
    content: 'Hoy recibiste 347 mensajes con un 78% de sentimiento positivo. Ana García fue la agente más rápida con 1.8 min de respuesta promedio. Hubo un pico de mensajes a las 14:00 debido a consultas sobre la nueva promoción.',
    confidence: 95,
    timestamp: 'hace 12 minutos',
    metrics: {
      totalMessages: 347,
      positiveSentiment: 78,
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
    },
    {
      id: '3',
      type: 'alert',
      title: 'Cliente en riesgo crítico',
      content: 'Elena Torres (VIP, €15K valor) no ha tenido contacto en 7 días tras múltiples quejas sin resolver. Riesgo de cancelación: 85%. Acción inmediata requerida.',
      confidence: 92,
      timestamp: 'hace 42 minutos',
      severity: 'critical',
      tags: ['vip-customer', 'churn-risk', 'urgent'],
      actions: {
        action: true,
        copy: true,
        details: true
      },
      icon: '🚨',
      color: '#EF4444'
    }
  ],
  totalRecommendations: 3
};

// Función para generar días del calendario
function generateCalendarDays() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
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
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    days.push({
      date,
      messageCount: Math.floor(Math.random() * 20),
      intensity: Math.floor(Math.random() * 3),
      isCurrentMonth: false
    });
  }

  return days;
}

// Datos completos del dashboard
export const mockDashboardData: DashboardData = {
  header: mockDashboardHeader,
  metrics: mockDashboardMetrics,
  sentimentAnalysis: mockSentimentAnalysis,
  agentRanking: mockAgentRanking,
  dailyActivity: mockDailyActivity,
  themesAlerts: mockThemesAlerts,
  activityCalendar: mockActivityCalendar,
  aiInsights: mockAIInsights,
  lastUpdated: new Date().toISOString()
};

// Función para generar datos dinámicos (útil para testing)
export function generateDynamicMockData(): DashboardData {
  return {
    ...mockDashboardData,
    lastUpdated: new Date().toISOString(),
    metrics: {
      ...mockDashboardMetrics,
      globalSentiment: {
        ...mockDashboardMetrics.globalSentiment,
        value: Math.floor(Math.random() * 20) + 70, // 70-90%
        trend: (Math.random() - 0.5) * 20 // -10 a +10
      }
    }
  };
}

// Función para validar datos (útil para datos reales)
export function validateDashboardData(data: unknown): data is DashboardData {
  return !!(
    data &&
    typeof data === 'object' &&
    'header' in data &&
    'metrics' in data &&
    'sentimentAnalysis' in data &&
    'agentRanking' in data &&
    'dailyActivity' in data &&
    'themesAlerts' in data &&
    'activityCalendar' in data &&
    'aiInsights' in data &&
    'lastUpdated' in data
  );
}

// Función para transformar datos de API a formato del dashboard
export function transformAPIDataToDashboard(): DashboardData {
  // Esta función se usará cuando tengamos datos reales de la API
  // Por ahora retorna los datos mock
  return mockDashboardData;
} 