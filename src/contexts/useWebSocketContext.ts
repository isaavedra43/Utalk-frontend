import { useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

// Hook para usar el context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}; 