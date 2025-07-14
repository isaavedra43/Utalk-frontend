import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ENTRY POINT: index.html en la raíz del proyecto
  root: path.resolve(__dirname),
  
  // PUBLIC DIR: Assets públicos
  publicDir: path.resolve(__dirname, "public"),
  
  server: {
    host: "0.0.0.0", 
    port: 5173,
    // PROXY para desarrollo: redirige /api al backend
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
      }
    } : undefined
  },
  
  build: {
    // OUTPUT: Build hacia /dist en la raíz del proyecto
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    
    // SOURCE MAPS: Solo en desarrollo
    sourcemap: mode === 'development',
    
    // MINIFICACIÓN: Configuración básica
    minify: mode === 'production',
    
    // TARGET: Navegadores modernos
    target: 'es2020'
  },
  
  plugins: [
    react()
  ],
  
  resolve: {
    alias: {
      // ALIAS: Rutas desde la raíz del proyecto
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  
  // ENV: Prefijo para variables de entorno del frontend
  envPrefix: 'VITE_',
  
  // OPTIMIZACIÓN: Pre-bundling de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios'
    ]
  }
}));
