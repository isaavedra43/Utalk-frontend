import api from './api';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

export interface Agent {
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  kpis?: any;
}

export interface AssignmentResponse {
  success: boolean;
  data: any;
  message: string;
}

export const assignmentService = {
  // Asignar conversación a un agente
  async assignConversation(conversationId: string, agentEmail: string): Promise<AssignmentResponse> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const response = await api.put(`/api/conversations/${encodedId}/assign`, {
      assignedTo: agentEmail
    });
    
    return response.data;
  },

  // Desasignar conversación
  async unassignConversation(conversationId: string): Promise<AssignmentResponse> {
    const encodedId = encodeConversationIdForUrl(conversationId);
    
    const response = await api.put(`/api/conversations/${encodedId}/unassign`);
    
    return response.data;
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
