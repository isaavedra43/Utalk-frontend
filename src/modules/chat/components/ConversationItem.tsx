// Item individual de conversación en la lista
// ✅ EMAIL-FIRST: Muestra info del contacto y último mensaje
import React from 'react'
import type { CanonicalConversation } from '@/types/canonical'

interface ConversationItemProps {
  conversation: CanonicalConversation
  isSelected?: boolean
  onSelect: (id: string) => void
  showAvatar?: boolean
}

// ✅ Error Boundary específico para ConversationItem
class ConversationItemErrorBoundary extends React.Component<
  { children: React.ReactNode; conversationId?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; conversationId?: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ERROR-BOUNDARY] ConversationItem error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR-BOUNDARY] ConversationItem componentDidCatch:', {
      error,
      errorInfo,
      conversationId: this.props.conversationId
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
          <div className="text-red-600 dark:text-red-400 text-sm">
            ❌ Error cargando conversación {this.props.conversationId}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {this.state.error?.message || 'Error desconocido'}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ConversationItem({
  conversation,
  isSelected = false,
  onSelect,
  showAvatar = true
}: ConversationItemProps) {
  // ✅ VALIDACIÓN ULTRA-DEFENSIVA
  if (!conversation) {
    console.error('[CONVERSATION-ITEM] No conversation provided')
    return (
      <div className="p-4 border-b border-gray-200 bg-yellow-50">
        <div className="text-yellow-600 text-sm">⚠️ Conversación no válida</div>
      </div>
    )
  }

  // ✅ EXTRACCIÓN SEGURA CON MÚLTIPLES FALLBACKS
  const conversationId = conversation.id || `temp_${Date.now()}`
  const contactData = conversation.contact || {}
  const lastMessageData = conversation.lastMessage || {}
  
  // ✅ DATOS DE CONTACTO CON FALLBACKS ROBUSTOS
  const contactName = (contactData as any)?.name || 
                     (contactData as any)?.phone || 
                     (contactData as any)?.email || 
                     conversation.title || 
                     'Cliente Sin Nombre'
  
  const contactPhone = (contactData as any)?.phone || 'N/A'
  const contactAvatar = (contactData as any)?.avatar || (contactData as any)?.avatarUrl || null
  const isOnline = Boolean((contactData as any)?.isOnline)
  
  // ✅ DATOS DE ÚLTIMO MENSAJE CON FALLBACKS
  const lastMessageContent = (lastMessageData as any)?.content || 
                            (lastMessageData as any)?.text || 
                            'Sin mensajes'
  
  const lastMessageTime = (lastMessageData as any)?.timestamp || 
                         (lastMessageData as any)?.createdAt || 
                         conversation.updatedAt || 
                         new Date()
  
  const lastMessageSender = (lastMessageData as any)?.senderName || 
                           (lastMessageData as any)?.sender?.name || 
                           'Usuario'

  // ✅ DATOS ADICIONALES CON FALLBACKS
  const unreadCount = Number(conversation.unreadCount) || 0
  const channel = conversation.channel || 'whatsapp'
  const status = conversation.status || 'open'

  // ✅ LOG CRÍTICO PARA DEBUG
  console.log('[CONVERSATION-ITEM] Rendering conversation:', {
    conversationId,
    contactName,
    contactPhone,
    lastMessageContent: lastMessageContent.substring(0, 50),
    unreadCount,
    channel,
    status,
    isSelected
  })

  // ✅ FUNCIÓN DE FORMATEO ULTRA-SEGURA
  const formatTime = (date: unknown): string => {
    try {
      let validDate: Date
      
      if (date instanceof Date) {
        validDate = date
      } else if (typeof date === 'string') {
        validDate = new Date(date)
      } else if (typeof date === 'number') {
        validDate = new Date(date)
      } else {
        return ''
      }
      
      if (isNaN(validDate.getTime())) {
        return ''
      }
      
      const now = new Date()
      const diff = now.getTime() - validDate.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return validDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else if (days === 1) {
        return 'Ayer'
      } else if (days < 7) {
        return validDate.toLocaleDateString('es-ES', { weekday: 'short' })
      } else {
        return validDate.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      }
    } catch (error) {
      console.warn('[CONVERSATION-ITEM] Error formatting date:', error, date)
      return ''
    }
  }

  // ✅ FUNCIÓN SEGURA PARA MANEJAR CLICK
  const handleClick = () => {
    try {
      if (typeof onSelect === 'function') {
        onSelect(conversationId)
      } else {
        console.error('[CONVERSATION-ITEM] onSelect is not a function:', onSelect)
      }
    } catch (error) {
      console.error('[CONVERSATION-ITEM] Error handling click:', error)
    }
  }

  // ✅ FUNCIÓN PARA COLOR DE CANAL
  const getChannelColor = (channelType: string): string => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-500',
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-500',
      telegram: 'bg-blue-400',
      email: 'bg-gray-500',
      sms: 'bg-yellow-500',
      webchat: 'bg-purple-500'
    }
    return colors[channelType] || 'bg-gray-400'
  }

  // ✅ FUNCIÓN PARA ICONO DE CANAL
  const getChannelIcon = (channelType: string): string => {
    const icons: Record<string, string> = {
      whatsapp: '📱',
      facebook: '📘',
      instagram: '📷',
      telegram: '✈️',
      email: '📧',
      sms: '💬',
      webchat: '🌐'
    }
    return icons[channelType] || '💬'
  }

  return (
    <ConversationItemErrorBoundary conversationId={conversationId}>
      <div 
        className={`
          group relative p-4 border-b border-gray-200 dark:border-gray-700 
          hover:bg-gray-50 dark:hover:bg-gray-800 
          cursor-pointer transition-colors duration-200
          ${isSelected 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
            : ''
          }
        `}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label={`Conversación con ${contactName}`}
      >
        <div className="flex items-center space-x-3">
          {/* ✅ AVATAR CON VALIDACIÓN */}
          {showAvatar && (
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                {contactAvatar ? (
                  <img 
                    src={contactAvatar} 
                    alt={`Avatar de ${contactName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('[CONVERSATION-ITEM] Avatar load error:', contactAvatar)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {contactName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* ✅ INDICADOR DE CANAL */}
              <div className={`
                absolute -bottom-1 -right-1 w-6 h-6 rounded-full 
                ${getChannelColor(channel)} 
                flex items-center justify-center text-white text-xs font-bold
                border-2 border-white dark:border-gray-800
              `}>
                {getChannelIcon(channel)}
              </div>
            </div>
          )}

          {/* ✅ CONTENIDO PRINCIPAL */}
          <div className="flex-1 min-w-0">
            {/* Header con nombre y hora */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {contactName}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(lastMessageTime)}
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            {/* Información del contacto */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {contactPhone}
            </div>
            
            {/* Último mensaje */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                {lastMessageContent}
              </p>
              {lastMessageSender && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                  {lastMessageSender}
                </span>
              )}
            </div>
          </div>

          {/* ✅ ESTADO Y INDICADORES */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            {/* Estado de la conversación */}
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap
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
            {isOnline && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="En línea"></div>
            )}
          </div>
        </div>

        {/* ✅ EFECTO HOVER */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          bg-gradient-to-r from-transparent via-blue-500/5 to-transparent
          pointer-events-none
        `} />
      </div>
    </ConversationItemErrorBoundary>
  )
} 