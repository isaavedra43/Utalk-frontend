import React from 'react';
import { Clock, Phone, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Callback } from '../../../types/calls';

interface CallbacksPanelProps {
  callbacks: Callback[];
  loading: boolean;
  onCallbackUpdate: (callback: Callback) => void;
}

export const CallbacksPanel: React.FC<CallbacksPanelProps> = ({
  callbacks,
  loading,
  onCallbackUpdate
}) => {
  const mockCallbacks: Callback[] = [
    {
      id: '1',
      contactId: '1',
      phoneNumber: '+52 55 1234 5678',
      requestedBy: 'Cliente',
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'high',
      notes: 'Cliente solicitó callback para consulta sobre producto premium',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Callbacks</h1>
        <p className="text-gray-600 mt-1">Llamadas programadas pendientes</p>
      </div>

      <div className="space-y-4">
        {mockCallbacks.map((callback) => (
          <Card key={callback.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{callback.phoneNumber}</h3>
                  <p className="text-sm text-gray-600">
                    Programado para: {callback.scheduledFor.toLocaleString()}
                  </p>
                  {callback.notes && (
                    <p className="text-sm text-gray-600 mt-1">{callback.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(callback.priority)}>
                  {callback.priority === 'high' ? 'Alta' : 
                   callback.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
                <Badge className={getStatusColor(callback.status)}>
                  {callback.status === 'pending' ? 'Pendiente' :
                   callback.status === 'completed' ? 'Completado' :
                   callback.status === 'cancelled' ? 'Cancelado' : 'Fallido'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Llamar ahora
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Reprogramar
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completar
              </Button>
              <Button variant="outline" size="sm">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

