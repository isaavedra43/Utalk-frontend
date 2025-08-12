// src/lib/utils/dev-logger.ts
const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta.env?.DEV || import.meta.env?.MODE === 'development');

export const devLogger = {
  debug: (...args: unknown[]) => { if (isDev) console.debug('[DEBUG]', ...args); },
  info:  (...args: unknown[]) => { if (isDev) console.info('[INFO]', ...args); },
  warn:  (...args: unknown[]) => { console.warn('[WARN]', ...args); },
  error: (...args: unknown[]) => { console.error('[ERROR]', ...args); },
}; 