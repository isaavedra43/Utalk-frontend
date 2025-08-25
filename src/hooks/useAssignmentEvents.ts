import { useEffect } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { infoLog } from '../config/logger';
import type { AssignedAgent } from '../types/sidebar';

type AssignmentPayload = {
  conversationId: string;
  assignedTo?: { email: string; name: string };
  previousAssignee?: { email: string; name: string };
  // Nuevos campos para múltiples agentes
  assignedAgents?: AssignedAgent[];
  agentEmail?: string;
  role?: string;
  isPrimary?: boolean;
};

interface AssignmentEventData { payload: AssignmentPayload }

interface UseAssignmentEventsProps {
  onConversationAssigned?: (data: AssignmentEventData) => void;
  onConversationUnassigned?: (data: AssignmentEventData) => void;
  onAgentAssigned?: (data: AssignmentEventData) => void;
  onAgentUnassigned?: (data: AssignmentEventData) => void;
}

export const useAssignmentEvents = ({
  onConversationAssigned,
  onConversationUnassigned,
  onAgentAssigned,
  onAgentUnassigned
}: UseAssignmentEventsProps) => {
  const { socket } = useWebSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleConversationAssigned = (data: unknown) => {
      // Backend envía el payload directo; el hook antes esperaba { payload }
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Conversación asignada:', payload);
      if (!payload || !payload.conversationId) return;
      if (onConversationAssigned) onConversationAssigned({ payload });
    };

    const handleConversationUnassigned = (data: unknown) => {
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Conversación desasignada:', payload);
      if (!payload || !payload.conversationId) return;
      if (onConversationUnassigned) onConversationUnassigned({ payload });
    };

    const handleAgentAssigned = (data: unknown) => {
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Agente asignado:', payload);
      if (!payload || !payload.conversationId || !payload.agentEmail) return;
      if (onAgentAssigned) onAgentAssigned({ payload });
    };

    const handleAgentUnassigned = (data: unknown) => {
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Agente desasignado:', payload);
      if (!payload || !payload.conversationId || !payload.agentEmail) return;
      if (onAgentUnassigned) onAgentUnassigned({ payload });
    };

    // Registrar listeners
    socket.on('conversation-assigned', handleConversationAssigned);
    socket.on('conversation-unassigned', handleConversationUnassigned);
    socket.on('agent-assigned', handleAgentAssigned);
    socket.on('agent-unassigned', handleAgentUnassigned);

    // Cleanup
    return () => {
      socket.off('conversation-assigned', handleConversationAssigned);
      socket.off('conversation-unassigned', handleConversationUnassigned);
      socket.off('agent-assigned', handleAgentAssigned);
      socket.off('agent-unassigned', handleAgentUnassigned);
    };
  }, [socket, onConversationAssigned, onConversationUnassigned, onAgentAssigned, onAgentUnassigned]);
};
