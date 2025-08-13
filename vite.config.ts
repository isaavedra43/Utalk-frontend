import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./src/tests/setup.ts']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('svelte')) {
              return 'svelte-vendor';
            }
            return 'vendor';
          }
          if (id.includes('$lib/utils')) {
            return 'utils';
          }
          if (id.includes('$lib/services')) {
            return 'services';
          }
          if (id.includes('$lib/stores')) {
            return 'stores';
          }
          if (id.includes('$lib/components')) {
            return 'components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['svelte', 'svelte/store']
  }
});
