import React, { Suspense, lazy } from 'react';
import type { Client } from '../../../../types/client';

// Cargar el componente ClientItem de manera diferida
const LazyClientCard = lazy(() => import('../ClientItem').then(module => ({ default: module.ClientItem })));

interface LazyClientCardProps {
  client: Client;
  isSelected: boolean;
  onSelect: (client: Client) => void;
  onAction: (action: string, client: Client) => void;
}

// Componente de carga
const LoadingCard: React.FC = () => (
  <div className="client-card animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="loading-skeleton loading-skeleton--avatar h-10 w-10 rounded-full"></div>
        <div className="flex-1">
          <div className="loading-skeleton loading-skeleton--text h-4 w-24 mb-1"></div>
          <div className="loading-skeleton loading-skeleton--text h-3 w-32"></div>
        </div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="loading-skeleton loading-skeleton--text h-3 w-16"></div>
      <div className="loading-skeleton loading-skeleton--text h-3 w-20"></div>
      <div className="loading-skeleton loading-skeleton--text h-3 w-28"></div>
    </div>
  </div>
);

export const LazyClientCardWrapper: React.FC<LazyClientCardProps> = (props) => {
  return (
    <Suspense fallback={<LoadingCard />}>
      <LazyClientCard {...props} />
    </Suspense>
  );
}; 