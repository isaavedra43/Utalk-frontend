// Item individual de conversación en la lista
// ✅ EMAIL-FIRST: Muestra info del contacto y último mensaje
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Avatar } from './Avatar'
import { ChannelBadge } from './ChannelBadge'
import type { ConversationItemProps } from '../types'

export function ConversationItem({
  conversation,
  isSelected = false,
  onSelect,
  showAvatar = true
}: ConversationItemProps) {
  const { contact, lastMessage, unreadCount, channel, status, updatedAt } = conversation

  const handleClick = () => {
    onSelect(conversation.id)
  }

  const formatLastMessageTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      })
    } catch (error) {
      return 'Ahora'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'open': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-yellow-600 dark:text-yellow-400'
      case 'closed': return 'text-gray-600 dark:text-gray-400'
      case 'archived': return 'text-gray-500 dark:text-gray-500'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'open': return 'Abierta'
      case 'pending': return 'Pendiente'
      case 'closed': return 'Cerrada'
      case 'archived': return 'Archivada'
      default: return status
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer
        transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        {showAvatar && (
          <Avatar
            src={contact?.avatar}
            name={contact?.name || 'Cliente'}
            size="md"
            isOnline={contact?.isOnline}
            channel={channel}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and time */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {contact?.name || 'Cliente Sin Nombre'}
              </h3>
              {channel && (
                <ChannelBadge channel={channel} size="sm" />
              )}
            </div>
            <div className="flex items-center space-x-2 ml-2">
              {unreadCount > 0 && (
                <Badge 
                  variant="default" 
                  className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatLastMessageTime(updatedAt)}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {contact?.phone || contact?.email || 'Sin información de contacto'}
            </span>
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>

          {/* Last message preview */}
          {lastMessage && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                {lastMessage.type === 'text' 
                  ? lastMessage.content 
                  : `📎 ${lastMessage.type}`}
              </span>
              <span className="text-xs text-gray-400">
                {lastMessage.senderName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 