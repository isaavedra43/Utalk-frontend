import '@testing-library/jest-dom';

// Mock global para window.matchMedia
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
    dispatchEvent: () => {}
  })
});

// Mock para ResizeObserver
interface MockResizeObserver {
  observe(): void;
  unobserve(): void;
  disconnect(): void;
}

(window as typeof window & { ResizeObserver: new () => MockResizeObserver }).ResizeObserver =
  class ResizeObserver implements MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
