import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// Configuración mínima y estable para producción
export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    target: 'es2018',
    cssCodeSplit: true,
    reportCompressedSize: true
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 5173,
    host: true,
    strictPort: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'socket.io-client',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'recharts',
      'framer-motion',
      'lucide-react',
      'date-fns',
      'react-hook-form',
      'zod',
      'react-window'
    ]
  },
  css: {
    postcss: {
      plugins: [autoprefixer, tailwindcss]
    }
  }
});
