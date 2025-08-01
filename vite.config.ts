import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  // Configuración de headers de seguridad enterprise
  const securityHeaders = {
    // Prevenir embedding en frames (clickjacking)
    'X-Frame-Options': 'DENY',
    
    // Prevenir MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Protección XSS básica (legacy)
    'X-XSS-Protection': '1; mode=block',
    
    // Política de referrer estricta
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Deshabilitar APIs peligrosas
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    
    // Prevenir información de servidor
    'X-Powered-By': '',
    'Server': ''
  }

  // Headers adicionales para producción
  const productionHeaders = {
    ...securityHeaders,
    
    // HSTS (HTTPS obligatorio)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // CSP estricta para producción
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed para React dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // Cache control para assets estáticos
    'Cache-Control': 'public, max-age=31536000, immutable'
  }

  return {
    plugins: [
      react(),
      
      // Bundle analyzer (solo en análisis)
      ...(command === 'build' && env.ANALYZE === 'true' ? [
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // ===== CONFIGURACIÓN DE SERVIDOR DE DESARROLLO =====
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST || 'localhost',
      hmr: env.VITE_HMR !== 'false',
      headers: {
        ...securityHeaders,
        // Headers relajados para desarrollo
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      },
      // Configuración de proxy para desarrollo
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // ===== CONFIGURACIÓN DE PREVIEW (TESTING LOCAL) =====
    preview: {
      port: parseInt(env.VITE_PORT || '4173'),
      host: env.VITE_HOST || 'localhost',
      headers: productionHeaders
    },

    // ===== CONFIGURACIÓN DE BUILD ENTERPRISE =====
    build: {
      // Optimizaciones de producción
      minify: 'esbuild',
      sourcemap: env.VITE_ENV !== 'production',
      cssCodeSplit: true,
      target: 'es2020',
      
      rollupOptions: {
        output: {
          // Separar chunks por funcionalidad para mejor caching
          manualChunks: {
            // Core de React
            vendor: ['react', 'react-dom'],
            
            // Routing y navegación
            router: ['react-router-dom'],
            
            // Formularios y validación
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Componentes UI
            ui: ['@radix-ui/react-avatar', '@radix-ui/react-slot'],
            
            // Iconos (chunk separado para lazy loading)
            icons: ['lucide-react'],
            
            // HTTP y comunicación
            http: ['axios'],
            
            // Utilidades
            utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
          },
          
          // Nombres de archivo con hash para cache busting
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        },
        
        // Externals para CDN (opcional)
        external: mode === 'production' ? [] : []
      },
      
      // Configuración de alertas
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      
      // Configuración de salida
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      
      // Reporte de bundle
      reportCompressedSize: true
    },

    // ===== OPTIMIZACIÓN DE DEPENDENCIAS =====
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'zod',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'clsx',
        'tailwind-merge'
      ],
      exclude: [
        // Excluir en desarrollo para mejor HMR
        ...(mode === 'development' ? ['lucide-react'] : [])
      ]
    },

    // ===== VARIABLES DE ENTORNO Y DEFINICIONES GLOBALES =====
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __GIT_COMMIT__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || 'local'),
      __ENVIRONMENT__: JSON.stringify(env.VITE_ENV || 'development'),
      
      // Flags de características por entorno
      __DEV__: JSON.stringify(mode === 'development'),
      __STAGING__: JSON.stringify(env.VITE_ENV === 'staging'),
      __PROD__: JSON.stringify(env.VITE_ENV === 'production')
    },

    // ===== CONFIGURACIÓN DE ESBUILD =====
    esbuild: {
      target: 'es2020',
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },

    // ===== CONFIGURACIÓN CSS =====
    css: {
      postcss: {
        plugins: [
          // Autoprefixer y optimizaciones CSS se manejan en postcss.config.js
        ]
      },
      devSourcemap: mode === 'development'
    },

    // ===== CONFIGURACIÓN DE JSON =====
    json: {
      namedExports: true,
      stringify: false
    }
  }
})
