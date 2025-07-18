// Item individual de conversación en la lista
// Muestra información del contacto, último mensaje, canal y estado
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Clock, Pin, Volume2, VolumeX } from 'lucide-react'
import { ConversationItemProps } from '../types'
import Avatar from './Avatar'
import ChannelBadge from './ChannelBadge'

function formatLastMessageTime(date: Date): string {
  const now = new Date()
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    // Mostrar hora si es del mismo día
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  } else if (diffInHours < 168) { // 7 días
    // Mostrar día de la semana si es de esta semana
    return date.toLocaleDateString('es-ES', { weekday: 'short' })
  } else {
    // Mostrar fecha relativa para mensajes más antiguos
    return formatDistanceToNow(date, { locale: es, addSuffix: false })
  }
}

function truncateMessage(message: string, maxLength: number = 40): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'text-green-600'
    case 'pending': return 'text-yellow-600'
    case 'closed': return 'text-gray-500'
    default: return 'text-blue-600'
  }
}

export function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: ConversationItemProps) {
  const { contact, lastMessage, unreadCount, status, priority, isMuted, updatedAt } = conversation

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center space-x-3 p-3 cursor-pointer transition-all
        border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''}
      `}
    >
      {/* Avatar del contacto */}
      <div className="flex-shrink-0">
        <Avatar 
          src={contact.avatar}
          name={contact.name}
          size="lg"
          isOnline={contact.isOnline}
          channel={contact.channel}
        />
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        {/* Primera línea: Nombre y estado */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {contact.name}
            </h3>
            
            {/* Indicadores de estado */}
            <div className="flex items-center space-x-1">
              {priority === 'high' && (
                <Pin className="w-3 h-3 text-red-500 transform rotate-45" />
              )}
              
              {isMuted && (
                <VolumeX className="w-3 h-3 text-gray-400" />
              )}
              
              {!isMuted && unreadCount > 0 && (
                <Volume2 className="w-3 h-3 text-blue-500" />
              )}
            </div>
          </div>

          {/* Tiempo del último mensaje */}
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastMessageTime(updatedAt)}</span>
          </div>
        </div>

        {/* Segunda línea: Último mensaje */}
        <div className="flex items-center justify-between">
          <p className={`
            text-sm text-gray-600 dark:text-gray-300 truncate
            ${unreadCount > 0 ? 'font-medium text-gray-900 dark:text-white' : ''}
          `}>
            {lastMessage 
              ? truncateMessage(lastMessage.content)
              : 'Sin mensajes'
            }
          </p>
        </div>

        {/* Tercera línea: Canal y badges */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <ChannelBadge channel={contact.channel} size="sm" />
            
            {/* Tags del contacto */}
            {contact.tags.length > 0 && (
              <div className="flex space-x-1">
                {contact.tags.slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs px-1 py-0 h-4"
                  >
                    {tag}
                  </Badge>
                ))}
                {contact.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    +{contact.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Contador de mensajes no leídos */}
          <div className="flex items-center space-x-2">
            {/* Estado de la conversación */}
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
            
            {/* Badge de mensajes no leídos */}
            {unreadCount > 0 && (
              <Badge 
                className="bg-red-500 text-white text-xs min-w-[1.25rem] h-5 rounded-full flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationItem 