declare module '@vitejs/plugin-react' {
  import type { PluginOption } from 'vite';

  // Tipado mínimo para evitar errores del editor en vite.config.ts
  export default function react(options?: Record<string, unknown>): PluginOption;
} 