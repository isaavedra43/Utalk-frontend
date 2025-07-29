// Item individual de conversación en la lista
// ✅ EMAIL-FIRST: Muestra info del contacto y último mensaje
import type { CanonicalConversation } from '@/types/canonical'

interface ConversationItemProps {
  conversation: CanonicalConversation
  isSelected?: boolean
  onSelect: (id: string) => void
  showAvatar?: boolean
}

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
    hasContact: !!contact,
    contactName: contact?.name,
    isSelected,
    unreadCount,
    channel,
    status
  })

  // ✅ Formateo seguro de fecha
  const formatTime = (date: Date) => {
    try {
      if (!date || !(date instanceof Date)) {
        return ''
      }
      
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else if (days === 1) {
        return 'Ayer'
      } else if (days < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      }
    } catch (error) {
      console.warn('Error formatting date:', error)
      return ''
    }
  }

  // ✅ Color del canal mejorado
  const getChannelColor = (channel: string) => {
    const colors = {
      whatsapp: 'bg-green-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      telegram: 'bg-blue-400',
      email: 'bg-gray-500',
      sms: 'bg-yellow-500',
      webchat: 'bg-purple-500'
    }
    return colors[channel as keyof typeof colors] || 'bg-gray-400'
  }

  // ✅ Icono del canal
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        )
    }
  }

  return (
    <div
      onClick={() => onSelect(id)}
      className={`
        group relative flex items-center p-4 cursor-pointer transition-all duration-200
        hover:bg-gray-50 dark:hover:bg-gray-700/50
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
          : 'border-r-2 border-transparent'
        }
        border-b border-gray-100 dark:border-gray-700
      `}
    >
      {/* Avatar con indicador de canal */}
      <div className="relative flex-shrink-0 mr-3">
        {showAvatar && (
          <>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {contact.avatar ? (
                <img 
                  src={contact.avatar} 
                  alt={contact.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                contact.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            
            {/* Badge del canal */}
            <div className={`
              absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
              ${getChannelColor(channel)} shadow-sm border-2 border-white dark:border-gray-800
            `}>
              {getChannelIcon(channel)}
            </div>
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
            {contact.name || contact.phone || 'Cliente Desconocido'}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* Timestamp */}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(updatedAt)}
            </span>
            {/* Badge de no leídos */}
            {unreadCount > 0 && (
              <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Último mensaje */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {lastMessage.type === 'text' 
                ? lastMessage.content || 'Sin mensajes' 
                : lastMessage.type === 'image' 
                  ? '📷 Imagen'
                  : lastMessage.type === 'file'
                    ? '📎 Archivo'
                    : lastMessage.type === 'audio'
                      ? '🎵 Audio'
                      : lastMessage.type === 'video'
                        ? '🎬 Video'
                        : `📎 ${lastMessage.type || 'archivo'}`}
            </p>
            {lastMessage.senderName && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {lastMessage.senderName}
              </span>
            )}
          </div>

          {/* Estado de la conversación */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${status === 'open' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : status === 'closed'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }
            `}>
              {status === 'open' ? 'Abierta' : status === 'closed' ? 'Cerrada' : 'Pendiente'}
            </span>

            {/* Indicador online */}
            {contact.isOnline && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {/* Efecto hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
        bg-gradient-to-r from-transparent via-blue-500/5 to-transparent
        pointer-events-none
      `} />
    </div>
  )
} 