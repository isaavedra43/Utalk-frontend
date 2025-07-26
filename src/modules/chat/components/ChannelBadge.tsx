// Badge para mostrar el canal de comunicación
// ✅ EMAIL-FIRST: Todos los canales soportados
import { ElementType } from 'react'
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Globe,
  Smartphone,
  MessageCircle
} from 'lucide-react'
import type { ChannelType } from '../types'

// ✅ Configuración completa para todos los canales incluyendo 'voice'
const CHANNEL_CONFIG: Record<ChannelType, { icon: ElementType; label: string; className: string }> = {
  whatsapp: {
    icon: MessageSquare,
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
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
  },
  sms: {
    icon: MessageCircle,
    label: 'SMS',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  },
  voice: {
    icon: Phone,
    label: 'Voz',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  },
  web: {
    icon: Globe,
    label: 'Web',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
  },
  webchat: {
    icon: MessageSquare,
    label: 'Web Chat',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
  },
  api: {
    icon: Smartphone,
    label: 'API',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  instagram: {
    icon: MessageCircle,
    label: 'Instagram',
    className: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
  }
}

export interface ChannelBadgeProps {
  channel: ChannelType
  size?: 'sm' | 'md'
}

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const config = CHANNEL_CONFIG[channel]
  
  if (!config) {
    console.warn(`⚠️ Unknown channel type: ${channel}`)
    return null
  }

  const Icon = config.icon
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1.5 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
} 