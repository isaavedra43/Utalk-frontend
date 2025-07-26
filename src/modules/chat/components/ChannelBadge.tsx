// Badge para mostrar el canal de comunicación (WhatsApp, Facebook, etc.)
// Componente reutilizable con iconos y colores específicos por canal
import { ElementType } from 'react'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mail, Globe, Send, MessageSquare } from 'lucide-react'
import { ChannelBadgeProps, ChannelType } from '../types'

const channelConfig: Record<ChannelType, { icon: ElementType; label: string; className: string }> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    className: 'bg-green-100 text-green-700 border-green-200'
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  email: {
    icon: Mail,
    label: 'Email',
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS',
    className: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  web: {
    icon: Globe,
    label: 'Web',
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  webchat: {
    icon: MessageCircle,
    label: 'WebChat',
    className: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  api: {
    icon: Globe,
    label: 'API',
    className: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    className: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  instagram: {
    icon: MessageCircle,
    label: 'Instagram',
    className: 'bg-pink-100 text-pink-700 border-pink-200'
  }
}

const sizeConfig = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', padding: 'px-1.5 py-0.5' },
  md: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1' },
  lg: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5' }
}

export function ChannelBadge({ channel, size = 'md' }: ChannelBadgeProps) {
  const config = channelConfig[channel]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  if (!config) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeStyles.text} ${sizeStyles.padding} inline-flex items-center gap-1 font-medium border`}
    >
      <Icon className={sizeStyles.icon} />
      {size !== 'sm' && config.label}
    </Badge>
  )
}

export default ChannelBadge 