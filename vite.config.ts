import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Optimizaciones para SPA
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          tanstack: ['@tanstack/react-query'],
          lucide: ['lucide-react'],
        },
      },
    },
    // Configuración para SPA
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  envPrefix: "VITE_",
  // Configuración base para SPA
  base: "/",
  // Optimizaciones para producción
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
