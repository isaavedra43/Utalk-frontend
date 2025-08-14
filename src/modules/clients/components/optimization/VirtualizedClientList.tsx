import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ClientItem } from '../ClientItem';
import type { Client } from '../../../../types/client';

interface VirtualizedClientListProps {
  clients: Client[];
  height: number;
  width: number;
  itemHeight: number;
  onClientSelect: (client: Client) => void;
  selectedClient?: Client;
  onClientAction: (action: string, client: Client) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    clients: Client[];
    onClientSelect: (client: Client) => void;
    selectedClient?: Client;
    onClientAction: (action: string, client: Client) => void;
  };
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const { clients, onClientSelect, selectedClient, onClientAction } = data;
  const client = clients[index];

  return (
    <div style={style}>
      <ClientItem
        client={client}
        isSelected={selectedClient?.id === client.id}
        onSelect={onClientSelect}
        onAction={onClientAction}
      />
    </div>
  );
};

export const VirtualizedClientList: React.FC<VirtualizedClientListProps> = ({
  clients,
  height,
  width,
  itemHeight,
  onClientSelect,
  selectedClient,
  onClientAction
}) => {
  const itemData = useMemo(() => ({
    clients,
    onClientSelect,
    selectedClient,
    onClientAction
  }), [clients, onClientSelect, selectedClient, onClientAction]);

  return (
    <List
      height={height}
      width={width}
      itemCount={clients.length}
      itemSize={itemHeight}
      itemData={itemData}
      overscanCount={5}
      className="scrollbar-thin"
    >
      {Row}
    </List>
  );
}; 