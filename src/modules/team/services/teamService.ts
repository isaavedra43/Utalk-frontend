import type { TeamMember, TeamFilters, TeamListResponse, TeamApiResponse } from '../../../types/team';
import { api } from '../../../config/api';
import { logger } from '../../../utils/logger';

// Datos mock para desarrollo
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    initials: 'MG',
    name: 'M',
    fullName: 'María García López',
    email: 'maria.garcia@company.com',
    role: 'Ejecutivo WhatsApp Senior',
    status: 'active',
    permissions: [
      {
        id: '1',
        name: 'read',
        displayName: 'Leer',
        description: 'Ver conversaciones y datos de clientes',
        level: 'advanced',
        isActive: true,
        icon: 'book'
      },
      {
        id: '2',
        name: 'write',
        displayName: 'Escribir',
        description: 'Enviar mensajes y responder a clientes',
        level: 'advanced',
        isActive: true,
        icon: 'pencil'
      },
      {
        id: '3',
        name: 'approve',
        displayName: 'Aprobar',
        description: 'Aprobar campañas y decisiones importantes',
        level: 'intermediate',
        isActive: true,
        icon: 'check'
      },
      {
        id: '4',
        name: 'configure',
        displayName: 'Configurar',
        description: 'Acceso a configuración del sistema',
        level: 'basic',
        isActive: true,
        icon: 'gear'
      }
    ],
    performanceMetrics: {
      chatsAttended: 145,
      csatScore: 4.5,
      conversionRate: 23.5,
      averageResponseTime: '2:15',
      messagesReplied: 342,
      chatsClosedWithoutEscalation: 89,
      trend: {
        direction: 'up',
        percentage: 12.5,
        status: 'improving'
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    initials: 'CL',
    name: 'C.',
    fullName: 'Carlos López',
    email: 'carlos.lopez@company.com',
    role: 'Supervisor',
    status: 'active',
    permissions: [
      {
        id: '1',
        name: 'read',
        displayName: 'Leer',
        description: 'Ver conversaciones y datos de clientes',
        level: 'advanced',
        isActive: true,
        icon: 'book'
      },
      {
        id: '2',
        name: 'write',
        displayName: 'Escribir',
        description: 'Enviar mensajes y responder a clientes',
        level: 'advanced',
        isActive: true,
        icon: 'pencil'
      },
      {
        id: '3',
        name: 'approve',
        displayName: 'Aprobar',
        description: 'Aprobar campañas y decisiones importantes',
        level: 'intermediate',
        isActive: true,
        icon: 'check'
      },
      {
        id: '4',
        name: 'configure',
        displayName: 'Configurar',
        description: 'Acceso a configuración del sistema',
        level: 'basic',
        isActive: true,
        icon: 'gear'
      }
    ],
    performanceMetrics: {
      chatsAttended: 98,
      csatScore: 4.5,
      conversionRate: 28.7,
      averageResponseTime: '1:45',
      messagesReplied: 234,
      chatsClosedWithoutEscalation: 67,
      trend: {
        direction: 'up',
        percentage: 8.3,
        status: 'improving'
      }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  }
];

class TeamService {
  // Obtener miembros del equipo
  async getMembers(filters: TeamFilters = {}): Promise<TeamListResponse> {
    try {
      // En desarrollo, usar datos mock
      if (import.meta.env.DEV) {
        logger.systemInfo('Using mock team data');
        
        let filteredMembers = [...mockTeamMembers];
        
        // Aplicar filtros
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMembers = filteredMembers.filter(member =>
            member.fullName.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            member.role.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.status && filters.status !== 'all') {
          filteredMembers = filteredMembers.filter(member => member.status === filters.status);
        }
        
        return {
          members: filteredMembers,
          pagination: {
            page: 1,
            limit: 10,
            total: filteredMembers.length,
            totalPages: 1
          },
          filters
        };
      }
      
      // En producción, hacer llamada a la API
      const response = await api.get<TeamApiResponse<TeamListResponse>>('/team/members', {
        params: filters
      });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error fetching team members', { error });
      throw new Error('Error al obtener miembros del equipo');
    }
  }
  
  // Obtener miembro específico
  async getMember(id: string): Promise<TeamMember> {
    try {
      if (import.meta.env.DEV) {
        const member = mockTeamMembers.find(m => m.id === id);
        if (!member) {
          throw new Error('Miembro no encontrado');
        }
        return member;
      }
      
      const response = await api.get<TeamApiResponse<TeamMember>>(`/team/members/${id}`);
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error fetching team member', { error, memberId: id });
      throw new Error('Error al obtener miembro del equipo');
    }
  }
  
  // Actualizar miembro
  async updateMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    try {
      if (import.meta.env.DEV) {
        const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
        if (memberIndex === -1) {
          throw new Error('Miembro no encontrado');
        }
        
        mockTeamMembers[memberIndex] = {
          ...mockTeamMembers[memberIndex],
          ...updates,
          updatedAt: new Date()
        };
        
        return mockTeamMembers[memberIndex];
      }
      
      const response = await api.put<TeamApiResponse<TeamMember>>(`/team/members/${id}`, updates);
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error updating team member', { error, memberId: id });
      throw new Error('Error al actualizar miembro del equipo');
    }
  }
}

export const teamService = new TeamService(); 