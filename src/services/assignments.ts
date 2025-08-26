import api from './api';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

export interface Agent {
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  kpis?: unknown;
  avatar?: string;
  isOnline?: boolean;
}

export interface AssignedAgent {
  email: string;
  name: string;
  role: string;
  isPrimary: boolean;
  assignedAt: string;
  assignedBy: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface AssignmentResponse {
  success: boolean;
  data: unknown;
  message: string;
}

export const assignmentService = {
  // Obtener agentes asignados a una conversación
  async getAssignedAgents(conversationId: string): Promise<AssignedAgent[]> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const response = await api.get(`/api/conversations/${encodedId}/assigned-agents`);
    
    return response.data?.assignedAgents || [];
  },

  // Asignar conversación a un agente
  async assignConversation(conversationId: string, agentEmail: string, role: string = 'agent'): Promise<AssignmentResponse> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const response = await api.put(`/api/conversations/${encodedId}/assign`, {
      assignedTo: agentEmail,
      role: role
    });
    
    return response.data;
  },

  // Desasignar agente específico de una conversación
  async unassignAgent(conversationId: string, agentEmail: string): Promise<AssignmentResponse> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const response = await api.put(`/api/conversations/${encodedId}/unassign`, {
      agentEmail: agentEmail
    });
    
    return response.data;
  },

  // Desasignar conversación (legacy - para compatibilidad)
  async unassignConversation(conversationId: string): Promise<AssignmentResponse> {
    return this.unassignAgent(conversationId, 'all');
  },

  // Obtener lista de agentes disponibles
  async getAvailableAgents(): Promise<Agent[]> {
    const response = await api.get('/api/team');
    
    // Filtrar solo agentes activos
    const agents = response.data?.data?.users || [];
    return agents.filter((user: Agent) => 
      user.isActive && ['agent', 'admin'].includes(user.role)
    );
  }
};
