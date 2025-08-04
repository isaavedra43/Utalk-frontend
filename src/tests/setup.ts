import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/svelte';
import { afterEach, beforeAll, vi } from 'vitest';

// Configurar variables de entorno para testing
beforeAll(() => {
  // Mock environment variables for testing
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_API_URL: 'http://localhost:3001',
      VITE_WS_URL: 'ws://localhost:3001',
      MODE: 'test',
      DEV: false,
      PROD: false,
      SSR: false
    },
    writable: true
  });
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => cleanup());

// Mock ResizeObserver
(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock console methods to avoid noise in tests
console.error = vi.fn();
console.warn = vi.fn();
