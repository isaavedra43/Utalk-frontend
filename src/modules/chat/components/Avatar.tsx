// Avatar personalizado con indicador de estado online y fallback inteligente
// Soporte para diferentes tamaños y canales de comunicación
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AvatarProps } from '../types'

const sizeConfig = {
  sm: { avatar: 'w-6 h-6', indicator: 'w-2 h-2', text: 'text-xs' },
  md: { avatar: 'w-8 h-8', indicator: 'w-2.5 h-2.5', text: 'text-sm' },
  lg: { avatar: 'w-10 h-10', indicator: 'w-3 h-3', text: 'text-base' },
  xl: { avatar: 'w-12 h-12', indicator: 'w-3.5 h-3.5', text: 'text-lg' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500'
  ]
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  isOnline, 
  channel 
}: AvatarProps) {
  const styles = sizeConfig[size]
  const initials = getInitials(name)
  const colorClass = getAvatarColor(name)

  return (
    <div className="relative inline-block">
      <UIAvatar className={`${styles.avatar} ${colorClass}`}>
        {src && <AvatarImage src={src} alt={name} />}
        <AvatarFallback 
          className={`${styles.text} font-medium text-white bg-transparent`}
        >
          {initials}
        </AvatarFallback>
      </UIAvatar>
      
      {/* Indicador de estado online */}
      {isOnline !== undefined && (
        <div 
          className={`
            absolute -bottom-0.5 -right-0.5 ${styles.indicator} 
            rounded-full border-2 border-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `}
          title={isOnline ? 'En línea' : 'Desconectado'}
        />
      )}
      
      {/* Indicador de canal (solo para tamaños grandes) */}
      {channel && size === 'xl' && (
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center"
          title={`Canal: ${channel}`}
        >
          <span className="text-xs">
            {channel === 'whatsapp' && '💬'}
            {channel === 'facebook' && '📘'}
            {channel === 'email' && '📧'}
            {channel === 'web' && '🌐'}
            {channel === 'instagram' && '📷'}
            {channel === 'telegram' && '✈️'}
          </span>
        </div>
      )}
    </div>
  )
}

export default Avatar 