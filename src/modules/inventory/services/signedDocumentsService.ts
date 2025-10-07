import type { Platform } from '../types';

export interface SignedDocument {
  id: string;
  platformId: string;
  platformNumber: string;
  documentType: 'pdf' | 'image';
  signatureData: string;
  createdAt: Date;
  fileName: string;
  fileSize?: number;
}

class SignedDocumentsService {
  private static STORAGE_KEY = 'signed_documents';

  /**
   * Guarda un documento firmado
   */
  static saveSignedDocument(
    platform: Platform,
    documentType: 'pdf' | 'image',
    signatureData: string,
    fileContent?: Blob
  ): SignedDocument {
    const signedDocument: SignedDocument = {
      id: `signed_${platform.id}_${Date.now()}`,
      platformId: platform.id,
      platformNumber: platform.platformNumber,
      documentType,
      signatureData,
      createdAt: new Date(),
      fileName: this.generateFileName(platform, documentType, true),
      fileSize: fileContent?.size
    };

    // Obtener documentos existentes
    const existing = this.getSignedDocuments();

    // Agregar nuevo documento
    existing.push(signedDocument);

    // Guardar en localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));

    return signedDocument;
  }

  /**
   * Obtiene todos los documentos firmados
   */
  static getSignedDocuments(): SignedDocument[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const documents = JSON.parse(stored);
      // Convertir fechas de vuelta a objetos Date
      return documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt)
      }));
    } catch (error) {
      console.error('Error al obtener documentos firmados:', error);
      return [];
    }
  }

  /**
   * Obtiene documentos firmados por plataforma
   */
  static getSignedDocumentsByPlatform(platformId: string): SignedDocument[] {
    return this.getSignedDocuments().filter(doc => doc.platformId === platformId);
  }

  /**
   * Elimina un documento firmado
   */
  static deleteSignedDocument(documentId: string): boolean {
    try {
      const documents = this.getSignedDocuments();
      const filtered = documents.filter(doc => doc.id !== documentId);

      if (filtered.length !== documents.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar documento firmado:', error);
      return false;
    }
  }

  /**
   * Genera nombre de archivo para documento firmado
   */
  private static generateFileName(platform: Platform, type: 'pdf' | 'image', withSignature: boolean): string {
    const date = new Date().toISOString().split('T')[0];
    const suffix = withSignature ? '_Firmado' : '';
    const extension = type === 'pdf' ? 'pdf' : 'png';

    return `Plataforma_${platform.platformNumber}${suffix}_${date}.${extension}`;
  }

  /**
   * Descarga un documento firmado
   */
  static downloadSignedDocument(document: SignedDocument): void {
    try {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = document.signatureData;
      link.download = document.fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar documento firmado:', error);
      throw error;
    }
  }

  /**
   * Limpia documentos antiguos (más de 30 días)
   */
  static cleanupOldDocuments(): number {
    try {
      const documents = this.getSignedDocuments();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filtered = documents.filter(doc => doc.createdAt > thirtyDaysAgo);

      if (filtered.length !== documents.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return documents.length - filtered.length;
      }

      return 0;
    } catch (error) {
      console.error('Error al limpiar documentos antiguos:', error);
      return 0;
    }
  }
}

export { SignedDocumentsService };
