import { useEffect } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { infoLog } from '../config/logger';

type AssignmentPayload = {
  conversationId: string;
  assignedTo?: { email: string; name: string };
  previousAssignee?: { email: string; name: string };
};

interface AssignmentEventData { payload: AssignmentPayload }

interface UseAssignmentEventsProps {
  onConversationAssigned?: (data: AssignmentEventData) => void;
  onConversationUnassigned?: (data: AssignmentEventData) => void;
}

export const useAssignmentEvents = ({
  onConversationAssigned,
  onConversationUnassigned
}: UseAssignmentEventsProps) => {
  const { socket } = useWebSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Escuchar evento de asignación
    const handleConversationAssigned = (data: unknown) => {
      // Backend envía el payload directo; el hook antes esperaba { payload }
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Conversación asignada:', payload);
      if (!payload || !payload.conversationId) return;
      if (onConversationAssigned) onConversationAssigned({ payload });
    };

    // Escuchar evento de desasignación
    const handleConversationUnassigned = (data: unknown) => {
      const payload = (data as any)?.payload ?? (data as any);
      infoLog('🔔 Conversación desasignada:', payload);
      if (!payload || !payload.conversationId) return;
      if (onConversationUnassigned) onConversationUnassigned({ payload });
    };

    // Registrar listeners
    socket.on('conversation-assigned', handleConversationAssigned);
    socket.on('conversation-unassigned', handleConversationUnassigned);

    // Cleanup
    return () => {
      socket.off('conversation-assigned', handleConversationAssigned);
      socket.off('conversation-unassigned', handleConversationUnassigned);
    };
  }, [socket, onConversationAssigned, onConversationUnassigned]);
};
