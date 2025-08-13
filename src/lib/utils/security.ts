/**
 * Sistema de Seguridad para UTalk
 * Validación de archivos, sanitización de contenido y prevención de XSS
 */

import { logStore } from '$lib/utils/logger';

// Magic bytes para validación de archivos
const MAGIC_BYTES: Record<string, number[]> = {
  // Imágenes
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/gif': [0x47, 0x49, 0x46, 0x38],

  // Audio
  'audio/mpeg': [0xff, 0xfb],
  'audio/ogg': [0x4f, 0x67, 0x67, 0x53],
  'audio/wav': [0x52, 0x49, 0x46, 0x46],

  // Video
  'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
  'video/webm': [0x1a, 0x45, 0xdf, 0xa3],

  // Documentos
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
};

// Extensiones permitidas según el backend
const ALLOWED_EXTENSIONS = [
  // Imágenes
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  // Audio
  '.mp3',
  '.ogg',
  '.wav',
  // Video
  '.mp4',
  '.webm',
  // Documentos
  '.pdf'
];

// Extensiones bloqueadas por seguridad
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.msi',
  '.dmg',
  '.app',
  '.sh',
  '.py',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.pl',
  '.cgi',
  '.htaccess',
  '.htpasswd'
];

class SecurityManager {
  /**
   * Valida un archivo por magic bytes y extensión
   */
  async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    logStore('security: validando archivo', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    // Validar extensión
    const extension = this.getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      const error = `Extensión no permitida: ${extension}`;
      logStore('security: extensión bloqueada', { extension, filename: file.name });
      return { valid: false, error };
    }

    // Verificar extensiones bloqueadas
    if (BLOCKED_EXTENSIONS.includes(extension.toLowerCase())) {
      const error = `Tipo de archivo bloqueado por seguridad: ${extension}`;
      logStore('security: archivo bloqueado por seguridad', { extension, filename: file.name });
      return { valid: false, error };
    }

    // Validar tamaño (100MB máximo según backend)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      const error = `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo 100MB)`;
      logStore('security: archivo demasiado grande', {
        size: file.size,
        maxSize,
        filename: file.name
      });
      return { valid: false, error };
    }

    // Validar magic bytes si el tipo MIME está soportado
    if (MAGIC_BYTES[file.type]) {
      const isValidMagicBytes = await this.validateMagicBytes(file, file.type);
      if (!isValidMagicBytes) {
        const error = `Tipo de archivo no válido: ${file.type}`;
        logStore('security: magic bytes inválidos', {
          type: file.type,
          filename: file.name
        });
        return { valid: false, error };
      }
    }

    logStore('security: archivo válido', {
      filename: file.name,
      type: file.type,
      size: file.size
    });

    return { valid: true };
  }

  /**
   * Valida magic bytes de un archivo
   */
  private async validateMagicBytes(file: File, expectedType: string): Promise<boolean> {
    const expectedBytes = MAGIC_BYTES[expectedType];
    if (!expectedBytes) return true; // Si no hay magic bytes definidos, permitir

    try {
      const arrayBuffer = await file.slice(0, expectedBytes.length).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      for (let i = 0; i < expectedBytes.length; i++) {
        if (bytes[i] !== expectedBytes[i]) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logStore('security: error validando magic bytes', {
        error: String(error),
        filename: file.name
      });
      return false;
    }
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  /**
   * Sanitiza contenido HTML para prevenir XSS
   */
  sanitizeContent(content: string): string {
    if (!content) return '';

    // Lista de tags y atributos permitidos
    const allowedTags = ['b', 'i', 'em', 'strong', 'u', 'br', 'p'];
    const allowedAttributes = ['class'];

    // Crear un elemento temporal para sanitizar
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Remover scripts y elementos peligrosos
    const scripts = tempDiv.querySelectorAll(
      'script, iframe, object, embed, form, input, button, select, textarea'
    );
    scripts.forEach(element => element.remove());

    // Remover atributos peligrosos
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      const allowedAttrs = Array.from(element.attributes).filter(
        attr => allowedAttributes.includes(attr.name) || attr.name.startsWith('data-')
      );

      // Remover todos los atributos y agregar solo los permitidos
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttrs.includes(attr)) {
          element.removeAttribute(attr.name);
        }
      });
    });

    // Remover tags no permitidos
    const allTags = tempDiv.querySelectorAll('*');
    allTags.forEach(element => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        // Reemplazar con el contenido interno
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      }
    });

    const sanitizedContent = tempDiv.innerHTML;

    logStore('security: contenido sanitizado', {
      originalLength: content.length,
      sanitizedLength: sanitizedContent.length,
      hasChanges: content !== sanitizedContent
    });

    return sanitizedContent;
  }

  /**
   * Valida un mensaje por bytes (no caracteres)
   */
  validateMessageByBytes(content: string): { valid: boolean; error?: string; byteCount: number } {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    const byteCount = bytes.length;
    const maxBytes = 4096; // Límite del backend

    if (byteCount > maxBytes) {
      const error = `Mensaje demasiado largo: ${byteCount} bytes (máximo ${maxBytes} bytes)`;
      logStore('security: mensaje demasiado largo', {
        byteCount,
        maxBytes,
        characterCount: content.length
      });
      return { valid: false, error, byteCount };
    }

    logStore('security: mensaje válido', {
      byteCount,
      characterCount: content.length
    });

    return { valid: true, byteCount };
  }

  /**
   * Valida múltiples archivos
   */
  async validateFiles(
    files: File[]
  ): Promise<{ valid: boolean; error?: string; validFiles: File[] }> {
    const maxFiles = 10; // Límite del backend
    const validFiles: File[] = [];

    if (files.length > maxFiles) {
      const error = `Demasiados archivos: ${files.length} (máximo ${maxFiles})`;
      logStore('security: demasiados archivos', {
        fileCount: files.length,
        maxFiles
      });
      return { valid: false, error, validFiles: [] };
    }

    for (const file of files) {
      const validation = await this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        logStore('security: archivo inválido', {
          filename: file.name,
          error: validation.error
        });
        return { valid: false, error: validation.error, validFiles: [] };
      }
    }

    logStore('security: todos los archivos válidos', {
      fileCount: validFiles.length
    });

    return { valid: true, validFiles };
  }

  /**
   * Escapa contenido para uso seguro en HTML
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Valida URL para uso seguro
   */
  validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Solo permitir HTTP y HTTPS
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Genera un hash seguro para archivos
   */
  async generateFileHash(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logStore('security: error generando hash', {
        error: String(error),
        filename: file.name
      });
      return '';
    }
  }
}

// Instancia global del gestor de seguridad
export const securityManager = new SecurityManager();

// Funciones de conveniencia para uso directo
export const validateFile = (file: File) => securityManager.validateFile(file);
export const validateFiles = (files: File[]) => securityManager.validateFiles(files);
export const validateMessageByBytes = (content: string) =>
  securityManager.validateMessageByBytes(content);
export const sanitizeContent = (content: string) => securityManager.sanitizeContent(content);
export const escapeHtml = (text: string) => securityManager.escapeHtml(text);
export const validateUrl = (url: string) => securityManager.validateUrl(url);
export const generateFileHash = (file: File) => securityManager.generateFileHash(file);
