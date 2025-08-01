// 🧪 DATOS MOCK - Módulo de Agentes y Performance
// Datos de prueba realistas para desarrollo y testing

import type { 
  Agent,
  AgentRole,
  AgentTeam,
  AIAnalysis
} from '../types'
import { DEFAULT_PERMISSIONS } from '../types'


/**
 * 🎯 ROLES MOCK
 */
export const mockRoles: AgentRole[] = [
  {
    id: 'role_001',
    name: 'agent',
    displayName: 'Agente de Ventas',
    permissions: ['basic'],
    description: 'Agente de ventas con acceso básico para atender clientes y procesar órdenes',
    level: 1,
    color: '#3B82F6',
    icon: '🧑‍💼',
    defaultPermissions: DEFAULT_PERMISSIONS,
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'role_002',
    name: 'supervisor',
    displayName: 'Supervisor de Ventas',
    permissions: ['supervisor'],
    description: 'Supervisor con acceso a métricas del equipo y capacidad de gestión',
    level: 2,
    color: '#10B981',
    icon: '👨‍💼',
    defaultPermissions: DEFAULT_PERMISSIONS,
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'role_003',
    name: 'manager',
    displayName: 'Gerente de Ventas',
    permissions: ['manager'],
    description: 'Gerente con acceso completo a analítica y configuración del equipo',
    level: 3,
    color: '#8B5CF6',
    icon: '👔',
    defaultPermissions: DEFAULT_PERMISSIONS,
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'role_004',
    name: 'admin',
    displayName: 'Administrador',
    permissions: ['admin'],
    description: 'Administrador con acceso total al sistema',
    level: 4,
    color: '#EF4444',
    icon: '⚡',
    defaultPermissions: DEFAULT_PERMISSIONS,
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  }
]

/**
 * 🎯 AGENTES MOCK
 */
export const mockAgents: Agent[] = [
  {
    id: 'agent_001',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@utalk.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b796?w=150',
    isActive: true,
    lastSeen: new Date('2024-11-20T15:45:00Z'),
    title: 'Gerente de Ventas',
    department: 'Ventas',
    role: 'manager',
    status: 'online',
    isOnline: true,
    maxConcurrentTickets: 8,
    skills: ['Ventas', 'CRM'],
    performance: {
      totalTickets: 156,
      activeTickets: 3,
      completedTickets: 153,
      transferredTickets: 8,
      avgResponseTime: 45,
      satisfactionScore: 4.6
    },
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:45:00Z')
  },

  {
    id: 'agent_002',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@utalk.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isActive: true,
    lastSeen: new Date('2024-11-20T15:30:00Z'),
    title: 'Supervisor de Ventas',
    department: 'Ventas',
    role: 'supervisor',
    status: 'online',
    isOnline: true,
    maxConcurrentTickets: 6,
    skills: ['Supervisión', 'Ventas'],
    performance: {
      totalTickets: 134,
      activeTickets: 2,
      completedTickets: 132,
      transferredTickets: 5,
      avgResponseTime: 52,
      satisfactionScore: 4.4
    },
    createdAt: new Date('2024-02-01T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:30:00Z')
  },

  {
    id: 'agent_003',
    firstName: 'María',
    lastName: 'Rodríguez',
    email: 'maria.rodriguez@utalk.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    isActive: true,
    lastSeen: new Date('2024-11-20T15:50:00Z'),
    title: 'Agente de Ventas',
    department: 'Ventas',
    role: 'agent',
    status: 'online',
    isOnline: true,
    maxConcurrentTickets: 5,
    skills: ['WhatsApp', 'Chat en vivo'],
    performance: {
      totalTickets: 98,
      activeTickets: 5,
      completedTickets: 93,
      transferredTickets: 12,
      avgResponseTime: 38,
      satisfactionScore: 4.7
    },
    createdAt: new Date('2024-03-10T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:50:00Z')
  },

  {
    id: 'agent_004',
    firstName: 'Luis',
    lastName: 'Martínez',
    email: 'luis.martinez@utalk.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isActive: false,
    lastSeen: new Date('2024-11-19T17:30:00Z'),
    title: 'Agente de Soporte',
    department: 'Soporte',
    role: 'agent',
    status: 'offline',
    isOnline: false,
    maxConcurrentTickets: 20,
    skills: ['Soporte técnico', 'Email'],
    performance: {
      totalTickets: 67,
      activeTickets: 0,
      completedTickets: 67,
      transferredTickets: 3,
      avgResponseTime: 180,
      satisfactionScore: 4.2
    },
    createdAt: new Date('2024-04-15T09:00:00Z'),
    updatedAt: new Date('2024-11-19T17:30:00Z')
  }
]

/**
 * 🎯 EQUIPOS MOCK
 */
export const mockTeams: AgentTeam[] = [
  {
    id: 'team_001',
    name: 'Equipo de Ventas México',
    description: 'Equipo principal de ventas para el mercado mexicano',
    leaderId: 'agent_001',
    members: ['agent_001', 'agent_002', 'agent_003'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-11-20T15:45:00Z')
  },
  
  {
    id: 'team_002',
    name: 'Equipo de Soporte',
    description: 'Equipo especializado en soporte técnico y atención al cliente',
    leaderId: 'agent_004',
    members: ['agent_004'],
    createdAt: new Date('2024-04-01T00:00:00Z'),
    updatedAt: new Date('2024-11-19T17:30:00Z')
  }
]

/**
 * 🎯 ANÁLISIS DE IA MOCK
 */
export const mockAIAnalysis: AIAnalysis[] = [
  {
    id: 'ai_001',
    agentId: 'agent_003',
    analysisType: 'performance',
    insights: [
      'Excelente tiempo de respuesta',
      'Alta satisfacción del cliente',
      'Potencial de mejora en ventas'
    ],
    recommendations: [
      'Entrenamiento en técnicas de venta',
      'Mantener excelencia en servicio'
    ],
    score: 87.3,
    createdAt: new Date('2024-11-20T10:00:00Z')
  }
]

/**
 * 🎯 ESTADÍSTICAS GLOBALES MOCK
 */
export const mockAgentStats = {
  totalAgents: 4,
  activeAgents: 3,
  onlineAgents: 3,
  avgCSAT: 4.5,
  totalRevenue: 617880,
  avgResponseTime: 74,
  avgConversionRate: 55.6,
  topPerformers: mockAgents.slice(0, 3),
  departmentBreakdown: {
    'Ventas': 3,
    'Soporte': 1
  },
  statusBreakdown: {
    'active': 2,
    'busy': 1,
    'offline': 1
  },
  channelUsage: {
    'whatsapp': 2,
    'email': 2,
    'phone': 2,
    'support': 2,
    'sms': 1
  },
  weeklyTrends: {
    tickets: [45, 52, 48, 56, 61, 58, 67],
    revenue: [12450, 14230, 13800, 15670, 16890, 16240, 18950]
  }
} 