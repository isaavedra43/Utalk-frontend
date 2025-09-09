import React from 'react';
import { Phone, Clock, Users, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CallTray } from '../../../types/calls';

interface CallTraysProps {
  trays: CallTray[];
}

export const CallTrays: React.FC<CallTraysProps> = ({ trays }) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bandejas de Llamadas</h1>
        <p className="text-gray-600 mt-1">Organización de llamadas por estado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trays.map((tray) => (
          <Card key={tray.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{tray.name}</h3>
              <Badge variant="secondary">{tray.calls.length}</Badge>
            </div>
            <div className="space-y-3">
              {tray.calls.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {call.direction === 'inbound' ? call.from : call.to}
                    </p>
                    <p className="text-xs text-gray-600">
                      {call.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {tray.calls.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  +{tray.calls.length - 5} más
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

