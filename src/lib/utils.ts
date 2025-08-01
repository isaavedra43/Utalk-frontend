// Utilidades principales de la aplicación
// Funciones helper, formatters y utilities globales
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de manera eficiente
 * Evita conflictos entre clases y optimiza el bundle
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea fechas en español
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(
    typeof date === 'string' ? new Date(date) : date
  )
}

/**
 * Debounce function para optimizar llamadas frecuentes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Genera ID único simple para uso interno
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Valida email básico
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Formatea números como moneda en EUR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Capitaliza primera letra de cada palabra
 */
export function capitalize(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}