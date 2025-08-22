import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, User, Check } from 'lucide-react';
import { assignmentService, type Agent } from '../../services/assignments';
import type { ConversationDetails } from '../../types/sidebar';
import { useAssignmentEvents } from '../../hooks/useAssignmentEvents';

interface AgentAssignmentProps {
  conversationDetails: ConversationDetails;
  onAssignmentChange: (updatedConversation: Partial<ConversationDetails>) => void;
}

export const AgentAssignment: React.FC<AgentAssignmentProps> = ({
  conversationDetails,
  onAssignmentChange
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escuchar eventos de asignación en tiempo real
  useAssignmentEvents({
    onConversationAssigned: (data) => {
      // Solo actualizar si es la conversación actual
      if (data.payload.conversationId === conversationDetails.id && data.payload.assignedTo) {
        onAssignmentChange({
          assignedTo: data.payload.assignedTo.email,
          assignedToName: data.payload.assignedTo.name
        });
        setError(null);
      }
    },
    onConversationUnassigned: (data) => {
      // Solo actualizar si es la conversación actual
      if (data.payload.conversationId === conversationDetails.id) {
        onAssignmentChange({
          assignedTo: null,
          assignedToName: null
        });
        setError(null);
      }
    }
  });

  // Cargar lista de agentes disponibles
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const availableAgents = await assignmentService.getAvailableAgents();
        setAgents(availableAgents);
      } catch (err) {
        console.error('Error cargando agentes:', err);
        setError('Error al cargar agentes');
      }
    };

    loadAgents();
  }, []);

  // Asignar conversación a un agente
  const handleAssignAgent = async (agentEmail: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await assignmentService.assignConversation(
        conversationDetails.id,
        agentEmail
      );
      
      if (result.success) {
        const agent = agents.find(a => a.email === agentEmail);
        
        // Actualizar el estado local
        onAssignmentChange({
          assignedTo: agentEmail,
          assignedToName: agent?.name || agentEmail
        });
        
        setIsDropdownOpen(false);
      }
    } catch (err: any) {
      console.error('Error asignando agente:', err);
      setError(err.response?.data?.message || 'Error al asignar agente');
    } finally {
      setIsLoading(false);
    }
  };

  // Desasignar conversación
  const handleUnassignAgent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await assignmentService.unassignConversation(conversationDetails.id);
      
      if (result.success) {
        // Actualizar el estado local
        onAssignmentChange({
          assignedTo: null,
          assignedToName: null
        });
      }
    } catch (err: any) {
      console.error('Error desasignando agente:', err);
      setError(err.response?.data?.message || 'Error al desasignar agente');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">Agentes Asignados</h4>
        
        {!conversationDetails.assignedTo && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
              title="Agregar agente a la conversación"
            >
              <Plus className="w-3 h-3" />
              Agregar
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Dropdown de agentes */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Seleccionar agente:</div>
                  {agents.length === 0 ? (
                    <div className="text-xs text-gray-500 py-2">No hay agentes disponibles</div>
                  ) : (
                    <div className="space-y-1">
                      {agents.map((agent) => (
                        <button
                          key={agent.email}
                          onClick={() => handleAssignAgent(agent.email)}
                          disabled={isLoading}
                          className="w-full flex items-center gap-2 px-2 py-2 text-xs text-left hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {getInitials(agent.name)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{agent.name}</div>
                            <div className="text-gray-500">{agent.email}</div>
                          </div>
                          {agent.role === 'admin' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Admin</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {/* Mostrar agente asignado o estado sin asignar */}
      {conversationDetails.assignedTo ? (
        <div className="space-y-2">
          {/* Agente principal asignado */}
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {getInitials(conversationDetails.assignedToName || conversationDetails.assignedTo)}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900">
                  {conversationDetails.assignedToName || conversationDetails.assignedTo}
                </div>
                <div className="text-xs text-gray-500">Agente principal</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-xs text-gray-500">En línea</span>
              <button
                onClick={handleUnassignAgent}
                disabled={isLoading}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Desasignar agente"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mb-2">No hay agentes asignados</p>
          <button
            onClick={() => setIsDropdownOpen(true)}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Asignar Agente'}
          </button>
        </div>
      )}
      
      {/* Cerrar dropdown al hacer clic fuera */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};
