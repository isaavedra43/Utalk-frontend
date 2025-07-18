import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@/components": fileURLToPath(new URL('./src/components', import.meta.url)),
      "@/modules": fileURLToPath(new URL('./src/modules', import.meta.url)),
      "@/services": fileURLToPath(new URL('./src/services', import.meta.url)),
      "@/hooks": fileURLToPath(new URL('./src/hooks', import.meta.url)),
      "@/contexts": fileURLToPath(new URL('./src/contexts', import.meta.url)),
      "@/types": fileURLToPath(new URL('./src/types', import.meta.url)),
      "@/lib": fileURLToPath(new URL('./src/lib', import.meta.url)),
      "@/assets": fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}) 