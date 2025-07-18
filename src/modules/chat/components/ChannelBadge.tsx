// Badge para mostrar el canal de comunicación (WhatsApp, Facebook, etc.)
// Componente reutilizable con iconos y colores específicos por canal
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mail, Globe, Instagram, Send } from 'lucide-react'
import { ChannelBadgeProps, ChannelType } from '../types'

const channelConfig: Record<ChannelType, { 
  icon: React.ElementType
  label: string
  className: string
}> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    className: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  email: {
    icon: Mail,
    label: 'Email',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  web: {
    icon: Globe,
    label: 'Web',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    className: 'bg-pink-500/10 text-pink-600 border-pink-500/20'
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
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