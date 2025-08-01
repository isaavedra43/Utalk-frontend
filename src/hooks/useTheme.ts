// Hook useTheme separado para evitar conflictos con Fast Refresh
import { useContext } from 'react'
import { createContext } from 'react'
import { ThemeProviderState, defaultState } from '@/contexts/theme-types'

const ThemeProviderContext = createContext<ThemeProviderState>(defaultState)

export { ThemeProviderContext }

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    {throw new Error('useTheme must be used within a ThemeProvider')}

  return context
}