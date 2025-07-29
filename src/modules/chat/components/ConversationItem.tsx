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
  // ✅ RENDER DEFENSIVO: Destructuring con defaults para todos los campos
  const { 
    contact = { 
      id: 'unknown', 
      name: 'Cliente Sin Nombre', 
      phone: 'N/A', 
      avatar: undefined,
      isOnline: false,
      email: undefined
    }, 
    lastMessage = {
      id: 'placeholder',
      content: 'Sin mensajes',
      timestamp: new Date(),
      senderName: 'Sistema',
      type: 'text'
    }, 
    unreadCount = 0, 
    channel = 'whatsapp', 
    status = 'open', 
    updatedAt = new Date(),
    id = 'unknown'
  } = conversation || {}

  // ✅ LOG CRÍTICO PARA DEBUG
  console.log('[CRITICAL] ConversationItem render attempt:', {
    conversationId: id,
    hasRequiredFields: !!(conversation && id),
    contactValid: !!(contact?.name),
    statusValid: !!status,
    dateValid: !!updatedAt,
    dateType: typeof updatedAt,
    originalConversation: conversation
  })

  const handleClick = () => {
    if (onSelect && id) {
      onSelect(id)
    } else {
      console.warn('[HANDLER] No se puede seleccionar conversación:', { hasOnSelect: !!onSelect, hasId: !!id })
    }
  }

  // ✅ FORMATEO ROBUSTO DE FECHAS
  const formatLastMessageTime = (date: any) => {
    try {
      // Manejar diferentes tipos de fecha
      let dateObj: Date
      
      if (date instanceof Date) {
        dateObj = date
      } else if (typeof date === 'string') {
        dateObj = new Date(date)
      } else if (typeof date === 'number') {
        dateObj = new Date(date)
      } else if (date?._seconds) {
        // Firebase timestamp
        dateObj = new Date(date._seconds * 1000)
      } else {
        dateObj = new Date()
      }
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        console.warn('[FORMAT] Fecha inválida en conversación:', { id, date, dateType: typeof date })
        return 'Fecha inválida'
      }
      
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: es 
      })
    } catch (error) {
      console.warn('[FORMAT] Error formateando fecha:', { id, date, error })
      return 'Hace un momento'
    }
  }

  // ✅ STATUS COLOR DEFENSIVO
  const getStatusColor = () => {
    switch (status) {
      case 'open': return 'text-green-600 dark:text-green-400'
      case 'pending': return 'text-yellow-600 dark:text-yellow-400'
      case 'closed': return 'text-gray-600 dark:text-gray-400'
      case 'archived': return 'text-gray-500 dark:text-gray-500'
      default: 
        console.warn('[STATUS] Status desconocido en conversación:', { id, status })
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  // ✅ STATUS LABEL DEFENSIVO
  const getStatusLabel = () => {
    switch (status) {
      case 'open': return 'Abierta'
      case 'pending': return 'Pendiente'
      case 'closed': return 'Cerrada'
      case 'archived': return 'Archivada'
      default: 
        console.warn('[STATUS] Label desconocido en conversación:', { id, status })
        return status || 'Sin estado'
    }
  }

  // ✅ VALIDACIÓN FINAL ANTES DEL RENDER
  if (!id) {
    console.error('[RENDER] Conversación sin ID válido, no se puede renderizar:', conversation)
    return null
  }

  console.log('[RENDER] ConversationItem renderizando:', {
    id,
    contactName: contact?.name,
    status,
    hasLastMessage: !!lastMessage,
    unreadCount
  })

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
            isOnline={contact?.isOnline || false}
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
          {lastMessage && lastMessage.content && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                {lastMessage.type === 'text' 
                  ? (lastMessage.content || 'Mensaje sin contenido')
                  : `📎 ${lastMessage.type || 'archivo'}`}
              </span>
              <span className="text-xs text-gray-400">
                {lastMessage.senderName || 'Usuario'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 