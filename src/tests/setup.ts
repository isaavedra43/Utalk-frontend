// Configuración global de testing con Vitest
// Setup para pruebas unitarias y de integración
import '@testing-library/jest-dom'

// Mock básico de matchMedia para pruebas
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Setup para localStorage mock
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
}) 