import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Users,
  MessageSquare,
  FileText,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Plus,
  Minus,
  Hash,
  Asterisk,
  Hash as HashIcon
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Progress } from '../../../components/ui/progress';
import { ScrollArea } from '../../../components/ui/scroll-area';

import { SoftphoneState, TwilioDevice, Call, WebRTCConnection } from '../../../types/calls';

interface SoftphoneProps {
  state: SoftphoneState;
  onStateChange: (state: SoftphoneState) => void;
  twilioDevice: TwilioDevice;
  onDeviceChange: (device: TwilioDevice) => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    permissions: string[];
  };
}

export const Softphone: React.FC<SoftphoneProps> = ({
  state,
  onStateChange,
  twilioDevice,
  onDeviceChange,
  user
}) => {
  const [activeTab, setActiveTab] = useState('dialpad');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('disconnected');
  const [callQuality, setCallQuality] = useState({
    audioLevel: 0,
    latency: 0,
    jitter: 0
  });

  // Datos mock para el softphone
  const mockCall: Call = {
    id: '1',
    direction: 'inbound',
    from: '+52 55 1234 5678',
    to: '+1 555 0123',
    startTime: new Date(),
    status: 'in-progress',
    queueId: '1',
    agentId: user.id,
    talkTime: 0,
    holdTime: 0,
    silenceTime: 0,
    dispositions: [],
    tags: [],
    notes: '',
    transferHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockContacts = [
    { id: '1', name: 'Juan Pérez', number: '+52 55 1111 2222', company: 'Empresa ABC' },
    { id: '2', name: 'María García', number: '+52 55 3333 4444', company: 'Corporación XYZ' },
    { id: '3', name: 'Carlos López', number: '+52 55 5555 6666', company: 'Industrias DEF' },
    { id: '4', name: 'Ana Martínez', number: '+52 55 7777 8888', company: 'Servicios GHI' },
    { id: '5', name: 'Luis Rodríguez', number: '+52 55 9999 0000', company: 'Consultoría JKL' },
    { id: '6', name: 'Sofia Herrera', number: '+52 55 1234 5678', company: 'Tecnología MNO' }
  ];

  const mockDispositions = [
    'Venta realizada',
    'Interesado',
    'No interesado',
    'Callback solicitado',
    'Información enviada',
    'Escalamiento requerido'
  ];

  // Handlers
  const handleDialpadInput = useCallback((digit: string) => {
    onStateChange({
      ...state,
      dialpadValue: state.dialpadValue + digit
    });
  }, [state, onStateChange]);

  const handleCall = useCallback(() => {
    if (state.dialpadValue && twilioDevice.isConnected) {
      // Crear llamada mock con el número marcado
      const newCall: Call = {
        ...mockCall,
        id: 'call-' + Date.now(),
        direction: 'outbound',
        to: state.dialpadValue,
        from: '+1 555 0123', // Número del agente
        startTime: new Date(),
        status: 'in-progress'
      };
      
      onStateChange({
        ...state,
        currentCall: newCall,
        isConnected: true
      });
      setConnectionStatus('connected');
    }
  }, [state, onStateChange, twilioDevice.isConnected]);

  const handleHangup = useCallback(() => {
    onStateChange({
      ...state,
      currentCall: undefined,
      isConnected: false,
      isMuted: false,
      isOnHold: false,
      isRecording: false,
      dialpadValue: '',
      afterCallWork: true,
      acwTimer: 30
    });
    setConnectionStatus('disconnected');
  }, [state, onStateChange]);

  const handleMute = useCallback(() => {
    onStateChange({
      ...state,
      isMuted: !state.isMuted
    });
  }, [state, onStateChange]);

  const handleHold = useCallback(() => {
    onStateChange({
      ...state,
      isOnHold: !state.isOnHold
    });
  }, [state, onStateChange]);

  const handleRecord = useCallback(() => {
    onStateChange({
      ...state,
      isRecording: !state.isRecording
    });
  }, [state, onStateChange]);

  const handleTransfer = useCallback(() => {
    // Implementar transferencia
    console.log('Transferir llamada');
  }, []);

  const handleConference = useCallback(() => {
    // Implementar conferencia
    console.log('Agregar a conferencia');
  }, []);

  const handleAddNote = useCallback((note: string) => {
    onStateChange({
      ...state,
      notes: state.notes + '\n' + note
    });
  }, [state, onStateChange]);

  const handleAddTag = useCallback((tag: string) => {
    if (!state.tags.includes(tag)) {
      onStateChange({
        ...state,
        tags: [...state.tags, tag]
      });
    }
  }, [state, onStateChange]);

  const handleSetDisposition = useCallback((disposition: string) => {
    onStateChange({
      ...state,
      disposition
    });
  }, [state, onStateChange]);

  const handleCompleteACW = useCallback(() => {
    onStateChange({
      ...state,
      afterCallWork: false,
      acwTimer: 0,
      notes: '',
      tags: [],
      disposition: undefined
    });
  }, [state, onStateChange]);

  // Simular timer de ACW
  useEffect(() => {
    if (state.afterCallWork && state.acwTimer > 0) {
      const timer = setTimeout(() => {
        onStateChange({
          ...state,
          acwTimer: state.acwTimer - 1
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.afterCallWork, state.acwTimer, state, onStateChange]);

  // Simular calidad de llamada
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(() => {
        setCallQuality({
          audioLevel: Math.random() * 100,
          latency: Math.random() * 100,
          jitter: Math.random() * 10
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.isConnected]);

  const getSignalIcon = () => {
    if (callQuality.latency < 20) return <SignalHigh className="w-4 h-4 text-green-600" />;
    if (callQuality.latency < 50) return <SignalMedium className="w-4 h-4 text-yellow-600" />;
    if (callQuality.latency < 100) return <SignalLow className="w-4 h-4 text-orange-600" />;
    return <SignalZero className="w-4 h-4 text-red-600" />;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Softphone</h2>
              <div className="flex items-center space-x-1 lg:space-x-2">
                {twilioDevice.isConnected ? (
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <WifiOff className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">Desconectado</span>
                  </div>
                )}
                {state.isConnected && (
                  <div className="flex items-center space-x-1 ml-1 lg:ml-2">
                    {getSignalIcon()}
                    <span className="text-xs text-gray-600 hidden sm:inline">En llamada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Estado de la llamada */}
      {state.currentCall && (
        <div className="p-3 lg:p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                {state.currentCall.direction === 'inbound' ? 'Llamada entrante' : 'Llamada saliente'}
              </p>
              <p className="text-base lg:text-lg font-semibold text-blue-900 truncate">
                {state.currentCall.direction === 'inbound' ? state.currentCall.from : state.currentCall.to}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-blue-700">Duración</p>
              <p className="text-base lg:text-lg font-semibold text-blue-900">
                {formatTime(Math.floor((Date.now() - state.currentCall.startTime.getTime()) / 1000))}
              </p>
            </div>
          </div>
          
          {/* Indicadores de estado */}
          <div className="flex items-center space-x-4 mt-3">
            {state.isMuted && (
              <Badge variant="destructive" className="text-xs">
                <MicOff className="w-3 h-3 mr-1" />
                Silenciado
              </Badge>
            )}
            {state.isOnHold && (
              <Badge variant="secondary" className="text-xs">
                <Pause className="w-3 h-3 mr-1" />
                En espera
              </Badge>
            )}
            {state.isRecording && (
              <Badge variant="destructive" className="text-xs">
                <Mic className="w-3 h-3 mr-1" />
                Grabando
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* ACW Timer */}
      {state.afterCallWork && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-900">Trabajo post-llamada</p>
              <p className="text-xs text-yellow-700">Complete las tareas antes de estar disponible</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-yellow-900">
                {formatTime(state.acwTimer)}
              </p>
            </div>
          </div>
          <Progress value={(30 - state.acwTimer) / 30 * 100} className="mt-2" />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dialpad">Marcar</TabsTrigger>
            <TabsTrigger value="contacts">Contactos</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>

          <TabsContent value="dialpad" className="flex-1 p-4">
            {/* Dialpad */}
            <div className="space-y-4">
              {/* Pantalla del dialpad */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-2xl font-mono text-gray-900">
                    {state.dialpadValue || 'Ingrese número'}
                  </p>
                </div>
              </div>

              {/* Teclado */}
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['*', '0', '#']
                ].map((row, rowIndex) => (
                  <div key={rowIndex} className="flex space-x-2 lg:space-x-3">
                    {row.map((digit) => (
                      <Button
                        key={digit}
                        variant="outline"
                        size="lg"
                        className="flex-1 h-10 lg:h-12 text-base lg:text-lg font-mono"
                        onClick={() => handleDialpadInput(digit)}
                      >
                        {digit}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStateChange({ ...state, dialpadValue: state.dialpadValue.slice(0, -1) })}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStateChange({ ...state, dialpadValue: '' })}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {mockContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => onStateChange({ ...state, dialpadValue: contact.number })}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {contact.number}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Llamar directamente al contacto
                        const contactCall: Call = {
                          ...mockCall,
                          id: 'call-' + Date.now(),
                          direction: 'outbound',
                          to: contact.number,
                          from: '+1 555 0123',
                          startTime: new Date(),
                          status: 'in-progress'
                        };
                        
                        onStateChange({
                          ...state,
                          currentCall: contactCall,
                          isConnected: true,
                          dialpadValue: contact.number
                        });
                        setConnectionStatus('connected');
                      }}
                      disabled={!twilioDevice.isConnected}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 p-4">
            <div className="space-y-4">
              {/* Notas */}
              <div>
                <label className="text-sm font-medium text-gray-700">Notas de la llamada</label>
                <textarea
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                  placeholder="Agregar notas sobre la llamada..."
                  value={state.notes}
                  onChange={(e) => onStateChange({ ...state, notes: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700">Etiquetas</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {state.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => onStateChange({
                          ...state,
                          tags: state.tags.filter(t => t !== tag)
                        })}
                        className="ml-1"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tag = prompt('Agregar etiqueta:');
                      if (tag) handleAddTag(tag);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Disposición */}
              <div>
                <label className="text-sm font-medium text-gray-700">Disposición</label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                  value={state.disposition || ''}
                  onChange={(e) => handleSetDisposition(e.target.value)}
                >
                  <option value="">Seleccionar disposición</option>
                  {mockDispositions.map((disposition) => (
                    <option key={disposition} value={disposition}>
                      {disposition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Controles de llamada */}
      <div className="p-4 border-t border-gray-200">
        {!state.isConnected ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCall}
              disabled={!state.dialpadValue || !twilioDevice.isConnected}
            >
              <Phone className="w-5 h-5 mr-2" />
              {!twilioDevice.isConnected ? 'Conectando...' : 'Llamar'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Controles principales */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={state.isMuted ? "destructive" : "outline"}
                size="lg"
                onClick={handleMute}
              >
                {state.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant={state.isOnHold ? "default" : "outline"}
                size="lg"
                onClick={handleHold}
              >
                {state.isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            </div>

            {/* Controles secundarios */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecord}
                disabled={!user.permissions.includes('recording')}
              >
                {state.isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTransfer}
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConference}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Colgar */}
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={handleHangup}
            >
              <Square className="w-5 h-5 mr-2" />
              Colgar
            </Button>
          </div>
        )}

        {/* Botón completar ACW */}
        {state.afterCallWork && (
          <Button
            className="w-full mt-3"
            onClick={handleCompleteACW}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completar trabajo post-llamada
          </Button>
        )}
      </div>
    </div>
  );
};
