// Componente para mostrar badges de canal de comunicación
import { ElementType } from 'react'
import { MessageCircle, Mail, Globe, Phone, Send, Users, Bot, Camera } from 'lucide-react'
import type { ChannelType } from '../types'

// ✅ Configuración de canales
const CHANNEL_CONFIG: Record<ChannelType, { icon: ElementType; label: string; className: string }> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  email: {
    icon: Mail,
    label: 'Email',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  },
  web: {
    icon: Globe,
    label: 'Web',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
  },
  sms: {
    icon: MessageCircle,
    label: 'SMS',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  phone: {
    icon: Phone,
    label: 'Teléfono',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  instagram: {
    icon: Camera,
    label: 'Instagram',
    className: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
  },
  api: {
    icon: Bot,
    label: 'API',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
  },
  voice: {
    icon: Phone,
    label: 'Voz',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  },
  webchat: {
    icon: Users,
    label: 'Web Chat',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
  }
}

export interface ChannelBadgeProps {
  channel: ChannelType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ChannelBadge({ 
  channel, 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: ChannelBadgeProps) {
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.web
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm', 
    lg: 'px-3 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.className}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.label}
    >
      <Icon className={`${iconSizes[size]} ${showLabel ? 'mr-1' : ''}`} />
      {showLabel && (
        <span className="truncate">{config.label}</span>
      )}
    </span>
  )
}

export default ChannelBadge
