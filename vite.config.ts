import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import path from 'path';

// Configuración mínima y estable para producción con PWA
export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'UTalk - Chat & Atención al Cliente',
        short_name: 'UTalk',
        description: 'Plataforma de atención al cliente en tiempo real con WhatsApp, chat interno, gestión de equipo y recursos humanos',
        theme_color: '#3B82F6',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icons/icon-72x72.png.svg',
            sizes: '72x72',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-96x96.png.svg',
            sizes: '96x96',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-128x128.png.svg',
            sizes: '128x128',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-144x144.png.svg',
            sizes: '144x144',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-152x152.png.svg',
            sizes: '152x152',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-192x192.png.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-384x384.png.svg',
            sizes: '384x384',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-icons/icon-512x512.png.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'communication', 'productivity'],
        screenshots: [
          {
            src: '/screenshots/dashboard-mobile.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/screenshots/dashboard-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/utalk-backend-production\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hora
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      // Asegurar que el manifest se genere en /manifest.webmanifest
      filename: 'manifest.webmanifest'
    })
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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
