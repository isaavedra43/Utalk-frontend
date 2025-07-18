// Types y helpers para ThemeContext
// Archivo separado para evitar conflictos con Fast Refresh

export type Theme = "dark" | "light" | "system"

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const defaultState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
} 