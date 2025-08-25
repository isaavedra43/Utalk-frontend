import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Configuración específica para React 19
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      })
    ],
    base: '/',
    define: {
      // Configuración para React 19
      __DEV__: !isProduction,
      __PROD__: isProduction,
      // Resolver problema de unstable_now
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.REACT_APP_VERSION': JSON.stringify('1.0.0'),
    },
    build: {
      outDir: 'dist',
      sourcemap: isAnalyze, // Solo sourcemaps para análisis
      // Optimizaciones de minificación
      minify: isProduction ? 'esbuild' : false,
      // Límite de tamaño de chunks más estricto
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          // Estrategia de chunking optimizada
          manualChunks: (id) => {
            // React core
            if (id.includes('react') && !id.includes('react-')) {
              return 'react-core';
            }
            
            // React DOM
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            
            // Radix UI components
            if (id.includes('@radix-ui/react-')) {
              return 'radix-ui';
            }
            
            // Charts y visualización
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts';
            }
            
            // WebSocket y comunicación
            if (id.includes('socket.io') || id.includes('websocket')) {
              return 'websocket';
            }
            
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase';
            }
            
            // Formularios y validación
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            
            // Routing
            if (id.includes('react-router')) {
              return 'router';
            }
            
            // Estado global
            if (id.includes('zustand')) {
              return 'state';
            }
            
            // HTTP client
            if (id.includes('axios')) {
              return 'http-client';
            }
            
            // Utilidades de fecha
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // Animaciones
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // Iconos
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Virtualización
            if (id.includes('react-window')) {
              return 'virtualization';
            }
            
            // Notificaciones
            if (id.includes('react-hot-toast')) {
              return 'notifications';
            }
            
            // Query client
            if (id.includes('@tanstack/react-query')) {
              return 'query-client';
            }
            
            // Vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // Optimización de nombres de archivos
          chunkFileNames: () => {
            return `[name]-[hash].js`;
          },
          entryFileNames: '[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset';
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `[name]-[hash][extname]`;
            }
            if (/css/i.test(ext)) {
              return `[name]-[hash][extname]`;
            }
            return `[name]-[hash][extname]`;
          }
        }
      },
      // Optimizaciones adicionales
      target: 'es2015',
      cssCodeSplit: true,
      reportCompressedSize: !isAnalyze, // No reportar en modo análisis
    },
    // Optimizaciones de desarrollo
    server: {
      port: 5173,
      host: true,
    },
    preview: {
      port: 5173,
      host: true,
      strictPort: true,
    },
    // Optimizaciones de dependencias
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
      ],
      exclude: ['@radix-ui/react-*'] // Excluir Radix UI del pre-bundling
    },
    // Configuración de CSS
    css: {
      postcss: {
        plugins: [
          autoprefixer,
          tailwindcss
        ]
      }
    }
  };
});
