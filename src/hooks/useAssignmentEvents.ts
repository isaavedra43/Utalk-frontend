import { useEffect } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { infoLog } from '../config/logger';

interface AssignmentEventData {
  payload: {
    conversationId: string;
    assignedTo?: {
      email: string;
      name: string;
    };
    previousAssignee?: {
      email: string;
      name: string;
    };
  };
}

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
    const handleConversationAssigned = (data: AssignmentEventData) => {
      infoLog('🔔 Conversación asignada:', data.payload);
      
      if (onConversationAssigned) {
        onConversationAssigned(data);
      }
    };

    // Escuchar evento de desasignación
    const handleConversationUnassigned = (data: AssignmentEventData) => {
      infoLog('🔔 Conversación desasignada:', data.payload);
      
      if (onConversationUnassigned) {
        onConversationUnassigned(data);
      }
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
