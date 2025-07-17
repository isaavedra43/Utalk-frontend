import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getSocket, getConnectionStatus, getSocketInfo } from '@/lib/socket';
import { toast } from '@/hooks/use-toast';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
  showDetailed?: boolean;
}

/**
 * 🔌 Componente para mostrar estado de conexión Socket.io en tiempo real
 */
export function ConnectionStatus({ className, showDetailed = false }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [socketInfo, setSocketInfo] = useState<any>(null);

  // Actualizar estado de conexión periódicamente
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = getConnectionStatus();
      const info = getSocketInfo();
      
      setStatus(currentStatus);
      setSocketInfo(info);
      
      if (currentStatus === 'connected') {
        setLastConnected(new Date());
        setIsReconnecting(false);
      }
    };

    // Actualizar inmediatamente
    updateStatus();

    // Actualizar cada 2 segundos
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Escuchar eventos de Socket.io para feedback inmediato
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setStatus('connected');
      setLastConnected(new Date());
      setIsReconnecting(false);
      
      if (showDetailed) {
        toast({
          title: "Conexión restablecida",
          description: "Conectado al servidor en tiempo real",
        });
      }
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
      setIsReconnecting(true);
    };

    const handleReconnect = () => {
      setStatus('connected');
      setIsReconnecting(false);
      
      toast({
        title: "Reconectado exitosamente",
        description: "La conexión ha sido restablecida",
      });
    };

    const handleReconnectError = () => {
      setIsReconnecting(false);
      
      if (showDetailed) {
        toast({
          variant: "destructive",
          title: "Error de reconexión",
          description: "No se pudo reconectar al servidor",
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_error', handleReconnectError);
    };
  }, [showDetailed]);

  // Función para intentar reconexión manual
  const handleReconnect = () => {
    setIsReconnecting(true);
    
    const token = localStorage.getItem('authToken');
    if (token) {
      import('@/lib/socket').then(({ initSocket }) => {
        initSocket(token);
      });
    }
  };

  // Obtener configuración visual según el estado
  const getStatusConfig = () => {
    if (isReconnecting) {
      return {
        icon: RefreshCw,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        text: 'Reconectando...',
        description: 'Intentando restablecer conexión'
      };
    }

    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          text: 'Conectado',
          description: 'Conexión en tiempo real activa'
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          text: 'Conectando...',
          description: 'Estableciendo conexión'
        };
      case 'disconnected':
      default:
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          text: 'Desconectado',
          description: 'Sin conexión en tiempo real'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (!showDetailed) {
    // Versión compacta - solo indicador
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === 'connected' ? 'bg-green-500' :
          status === 'connecting' || isReconnecting ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        )} />
        <span className={cn(
          "text-xs",
          config.color
        )}>
          {config.text}
        </span>
      </div>
    );
  }

  // Versión detallada
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn(
          "w-5 h-5",
          config.color,
          (isReconnecting || status === 'connecting') && "animate-spin"
        )} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={cn("text-sm font-medium", config.color)}>
              {config.text}
            </h4>
            {lastConnected && status === 'connected' && (
              <span className="text-xs text-gray-400">
                {lastConnected.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-1">
            {config.description}
          </p>

          {/* Información adicional del socket */}
          {socketInfo && status === 'connected' && (
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div>ID: {socketInfo.id?.substring(0, 8)}...</div>
              <div>Transporte: {socketInfo.transport}</div>
            </div>
          )}
        </div>

        {/* Botón de reconexión para estados desconectados */}
        {(status === 'disconnected' || status === 'connecting') && !isReconnecting && (
          <button
            onClick={handleReconnect}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Reconectar
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 🔌 Hook para obtener estado de conexión
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = getConnectionStatus();
      setStatus(currentStatus);
      
      if (currentStatus === 'connected') {
        setLastConnected(new Date());
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isDisconnected: status === 'disconnected',
    lastConnected
  };
} 