import { beforeAll, describe, expect, it, vi } from 'vitest';

// Mock env antes de importar módulos que lo usan
beforeAll(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
  vi.stubEnv('VITE_WS_URL', 'ws://localhost:3001');
});

describe('Constants', () => {
  it('should have correct app configuration', async () => {
    const { APP_CONFIG } = await import('./constants.js');
    expect(APP_CONFIG.NAME).toBe('UTalk');
    expect(APP_CONFIG.VERSION).toBe('1.0.0');
    expect(APP_CONFIG.DESCRIPTION).toContain('Sistema de mensajería');
  });

  it('should have correct message configuration limits', async () => {
    const { MESSAGE_CONFIG } = await import('./constants.js');
    expect(MESSAGE_CONFIG.MAX_LENGTH).toBe(4096);
    expect(MESSAGE_CONFIG.MAX_ATTACHMENTS).toBe(10);
    expect(MESSAGE_CONFIG.MAX_FILE_SIZE_MB).toBe(100);
  });

  it('should have all user roles defined', async () => {
    const { USER_ROLES } = await import('./constants.js');
    expect(USER_ROLES.VIEWER).toBe('viewer');
    expect(USER_ROLES.AGENT).toBe('agent');
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.SUPERADMIN).toBe('superadmin');
  });

  it('should have supported file types', async () => {
    const { MESSAGE_CONFIG } = await import('./constants.js');
    expect(MESSAGE_CONFIG.SUPPORTED_FILE_TYPES.image).toContain('image/jpeg');
    expect(MESSAGE_CONFIG.SUPPORTED_FILE_TYPES.video).toContain('video/mp4');
  });
});
