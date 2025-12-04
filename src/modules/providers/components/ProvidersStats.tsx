import React from 'react';
import { Building2, Users, Phone, Mail, TrendingUp } from 'lucide-react';
import type { Provider } from '../types';

interface ProvidersStatsProps {
  providers: Provider[];
}

export const ProvidersStats: React.FC<ProvidersStatsProps> = ({ providers }) => {
  const stats = {
    total: providers.length,
    active: providers.filter(p => p.isActive !== false).length,
    inactive: providers.filter(p => p.isActive === false).length,
    withEmail: providers.filter(p => p.email).length,
    withAddress: providers.filter(p => p.address).length,
    withNotes: providers.filter(p => p.notes).length
  };

  const statsCards = [
    {
      title: 'Total Proveedores',
      value: stats.total,
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Activos',
      value: stats.active,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Inactivos',
      value: stats.inactive,
      icon: Building2,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Con Email',
      value: stats.withEmail,
      icon: Mail,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Con Dirección',
      value: stats.withAddress,
      icon: Building2,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Con Notas',
      value: stats.withNotes,
      icon: Phone,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
