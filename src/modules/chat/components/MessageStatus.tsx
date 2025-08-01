// Componente de estados de mensaje tipo WhatsApp
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, Clock, Check, CheckCheck, X, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

interface MessageStatusProps {
  status: MessageStatus
  timestamp: Date | string
  error?: string
  onRetry?: () => void
  showTimestamp?: boolean
  isOwn?: boolean
  className?: string
}

export function MessageStatus({
  status,
  timestamp,
  error,
  onRetry,
  showTimestamp = true,
  className = ''
}: MessageStatusProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // ✅ Obtener configuración del icono según estado
  const getStatusConfig = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-gray-400',
          animation: 'animate-pulse',
          label: 'Enviando...',
          description: 'El mensaje se está enviando'
        }
      case 'sent':
        return {
          icon: Check,
          color: 'text-gray-500',
          animation: '',
          label: 'Enviado',
          description: 'El mensaje ha sido enviado'
        }
      case 'delivered':
        return {
          icon: CheckCheck,
          color: 'text-blue-500',
          animation: '',
          label: 'Entregado',
          description: 'El mensaje ha sido entregado'
        }
      case 'read':
        return {
          icon: CheckCheck,
          color: 'text-blue-600',
          animation: '',
          label: 'Leído',
          description: 'El mensaje ha sido leído'
        }
      case 'failed':
        return {
          icon: X,
          color: 'text-red-500',
          animation: '',
          label: 'Falló',
          description: error || 'Error al enviar el mensaje'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          animation: '',
          label: 'Desconocido',
          description: 'Estado desconocido'
        }
    }
  }

  // ✅ Formatear timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    
    try {
      const now = new Date()
      const timeDiff = now.getTime() - date.getTime()
      
      // Si es menos de 1 minuto, mostrar "ahora"
      if (timeDiff < 60000) {
        return 'ahora'
      }
      
      // Si es menos de 1 hora, mostrar "hace X minutos"
      if (timeDiff < 3600000) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es })
      }
      
      // Si es hoy, mostrar hora
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      // Si es ayer o antes, mostrar fecha
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return ''
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon
  const formattedTime = formatTimestamp(timestamp)

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Timestamp */}
      {showTimestamp && formattedTime && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formattedTime}
        </span>
      )}
      
      {/* Icono de estado */}
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon 
          className={`w-4 h-4 ${config.color} ${config.animation}`}
          
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
            {config.description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
      
      {/* Botón de reintentar para mensajes fallidos */}
      {status === 'failed' && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="p-1 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Reintentar envío"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}

// ✅ Hook para gestionar estados de mensaje
export function useMessageStatus() {
  const [retryingMessages, setRetryingMessages] = useState<Set<string>>(new Set())

  const handleRetry = async (messageId: string, retryFn: () => Promise<void>) => {
    if (retryingMessages.has(messageId)) return

    setRetryingMessages(prev => new Set(prev).add(messageId))
    
    try {
      await retryFn()
    } catch (error) {
      console.error('Error retrying message:', error)
    } finally {
      setRetryingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  const isRetrying = (messageId: string) => retryingMessages.has(messageId)

  return {
    handleRetry,
    isRetrying
  }
}

// ✅ Componente de typing indicator con estado
export function TypingIndicator({ 
  users, 
  className = '' 
}: { 
  users: Array<{ name: string; email: string }>
  className?: string 
}) {
  if (users.length === 0) return null

  return (
    <div className={`flex items-center space-x-2 p-3 ${className}`}>
      {/* Animación de puntos */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      {/* Texto de usuarios escribiendo */}
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {users.length === 1
          ? `${users[0].name} está escribiendo...`
          : `${users.length} usuarios están escribiendo...`}
      </span>
    </div>
  )
}

// ✅ Componente de indicador de conexión
export function ConnectionStatus({ 
  isConnected, 
  isReconnecting = false, 
  className = '' 
}: { 
  isConnected: boolean
  isReconnecting?: boolean
  className?: string 
}) {
  if (isConnected && !isReconnecting) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600 dark:text-green-400">En línea</span>
      </div>
    )
  }

  if (isReconnecting) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-yellow-600 dark:text-yellow-400">Reconectando...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span className="text-xs text-red-600 dark:text-red-400">Sin conexión</span>
    </div>
  )
}

// ✅ Utilidad para obtener icono de estado
export function getStatusIcon(status: MessageStatus): {
  icon: any
  color: string
  label: string
} {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        color: 'text-gray-400',
        label: 'Enviando'
      }
    case 'sent':
      return {
        icon: Check,
        color: 'text-gray-500',
        label: 'Enviado'
      }
    case 'delivered':
      return {
        icon: CheckCheck,
        color: 'text-blue-500',
        label: 'Entregado'
      }
    case 'read':
      return {
        icon: CheckCheck,
        color: 'text-blue-600',
        label: 'Leído'
      }
    case 'failed':
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        label: 'Error'
      }
    default:
      return {
        icon: Clock,
        color: 'text-gray-400',
        label: 'Desconocido'
      }
  }
}
