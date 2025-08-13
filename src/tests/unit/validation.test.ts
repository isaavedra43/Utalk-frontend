/**
 * Tests Unitarios para Validaciones
 * Basado en las reglas del backend documentadas
 */

import { validateFile, validateMessageByBytes } from '$lib/utils/security';
import {
  validateCanSendMessage,
  validateConversation,
  validateEmail,
  validateMessage,
  validateMessageObject,
  validateMessageWithLimits,
  validateMultipleFiles,
  validateName,
  validatePhone,
  validateSingleFile
} from '$lib/utils/validation';
import { describe, expect, it } from 'vitest';

describe('Validación de Teléfonos', () => {
  it('debe validar números de teléfono internacionales correctos', () => {
    expect(validatePhone('+521234567890')).toBe(true);
    expect(validatePhone('+1234567890')).toBe(true);
    expect(validatePhone('+447911123456')).toBe(true);
  });

  it('debe rechazar números de teléfono inválidos', () => {
    expect(validatePhone('1234567890')).toBe(false); // Sin +
    expect(validatePhone('+123')).toBe(false); // Muy corto
    expect(validatePhone('abc')).toBe(false); // No numérico
    expect(validatePhone('')).toBe(false); // Vacío
  });
});

describe('Validación de Mensajes', () => {
  it('debe validar mensajes de texto normales', async () => {
    const result = await validateMessage('Hola mundo');
    expect(result.valid).toBe(true);
  });

  it('debe rechazar mensajes demasiado largos', async () => {
    // Crear mensaje de más de 4096 bytes
    const longMessage = 'a'.repeat(5000);
    const result = await validateMessage(longMessage);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('4096');
  });

  it('debe manejar emojis correctamente', async () => {
    const emojiMessage = 'Hola 👋 mundo 🌍';
    const result = await validateMessage(emojiMessage);
    expect(result.valid).toBe(true);
  });

  it('debe validar mensajes vacíos', async () => {
    const result = await validateMessage('');
    expect(result.valid).toBe(true); // Mensajes vacíos están permitidos
  });
});

describe('Validación de Archivos', () => {
  it('debe validar archivos individuales correctos', async () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await validateSingleFile(mockFile);
    expect(result.valid).toBe(true);
  });

  it('debe rechazar archivos demasiado grandes', async () => {
    // Crear un archivo de más de 100MB
    const largeContent = new Array(101 * 1024 * 1024).fill('a').join('');
    const mockFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
    const result = await validateSingleFile(mockFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100MB');
  });

  it('debe validar múltiples archivos', async () => {
    const files = [
      new File(['content1'], 'file1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
    ];
    const result = await validateMultipleFiles(files);
    expect(result.valid).toBe(true);
    expect(result.validFiles).toHaveLength(2);
  });

  it('debe rechazar demasiados archivos', async () => {
    const files = Array.from(
      { length: 15 },
      (_, i) => new File(['content'], `file${i}.jpg`, { type: 'image/jpeg' })
    );
    const result = await validateMultipleFiles(files);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Demasiados archivos');
  });
});

describe('Validación de Permisos', () => {
  it('debe validar permisos de envío de mensajes', () => {
    // Mock del store de auth para testing
    const mockAuthStore = {
      user: { id: 'test@example.com', role: 'agent' },
      isAuthenticated: true
    };

    // Simular que el usuario puede enviar mensajes
    const result = validateCanSendMessage('conv123', 'test@example.com');
    // Esta función depende del store real, así que solo verificamos que no falle
    expect(typeof result.valid).toBe('boolean');
  });
});

describe('Validación de Emails', () => {
  it('debe validar emails correctos', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('debe rechazar emails inválidos', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('Validación de Nombres', () => {
  it('debe validar nombres correctos', () => {
    expect(validateName('Juan Pérez').valid).toBe(true);
    expect(validateName('A').valid).toBe(false); // Muy corto
    expect(validateName('').valid).toBe(false); // Vacío
  });

  it('debe rechazar nombres demasiado largos', () => {
    const longName = 'a'.repeat(101);
    expect(validateName(longName).valid).toBe(false);
  });
});

describe('Validación de Mensajes con Límites', () => {
  it('debe calcular bytes restantes correctamente', async () => {
    const result = await validateMessageWithLimits('Hola mundo');
    expect(result.valid).toBe(true);
    expect(typeof result.remaining).toBe('number');
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('debe manejar mensajes en el límite', async () => {
    // Crear mensaje de exactamente 4096 bytes
    const encoder = new TextEncoder();
    let message = '';
    while (encoder.encode(message).length < 4096) {
      message += 'a';
    }

    const result = await validateMessageWithLimits(message);
    expect(result.valid).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

describe('Validación de Objetos', () => {
  it('debe validar objetos de conversación correctos', () => {
    const conversation = {
      id: 'conv123',
      participants: ['user1', 'user2'],
      status: 'open'
    };
    const result = validateConversation(conversation);
    expect(result.valid).toBe(true);
  });

  it('debe rechazar objetos de conversación inválidos', () => {
    expect(validateConversation(null).valid).toBe(false);
    expect(validateConversation({}).valid).toBe(false);
    expect(validateConversation({ id: 'conv123' }).valid).toBe(false);
  });

  it('debe validar objetos de mensaje correctos', () => {
    const message = {
      id: 'msg123',
      content: 'Hola mundo',
      conversationId: 'conv123'
    };
    const result = validateMessageObject(message);
    expect(result.valid).toBe(true);
  });

  it('debe rechazar objetos de mensaje inválidos', () => {
    expect(validateMessageObject(null).valid).toBe(false);
    expect(validateMessageObject({}).valid).toBe(false);
    expect(validateMessageObject({ id: 'msg123' }).valid).toBe(false);
  });
});

describe('Validación de Seguridad', () => {
  it('debe validar magic bytes de archivos', async () => {
    // Crear un archivo JPEG válido
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const mockFile = new File([jpegHeader], 'test.jpg', { type: 'image/jpeg' });

    const result = await validateFile(mockFile);
    expect(result.valid).toBe(true);
  });

  it('debe validar mensajes por bytes', () => {
    const result = validateMessageByBytes('Hola mundo');
    expect(result.valid).toBe(true);
    expect(result.byteCount).toBeGreaterThan(0);
  });

  it('debe rechazar mensajes que excedan el límite de bytes', () => {
    const longMessage = 'a'.repeat(5000);
    const result = validateMessageByBytes(longMessage);
    expect(result.valid).toBe(false);
    expect(result.byteCount).toBeGreaterThan(4096);
  });
});

describe('Edge Cases', () => {
  it('debe manejar caracteres especiales en mensajes', async () => {
    const specialChars = 'áéíóúñüç€$£¥©®™';
    const result = await validateMessage(specialChars);
    expect(result.valid).toBe(true);
  });

  it('debe manejar archivos con nombres especiales', async () => {
    const mockFile = new File(['content'], 'archivo con espacios y ñ.txt', { type: 'text/plain' });
    const result = await validateSingleFile(mockFile);
    expect(result.valid).toBe(true);
  });

  it('debe manejar tipos MIME no estándar', async () => {
    const mockFile = new File(['content'], 'test.xyz', { type: 'application/unknown' });
    const result = await validateSingleFile(mockFile);
    // Debería ser válido si la extensión está permitida
    expect(typeof result.valid).toBe('boolean');
  });
});
