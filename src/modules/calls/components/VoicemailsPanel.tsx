import React from 'react';
import { Voicemail, Play, Pause, Download, User, Clock, Star } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Voicemail as VoicemailType } from '../../../types/calls';

interface VoicemailsPanelProps {
  voicemails: VoicemailType[];
  loading: boolean;
  onVoicemailUpdate: (voicemail: VoicemailType) => void;
}

export const VoicemailsPanel: React.FC<VoicemailsPanelProps> = ({
  voicemails,
  loading,
  onVoicemailUpdate
}) => {
  const mockVoicemails: VoicemailType[] = [
    {
      id: '1',
      callId: '1',
      audioUrl: '/voicemails/vm-1.mp3',
      assignedTo: '1',
      priority: 'high',
      status: 'new',
      duration: 45,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
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
      case 'new': return 'text-green-600 bg-green-100';
      case 'listened': return 'text-blue-600 bg-blue-100';
      case 'replied': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voicemails</h1>
        <p className="text-gray-600 mt-1">Mensajes de voz pendientes</p>
      </div>

      <div className="space-y-4">
        {mockVoicemails.map((voicemail) => (
          <Card key={voicemail.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Voicemail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Voicemail #{voicemail.id}</h3>
                  <p className="text-sm text-gray-600">
                    Duración: {voicemail.duration}s • {voicemail.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(voicemail.priority)}>
                  {voicemail.priority === 'high' ? 'Alta' : 
                   voicemail.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
                <Badge className={getStatusColor(voicemail.status)}>
                  {voicemail.status === 'new' ? 'Nuevo' :
                   voicemail.status === 'listened' ? 'Escuchado' :
                   voicemail.status === 'replied' ? 'Respondido' : 'Archivado'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Reproducir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button variant="outline" size="sm">
                Marcar como escuchado
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

