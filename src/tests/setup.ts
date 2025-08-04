/**
 * Configuración de pruebas para UTalk Frontend
 * Configura mocks globales y entorno de testing
 */

import { cleanup } from '@testing-library/svelte';
import { afterEach, vi } from 'vitest';

// Limpiar después de cada prueba
afterEach(() => {
  cleanup();
});

// Mock de console para evitar logs en tests
Object.assign(console, {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

// Mock de ResizeObserver para componentes que lo usan
interface MockResizeObserver {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

(globalThis as { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(
  () =>
    ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }) as MockResizeObserver
);

// Mock de fetch para pruebas de API
(globalThis as { fetch: unknown }).fetch = vi.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock de sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock de location para navegación
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});
