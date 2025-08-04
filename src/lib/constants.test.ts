import { describe, it, expect } from 'vitest';
import { APP_CONFIG, MESSAGE_CONFIG, USER_ROLES } from './constants';

describe('Constants', () => {
  it('should have correct app configuration', () => {
    expect(APP_CONFIG.NAME).toBe('UTalk');
    expect(APP_CONFIG.VERSION).toBe('1.0.0');
    expect(APP_CONFIG.DESCRIPTION).toBeTruthy();
  });

  it('should have correct message configuration limits', () => {
    expect(MESSAGE_CONFIG.MAX_LENGTH).toBe(4096);
    expect(MESSAGE_CONFIG.MAX_ATTACHMENTS).toBe(10);
    expect(MESSAGE_CONFIG.MAX_FILE_SIZE_MB).toBe(100);
  });

  it('should have all user roles defined', () => {
    expect(USER_ROLES.VIEWER).toBe('viewer');
    expect(USER_ROLES.AGENT).toBe('agent');
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.SUPERADMIN).toBe('superadmin');
  });

  it('should have supported file types', () => {
    expect(MESSAGE_CONFIG.SUPPORTED_FILE_TYPES.image).toContain('image/jpeg');
    expect(MESSAGE_CONFIG.SUPPORTED_FILE_TYPES.video).toContain('video/mp4');
    expect(MESSAGE_CONFIG.SUPPORTED_FILE_TYPES.document).toContain('application/pdf');
  });
});
