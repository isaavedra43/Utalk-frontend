import React from 'react';
import { WebSocketStatus } from './WebSocketStatus';

export const ConnectionStatus: React.FC = () => {
  return <WebSocketStatus showDetails={true} />;
}; 