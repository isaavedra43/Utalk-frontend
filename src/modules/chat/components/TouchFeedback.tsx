// Componentes con touch feedback mejorado para móviles
// Incluye efectos táctiles y gestos de swipe
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TouchFeedbackProps {
  children: React.ReactNode
  onTap?: () => void
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  disabled?: boolean
}

export function TouchFeedback({
  children,
  onTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  className,
  disabled = false
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    setIsPressed(true)
    
    // Iniciar long press timer
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true)
      onLongPress?.()
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    
    // Si el movimiento es mayor a 10px, cancelar long press
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
        longPressTimeoutRef.current = null
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    
    // Limpiar long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    
    setIsPressed(false)
    setIsLongPress(false)
    
    // Detectar swipe
    const minSwipeDistance = 50
    const maxSwipeTime = 300
    
    if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      // Tap simple
      onTap?.()
    }
    
    touchStartRef.current = null
  }

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        'transition-all duration-150 ease-out',
        isPressed && !disabled && 'scale-95 opacity-80',
        isLongPress && !disabled && 'scale-90 opacity-60',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Componente para swipe en conversaciones
interface SwipeableConversationProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableConversation({
  children,
  onSwipeLeft,
  onSwipeRight,
  className
}: SwipeableConversationProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    
    // Solo permitir swipe horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      setSwipeOffset(deltaX)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    
    setIsSwiping(false)
    setSwipeOffset(0)
    
    // Detectar swipe
    const minSwipeDistance = 100
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
    
    touchStartRef.current = null
  }

  return (
    <div
      className={cn(
        'transition-transform duration-200 ease-out',
        isSwiping && 'transition-none',
        className
      )}
      style={{
        transform: `translateX(${swipeOffset}px)`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Componente para botones con feedback táctil
interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  onLongPress?: () => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function TouchButton({
  children,
  onClick,
  onLongPress,
  className,
  disabled = false,
  variant = 'default',
  size = 'md'
}: TouchButtonProps) {
  return (
    <TouchFeedback
      onTap={onClick}
      onLongPress={onLongPress}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8': size === 'lg'
        },
        className
      )}
    >
      {children}
    </TouchFeedback>
  )
} 