// Burbuja de mensaje individual en el chat
// Soporte para diferentes tipos de mensajes y estados
import { Check, CheckCheck, Clock, Download, Play, FileText, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageBubbleProps } from '../types'
import Avatar from './Avatar'

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

function getStatusIcon(isDelivered: boolean, isRead: boolean) {
  if (isRead) {
    return <CheckCheck className="w-3 h-3 text-blue-500" />
  } else if (isDelivered) {
    return <CheckCheck className="w-3 h-3 text-gray-400" />
  } else {
    return <Check className="w-3 h-3 text-gray-400" />
  }
}

function renderMessageContent(message: any) {
  switch (message.type) {
    case 'image':
      return (
        <div className="relative group">
          <img 
            src={message.attachments?.[0]?.url || '/placeholder-image.jpg'} 
            alt="Imagen"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-white">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )
    
    case 'file': {
      const attachment = message.attachments?.[0]
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-xs">
          <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment?.name || 'Archivo'}</p>
            <p className="text-xs text-gray-500">
              {attachment?.size ? `${Math.round(attachment.size / 1024)} KB` : 'Desconocido'}
            </p>
          </div>
                   <Button variant="ghost" size="sm">
           <Download className="w-4 h-4" />
         </Button>
       </div>
     )
   }
   
   case 'audio':
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-xs">
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Play className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <span className="text-xs text-gray-500">0:15</span>
        </div>
      )
    
    case 'location':
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-xs">
          <MapPin className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Ubicación compartida</p>
            <p className="text-xs text-gray-500">Toca para abrir en el mapa</p>
          </div>
        </div>
      )
    
    default: {
      // Mensaje de texto con soporte para URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const parts = message.content.split(urlRegex)
      
      return (
        <div className="whitespace-pre-wrap">
          {parts.map((part: string, index: number) => {
            if (urlRegex.test(part)) {
              return (
                <a 
                  key={index}
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  {part}
                </a>
              )
            }
            return part
                     })}
         </div>
       )
     }
   }
 }

export function MessageBubble({ 
  message, 
  showAvatar, 
  isGrouped 
}: MessageBubbleProps) {
  const isAgent = message.sender.type === 'agent'
  const isBot = message.sender.type === 'bot'

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex max-w-[70%] ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar (solo si no está agrupado y no es el agente) */}
        {showAvatar && !isAgent && !isGrouped && (
          <div className="flex-shrink-0 mr-2">
            <Avatar 
              src={message.sender.avatar}
              name={message.sender.name}
              size="sm"
            />
          </div>
        )}

        {/* Espaciador cuando no hay avatar pero el mensaje está agrupado */}
        {!showAvatar && !isAgent && isGrouped && (
          <div className="w-6 mr-2 flex-shrink-0" />
        )}

        {/* Contenido del mensaje */}
        <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
          {/* Nombre del remitente (solo si no está agrupado) */}
          {!isGrouped && !isAgent && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {message.sender.name}
              </span>
              {isBot && (
                <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                  BOT
                </span>
              )}
            </div>
          )}

          {/* Burbuja del mensaje */}
          <div
            className={`
              px-3 py-2 rounded-lg max-w-full
              ${isAgent 
                ? 'bg-[#4880ff] text-white' 
                : isBot 
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                  : 'bg-[#222837] text-white dark:bg-gray-700'
              }
              ${isGrouped ? 'rounded-tl-sm' : ''}
            `}
          >
            {renderMessageContent(message)}
          </div>

          {/* Información del mensaje */}
          <div className={`flex items-center space-x-1 mt-1 ${isAgent ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageTime(message.timestamp)}
            </span>
            
            {/* Estado de entrega (solo para mensajes del agente) */}
            {isAgent && (
              <div className="flex items-center">
                {getStatusIcon(message.isDelivered, message.isRead)}
              </div>
            )}
            
            {/* Indicador de pendiente */}
            {!message.isDelivered && isAgent && (
              <Clock className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble 