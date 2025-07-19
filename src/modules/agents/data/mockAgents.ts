// 🧪 DATOS MOCK - Módulo de Agentes y Performance
// Datos de prueba realistas para desarrollo y testing

import type { 
  Agent,
  AgentRole,
  AgentTeam,
  AgentMetrics,
  TeamMetrics,
  AIAnalysis,
  AgentStatus,
  AccessLevel,
  Channel
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
    description: 'Agente de ventas con acceso básico para atender clientes y procesar órdenes',
    level: 1,
    color: '#3B82F6',
    icon: '🧑‍💼',
    defaultPermissions: {
      ...DEFAULT_PERMISSIONS,
      canWrite: true,
      canViewAllChats: true,
      canTransferChats: true,
      canEditContacts: true
    },
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  
  {
    id: 'role_002',
    name: 'supervisor',
    displayName: 'Supervisor de Ventas',
    description: 'Supervisor con acceso a métricas del equipo y capacidad de gestión',
    level: 2,
    color: '#10B981',
    icon: '👨‍💼',
    defaultPermissions: {
      ...DEFAULT_PERMISSIONS,
      canWrite: true,
      canApprove: true,
      canViewAllChats: true,
      canAssignChats: true,
      canTransferChats: true,
      canCloseChats: true,
      canViewAllContacts: true,
      canEditContacts: true,
      canViewCampaigns: true,
      canCreateCampaigns: true,
      canViewReports: true,
      canViewTeamMetrics: true
    },
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  
  {
    id: 'role_003',
    name: 'manager',
    displayName: 'Gerente de Ventas',
    description: 'Gerente con acceso completo a analítica y configuración del equipo',
    level: 3,
    color: '#8B5CF6',
    icon: '👔',
    defaultPermissions: {
      ...DEFAULT_PERMISSIONS,
      canWrite: true,
      canDelete: true,
      canApprove: true,
      canConfigure: true,
      canViewAllChats: true,
      canAssignChats: true,
      canTransferChats: true,
      canCloseChats: true,
      canViewAllContacts: true,
      canEditContacts: true,
      canDeleteContacts: true,
      canExportContacts: true,
      canViewCampaigns: true,
      canCreateCampaigns: true,
      canEditCampaigns: true,
      canSendCampaigns: true,
      canViewCampaignStats: true,
      canViewReports: true,
      canCreateReports: true,
      canExportReports: true,
      canViewTeamMetrics: true,
      canViewCompanyMetrics: true,
      canManageTeam: true
    },
    isCustom: false,
    canBeDeleted: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  
  {
    id: 'role_004',
    name: 'admin',
    displayName: 'Administrador',
    description: 'Administrador con acceso total al sistema',
    level: 4,
    color: '#EF4444',
    icon: '⚡',
    defaultPermissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canApprove: true,
      canConfigure: true,
      canViewAllChats: true,
      canAssignChats: true,
      canTransferChats: true,
      canCloseChats: true,
      canViewChatHistory: true,
      canViewAllContacts: true,
      canEditContacts: true,
      canDeleteContacts: true,
      canExportContacts: true,
      canImportContacts: true,
      canViewCampaigns: true,
      canCreateCampaigns: true,
      canEditCampaigns: true,
      canSendCampaigns: true,
      canViewCampaignStats: true,
      canViewReports: true,
      canCreateReports: true,
      canExportReports: true,
      canViewTeamMetrics: true,
      canViewCompanyMetrics: true,
      canManageTeam: true,
      canManageIntegrations: true,
      canManageSettings: true,
      canManageBilling: true,
      canManageUsers: true,
      canUseAI: true,
      canAccessAPI: true,
      canViewAuditLogs: true,
      canManageTemplates: true,
      canManageAutomations: true
    },
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
    email: 'ana.garcia@utalk.com',
    firstName: 'Ana',
    lastName: 'García',
    fullName: 'Ana García',
    role: mockRoles[2], // Manager
    department: 'Ventas',
    title: 'Gerente de Ventas',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b796?w=150',
    phoneNumber: '+52 55 1234 5678',
    extension: '101',
    status: 'active',
    isActive: true,
    isOnline: true,
    lastActivity: new Date('2024-11-20T15:45:00Z'),
    lastLogin: new Date('2024-11-20T08:30:00Z'),
    permissions: mockRoles[2].defaultPermissions,
    accessLevel: 'advanced',
    teamIds: ['team_001'],
    enabledChannels: ['whatsapp', 'sms', 'email', 'webchat'],
    channelSettings: {
      whatsapp: {
        isEnabled: true,
        maxConcurrentChats: 8,
        autoAssign: true,
        priority: 1,
        autoResponses: {
          greeting: 'Hola, soy Ana. ¿En qué puedo ayudarte hoy?',
          away: 'Estoy momentáneamente ocupada, te responderé pronto.',
          closed: 'Nuestro horario de atención ha terminado. Te contactaremos mañana.'
        }
      },
      sms: {
        isEnabled: true,
        maxConcurrentChats: 10,
        autoAssign: true,
        priority: 2
      },
      email: {
        isEnabled: true,
        maxConcurrentChats: 15,
        autoAssign: false,
        priority: 3
      },
      webchat: {
        isEnabled: true,
        maxConcurrentChats: 5,
        autoAssign: true,
        priority: 1
      },
      facebook: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      instagram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      telegram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      phone: {
        isEnabled: true,
        maxConcurrentChats: 1,
        autoAssign: false,
        priority: 1
      }
    },
    currentMetrics: {
      totalChats: 156,
      activeChats: 3,
      completedChats: 153,
      transferredChats: 8,
      avgResponseTime: 45,
      avgResolutionTime: 720,
      firstResponseTime: 32,
      totalSales: 89,
      totalRevenue: 284750,
      avgTicketSize: 3200,
      conversionRate: 57.1,
      upsellRate: 23.4,
      crossSellRate: 18.7,
      csat: 4.6,
      nps: 78,
      qualityScore: 92,
      resolutionRate: 94.2,
      escalationRate: 5.1,
      totalMessages: 1247,
      messagesPerChat: 8.1,
      onlineHours: 7.8,
      utilization: 87.3,
      availability: 94.5,
      campaignsSent: 23,
      openRate: 68.4,
      clickRate: 24.7,
      responseRate: 31.2,
      unsubscribeRate: 1.8,
      customerRetention: 89.3,
      repeatCustomers: 67,
      referrals: 12,
      periodStart: new Date('2024-11-01T00:00:00Z'),
      periodEnd: new Date('2024-11-20T23:59:59Z'),
      lastUpdated: new Date('2024-11-20T15:45:00Z')
    },
    weeklyGoals: {
      period: 'weekly',
      targetChats: 180,
      targetResponseTime: 60,
      targetResolutionRate: 95,
      targetRevenue: 320000,
      targetSales: 100,
      targetConversionRate: 55,
      targetCSAT: 4.5,
      targetNPS: 75,
      targetQualityScore: 90,
      progress: {
        chats: {
          current: 156,
          target: 180,
          percentage: 86.7,
          status: 'on-track'
        },
        revenue: {
          current: 284750,
          target: 320000,
          percentage: 89.0,
          status: 'on-track'
        },
        csat: {
          current: 4.6,
          target: 4.5,
          percentage: 102.2,
          status: 'achieved'
        }
      },
      createdAt: new Date('2024-11-18T00:00:00Z'),
      updatedAt: new Date('2024-11-20T15:45:00Z'),
      createdBy: 'system'
    },
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:45:00Z'),
    createdBy: 'admin_001',
    updatedBy: 'admin_001',
    workingHours: {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' }
    },
    timezone: 'America/Mexico_City',
    language: 'es',
    metadata: {
      hireDate: new Date('2024-01-15T00:00:00Z'),
      birthday: new Date('1990-03-22T00:00:00Z'),
      skills: ['Ventas', 'Atención al cliente', 'CRM', 'Negociación'],
      certifications: ['Certificación en Ventas UTalk', 'Customer Service Excellence'],
      notes: 'Excelente agente con gran capacidad de conversión y satisfacción del cliente.',
      location: 'Ciudad de México, México'
    }
  },

  {
    id: 'agent_002',
    email: 'carlos.lopez@utalk.com',
    firstName: 'Carlos',
    lastName: 'López',
    fullName: 'Carlos López',
    role: mockRoles[1], // Supervisor
    department: 'Ventas',
    title: 'Supervisor de Ventas',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phoneNumber: '+52 55 2345 6789',
    extension: '102',
    status: 'active',
    isActive: true,
    isOnline: true,
    lastActivity: new Date('2024-11-20T15:30:00Z'),
    lastLogin: new Date('2024-11-20T08:15:00Z'),
    permissions: mockRoles[1].defaultPermissions,
    accessLevel: 'intermediate',
    supervisorId: 'agent_001',
    teamIds: ['team_001'],
    enabledChannels: ['whatsapp', 'sms', 'email'],
    channelSettings: {
      whatsapp: {
        isEnabled: true,
        maxConcurrentChats: 6,
        autoAssign: true,
        priority: 1
      },
      sms: {
        isEnabled: true,
        maxConcurrentChats: 8,
        autoAssign: true,
        priority: 2
      },
      email: {
        isEnabled: true,
        maxConcurrentChats: 12,
        autoAssign: false,
        priority: 3
      },
      webchat: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      facebook: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      instagram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      telegram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      phone: {
        isEnabled: true,
        maxConcurrentChats: 1,
        autoAssign: false,
        priority: 1
      }
    },
    currentMetrics: {
      totalChats: 134,
      activeChats: 2,
      completedChats: 132,
      transferredChats: 5,
      avgResponseTime: 52,
      avgResolutionTime: 840,
      firstResponseTime: 38,
      totalSales: 76,
      totalRevenue: 198450,
      avgTicketSize: 2611,
      conversionRate: 56.7,
      upsellRate: 19.8,
      crossSellRate: 15.2,
      csat: 4.4,
      nps: 72,
      qualityScore: 88,
      resolutionRate: 91.8,
      escalationRate: 6.7,
      totalMessages: 1089,
      messagesPerChat: 8.3,
      onlineHours: 7.5,
      utilization: 83.1,
      availability: 92.3,
      campaignsSent: 19,
      openRate: 64.2,
      clickRate: 22.1,
      responseRate: 28.9,
      unsubscribeRate: 2.1,
      customerRetention: 86.1,
      repeatCustomers: 58,
      referrals: 9,
      periodStart: new Date('2024-11-01T00:00:00Z'),
      periodEnd: new Date('2024-11-20T23:59:59Z'),
      lastUpdated: new Date('2024-11-20T15:30:00Z')
    },
    createdAt: new Date('2024-02-01T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:30:00Z'),
    createdBy: 'agent_001',
    workingHours: {
      monday: { isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30' },
      tuesday: { isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30' },
      wednesday: { isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30' },
      thursday: { isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30' },
      friday: { isWorkingDay: true, startTime: '08:30', endTime: '17:30', breakStart: '12:30', breakEnd: '13:30' },
      saturday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' }
    },
    timezone: 'America/Mexico_City',
    language: 'es',
    metadata: {
      hireDate: new Date('2024-02-01T00:00:00Z'),
      skills: ['Supervisión', 'Ventas', 'Gestión de equipos'],
      certifications: ['Liderazgo en Ventas'],
      notes: 'Supervisor eficaz con buenas habilidades de gestión de equipo.',
      location: 'Guadalajara, México'
    }
  },

  {
    id: 'agent_003',
    email: 'maria.rodriguez@utalk.com',
    firstName: 'María',
    lastName: 'Rodríguez',
    fullName: 'María Rodríguez',
    role: mockRoles[0], // Agent
    department: 'Ventas',
    title: 'Agente de Ventas',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    phoneNumber: '+52 55 3456 7890',
    extension: '103',
    status: 'busy',
    isActive: true,
    isOnline: true,
    lastActivity: new Date('2024-11-20T15:50:00Z'),
    lastLogin: new Date('2024-11-20T09:00:00Z'),
    permissions: mockRoles[0].defaultPermissions,
    accessLevel: 'basic',
    supervisorId: 'agent_002',
    teamIds: ['team_001'],
    enabledChannels: ['whatsapp', 'webchat'],
    channelSettings: {
      whatsapp: {
        isEnabled: true,
        maxConcurrentChats: 5,
        autoAssign: true,
        priority: 1
      },
      sms: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      email: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      webchat: {
        isEnabled: true,
        maxConcurrentChats: 4,
        autoAssign: true,
        priority: 2
      },
      facebook: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      instagram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      telegram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      phone: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      }
    },
    currentMetrics: {
      totalChats: 98,
      activeChats: 5,
      completedChats: 93,
      transferredChats: 12,
      avgResponseTime: 38,
      avgResolutionTime: 650,
      firstResponseTime: 28,
      totalSales: 52,
      totalRevenue: 134680,
      avgTicketSize: 2590,
      conversionRate: 53.1,
      upsellRate: 16.3,
      crossSellRate: 12.8,
      csat: 4.7,
      nps: 82,
      qualityScore: 94,
      resolutionRate: 89.4,
      escalationRate: 10.2,
      totalMessages: 876,
      messagesPerChat: 8.9,
      onlineHours: 8.0,
      utilization: 89.2,
      availability: 97.1,
      campaignsSent: 15,
      openRate: 71.3,
      clickRate: 26.8,
      responseRate: 33.4,
      unsubscribeRate: 1.2,
      customerRetention: 91.2,
      repeatCustomers: 43,
      referrals: 8,
      periodStart: new Date('2024-11-01T00:00:00Z'),
      periodEnd: new Date('2024-11-20T23:59:59Z'),
      lastUpdated: new Date('2024-11-20T15:50:00Z')
    },
    createdAt: new Date('2024-03-10T09:00:00Z'),
    updatedAt: new Date('2024-11-20T15:50:00Z'),
    createdBy: 'agent_002',
    workingHours: {
      monday: { isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      tuesday: { isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      wednesday: { isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      thursday: { isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      friday: { isWorkingDay: true, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      saturday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' }
    },
    timezone: 'America/Mexico_City',
    language: 'es',
    metadata: {
      hireDate: new Date('2024-03-10T00:00:00Z'),
      birthday: new Date('1995-07-18T00:00:00Z'),
      skills: ['WhatsApp', 'Chat en vivo', 'Atención al cliente'],
      certifications: ['Atención al Cliente Digital'],
      notes: 'Agente junior con excelente potencial, especializada en canales digitales.',
      location: 'Monterrey, México'
    }
  },

  {
    id: 'agent_004',
    email: 'luis.martinez@utalk.com',
    firstName: 'Luis',
    lastName: 'Martínez',
    fullName: 'Luis Martínez',
    role: mockRoles[0], // Agent
    department: 'Soporte',
    title: 'Agente de Soporte',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phoneNumber: '+52 55 4567 8901',
    extension: '104',
    status: 'inactive',
    isActive: false,
    isOnline: false,
    lastActivity: new Date('2024-11-19T17:30:00Z'),
    lastLogin: new Date('2024-11-19T08:45:00Z'),
    permissions: mockRoles[0].defaultPermissions,
    accessLevel: 'basic',
    supervisorId: 'agent_002',
    teamIds: ['team_002'],
    enabledChannels: ['email', 'phone'],
    channelSettings: {
      whatsapp: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      sms: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      email: {
        isEnabled: true,
        maxConcurrentChats: 20,
        autoAssign: true,
        priority: 1
      },
      webchat: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      facebook: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      instagram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      telegram: {
        isEnabled: false,
        maxConcurrentChats: 0,
        autoAssign: false,
        priority: 5
      },
      phone: {
        isEnabled: true,
        maxConcurrentChats: 1,
        autoAssign: false,
        priority: 2
      }
    },
    currentMetrics: {
      totalChats: 67,
      activeChats: 0,
      completedChats: 67,
      transferredChats: 3,
      avgResponseTime: 180,
      avgResolutionTime: 1440,
      firstResponseTime: 120,
      totalSales: 0,
      totalRevenue: 0,
      avgTicketSize: 0,
      conversionRate: 0,
      upsellRate: 0,
      crossSellRate: 0,
      csat: 4.2,
      nps: 65,
      qualityScore: 85,
      resolutionRate: 94.0,
      escalationRate: 4.5,
      totalMessages: 523,
      messagesPerChat: 7.8,
      onlineHours: 0,
      utilization: 0,
      availability: 0,
      campaignsSent: 0,
      openRate: 0,
      clickRate: 0,
      responseRate: 0,
      unsubscribeRate: 0,
      customerRetention: 92.5,
      repeatCustomers: 0,
      referrals: 0,
      periodStart: new Date('2024-11-01T00:00:00Z'),
      periodEnd: new Date('2024-11-20T23:59:59Z'),
      lastUpdated: new Date('2024-11-19T17:30:00Z')
    },
    createdAt: new Date('2024-04-15T09:00:00Z'),
    updatedAt: new Date('2024-11-19T17:30:00Z'),
    createdBy: 'agent_002',
    workingHours: {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorkingDay: false, startTime: '09:00', endTime: '18:00' }
    },
    timezone: 'America/Mexico_City',
    language: 'es',
    metadata: {
      hireDate: new Date('2024-04-15T00:00:00Z'),
      skills: ['Soporte técnico', 'Email', 'Resolución de problemas'],
      notes: 'Agente especializado en soporte técnico vía email y teléfono.',
      location: 'Puebla, México'
    }
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
    supervisorId: 'agent_001',
    memberIds: ['agent_001', 'agent_002', 'agent_003'],
    department: 'Ventas',
    location: 'Ciudad de México',
    timezone: 'America/Mexico_City',
    teamMetrics: {
      totalAgents: 3,
      activeAgents: 3,
      onlineAgents: 3,
      totalChats: 388,
      avgResponseTime: 45,
      avgCSAT: 4.6,
      totalRevenue: 617880,
      avgConversionRate: 55.6,
      workloadDistribution: {
        'agent_001': 40.2,
        'agent_002': 34.5,
        'agent_003': 25.3
      },
      performanceRanking: [
        {
          agentId: 'agent_003',
          rank: 1,
          score: 94.2,
          category: 'quality',
          badge: 'top-performer'
        },
        {
          agentId: 'agent_001',
          rank: 2,
          score: 91.8,
          category: 'overall',
          badge: 'consistent'
        },
        {
          agentId: 'agent_002',
          rank: 3,
          score: 87.5,
          category: 'efficiency'
        }
      ],
      vsLastPeriod: {
        chatsChange: 12.3,
        revenueChange: 18.7,
        csatChange: 0.2,
        responseTimeChange: -3.4
      }
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-11-20T15:45:00Z'),
    createdBy: 'admin_001'
  },
  
  {
    id: 'team_002',
    name: 'Equipo de Soporte',
    description: 'Equipo especializado en soporte técnico y atención al cliente',
    supervisorId: 'agent_002',
    memberIds: ['agent_004'],
    department: 'Soporte',
    location: 'Guadalajara',
    timezone: 'America/Mexico_City',
    teamMetrics: {
      totalAgents: 1,
      activeAgents: 0,
      onlineAgents: 0,
      totalChats: 67,
      avgResponseTime: 180,
      avgCSAT: 4.2,
      totalRevenue: 0,
      avgConversionRate: 0,
      workloadDistribution: {
        'agent_004': 100
      },
      performanceRanking: [
        {
          agentId: 'agent_004',
          rank: 1,
          score: 85.0,
          category: 'quality'
        }
      ],
      vsLastPeriod: {
        chatsChange: -8.2,
        revenueChange: 0,
        csatChange: 0.1,
        responseTimeChange: 5.6
      }
    },
    createdAt: new Date('2024-04-01T00:00:00Z'),
    updatedAt: new Date('2024-11-19T17:30:00Z'),
    createdBy: 'agent_002'
  }
]

/**
 * 🎯 ANÁLISIS DE IA MOCK
 */
export const mockAIAnalysis: AIAnalysis[] = [
  {
    agentId: 'agent_003',
    analysisType: 'performance',
    insights: [
      {
        id: 'insight_001',
        type: 'strength',
        title: 'Excelente tiempo de respuesta',
        description: 'María tiene el tiempo de respuesta más rápido del equipo (28s vs 45s promedio)',
        impact: 'high',
        category: 'efficiency',
        metrics: ['firstResponseTime', 'avgResponseTime'],
        confidence: 0.92
      },
      {
        id: 'insight_002',
        type: 'strength',
        title: 'Alta satisfacción del cliente',
        description: 'Su CSAT de 4.7 está por encima del objetivo de 4.5',
        impact: 'high',
        category: 'quality',
        metrics: ['csat'],
        confidence: 0.88
      },
      {
        id: 'insight_003',
        type: 'opportunity',
        title: 'Potencial de mejora en ventas',
        description: 'Puede aumentar su tasa de conversión con mejor técnicas de cierre',
        impact: 'medium',
        category: 'sales',
        metrics: ['conversionRate', 'upsellRate'],
        confidence: 0.76
      }
    ],
    recommendations: [
      {
        id: 'rec_001',
        priority: 'medium',
        title: 'Entrenamiento en técnicas de venta',
        description: 'Completar el curso "Técnicas de Cierre Efectivo" para mejorar conversión',
        actionItems: [
          'Inscribirse en el curso de técnicas de venta',
          'Practicar con simulaciones de cierre',
          'Implementar técnicas aprendidas en próximas conversaciones'
        ],
        estimatedImpact: '+15% en tasa de conversión',
        timeToImplement: '2-3 semanas',
        category: 'training'
      },
      {
        id: 'rec_002',
        priority: 'low',
        title: 'Mantener excelencia en servicio',
        description: 'Continuar con las prácticas actuales que generan alta satisfacción',
        actionItems: [
          'Documentar mejores prácticas de atención',
          'Compartir técnicas con otros agentes',
          'Mantener tiempo de respuesta actual'
        ],
        estimatedImpact: 'Mantener CSAT actual',
        timeToImplement: 'Continuo',
        category: 'process'
      }
    ],
    overallScore: 87.3,
    improvementPotential: 15.2,
    peerComparison: {
      rank: 1,
      percentile: 95,
      topPerformers: ['agent_003', 'agent_001', 'agent_002']
    },
    generatedAt: new Date('2024-11-20T10:00:00Z'),
    confidence: 0.85,
    dataPoints: 1247
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
    'inactive': 1
  },
  channelUsage: {
    'whatsapp': 2,
    'email': 2,
    'phone': 2,
    'webchat': 2,
    'sms': 1
  },
  weeklyTrends: {
    chats: [45, 52, 48, 56, 61, 58, 67],
    revenue: [12450, 14230, 13800, 15670, 16890, 16240, 18950]
  }
} 