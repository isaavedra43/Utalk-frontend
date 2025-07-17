/**
 * Script de migración para Firestore Messages
 * 
 * Este script migra mensajes antiguos que solo tienen el campo 'createdAt'
 * y les agrega el campo 'timestamp' con el mismo valor.
 * 
 * USO:
 * npm run migrate:messages
 * 
 * REQUISITOS:
 * - Configurar variables de entorno de Firebase
 * - Tener permisos de admin en Firestore
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  writeBatch,
  query,
  where,
  limit,
  startAfter,
  doc,
  DocumentSnapshot
} from 'firebase/firestore';

// Configuración de Firebase para script de migración
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface MigrationStats {
  totalConversations: number;
  totalMessages: number;
  migratedMessages: number;
  errorsCount: number;
  conversationsProcessed: number;
  errors: Array<{ conversationId: string; messageId: string; error: string }>;
}

class FirestoreMessageMigration {
  private stats: MigrationStats = {
    totalConversations: 0,
    totalMessages: 0,
    migratedMessages: 0,
    errorsCount: 0,
    conversationsProcessed: 0,
    errors: []
  };

  private batchSize = 500; // Firestore batch limit

  async migrateAllMessages(dryRun = false): Promise<MigrationStats> {
    console.log('🚀 Iniciando migración de mensajes Firestore...');
    console.log(`📝 Modo: ${dryRun ? 'DRY RUN (sin cambios)' : 'MIGRACIÓN REAL'}`);
    
    try {
      // Obtener todas las conversaciones
      const conversationsRef = collection(db, 'conversations');
      const conversationsSnapshot = await getDocs(conversationsRef);
      
      this.stats.totalConversations = conversationsSnapshot.size;
      console.log(`📊 Total conversaciones encontradas: ${this.stats.totalConversations}`);

      // Procesar cada conversación
      for (const conversationDoc of conversationsSnapshot.docs) {
        const conversationId = conversationDoc.id;
        console.log(`\n🔄 Procesando conversación: ${conversationId}`);
        
        try {
          await this.migrateConversationMessages(conversationId, dryRun);
          this.stats.conversationsProcessed++;
        } catch (error) {
          console.error(`❌ Error procesando conversación ${conversationId}:`, error);
          this.stats.errorsCount++;
          this.stats.errors.push({
            conversationId,
            messageId: 'N/A',
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      console.log('\n✅ Migración completada!');
      this.printStats();
      
      return this.stats;

    } catch (error) {
      console.error('❌ Error fatal en migración:', error);
      throw error;
    }
  }

  private async migrateConversationMessages(conversationId: string, dryRun: boolean): Promise<void> {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    let lastDoc: DocumentSnapshot | null = null;
    let hasMore = true;
    let conversationMessageCount = 0;

    while (hasMore) {
      // Crear query paginado
      let q = query(messagesRef, limit(this.batchSize));
      if (lastDoc) {
        q = query(messagesRef, startAfter(lastDoc), limit(this.batchSize));
      }

      const messagesSnapshot = await getDocs(q);
      
      if (messagesSnapshot.empty) {
        hasMore = false;
        break;
      }

      const batch = writeBatch(db);
      let batchOperations = 0;

      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        conversationMessageCount++;
        
        // Verificar si necesita migración
        if (this.needsMigration(messageData)) {
          const migratedData = this.prepareMigrationData(messageData);
          
          if (!dryRun) {
            const messageRef = doc(db, 'conversations', conversationId, 'messages', messageDoc.id);
            batch.update(messageRef, migratedData);
            batchOperations++;
          }
          
          this.stats.migratedMessages++;
          
          console.log(`  ✨ Mensaje migrado: ${messageDoc.id} (${messageData.createdAt ? 'createdAt' : 'sin fecha'} → timestamp)`);
        }
      }

      // Ejecutar batch si hay operaciones
      if (batchOperations > 0 && !dryRun) {
        await batch.commit();
        console.log(`  💾 Batch ejecutado: ${batchOperations} actualizaciones`);
      }

      // Preparar siguiente iteración
      lastDoc = messagesSnapshot.docs[messagesSnapshot.docs.length - 1];
      hasMore = messagesSnapshot.docs.length === this.batchSize;
    }

    this.stats.totalMessages += conversationMessageCount;
    console.log(`  📊 Mensajes en conversación: ${conversationMessageCount}`);
  }

  private needsMigration(messageData: any): boolean {
    // Necesita migración si:
    // 1. Tiene createdAt pero NO tiene timestamp
    // 2. O si timestamp está vacío/null
    return (
      (messageData.createdAt && !messageData.timestamp) ||
      (messageData.timestamp === null || messageData.timestamp === undefined)
    );
  }

  private prepareMigrationData(messageData: any): any {
    const migrationData: any = {};

    // Agregar timestamp si falta
    if (!messageData.timestamp && messageData.createdAt) {
      migrationData.timestamp = messageData.createdAt;
    }

    // Si no hay ningún campo de fecha, usar fecha actual
    if (!messageData.timestamp && !messageData.createdAt) {
      const now = new Date();
      migrationData.timestamp = now;
      migrationData.createdAt = now;
    }

    return migrationData;
  }

  private printStats(): void {
    console.log('\n📈 ESTADÍSTICAS DE MIGRACIÓN:');
    console.log('================================');
    console.log(`📁 Conversaciones totales: ${this.stats.totalConversations}`);
    console.log(`📁 Conversaciones procesadas: ${this.stats.conversationsProcessed}`);
    console.log(`💬 Mensajes totales: ${this.stats.totalMessages}`);
    console.log(`✨ Mensajes migrados: ${this.stats.migratedMessages}`);
    console.log(`❌ Errores: ${this.stats.errorsCount}`);
    console.log(`📊 Ratio migración: ${((this.stats.migratedMessages / this.stats.totalMessages) * 100).toFixed(2)}%`);

    if (this.stats.errors.length > 0) {
      console.log('\n🚨 ERRORES ENCONTRADOS:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. Conversación: ${error.conversationId}, Mensaje: ${error.messageId}`);
        console.log(`   Error: ${error.error}`);
      });
    }
  }

  // Método para validar la migración
  async validateMigration(): Promise<boolean> {
    console.log('🔍 Validando migración...');
    
    try {
      const conversationsRef = collection(db, 'conversations');
      const conversationsSnapshot = await getDocs(conversationsRef);
      
      let totalMessages = 0;
      let validMessages = 0;

      for (const conversationDoc of conversationsSnapshot.docs) {
        const messagesRef = collection(db, 'conversations', conversationDoc.id, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);

        for (const messageDoc of messagesSnapshot.docs) {
          const messageData = messageDoc.data();
          totalMessages++;

          if (messageData.timestamp || messageData.createdAt) {
            validMessages++;
          } else {
            console.warn(`⚠️ Mensaje sin timestamp: ${conversationDoc.id}/${messageDoc.id}`);
          }
        }
      }

      const isValid = validMessages === totalMessages;
      
      console.log(`📊 Validación: ${validMessages}/${totalMessages} mensajes tienen timestamp`);
      console.log(`✅ Resultado: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
      
      return isValid;

    } catch (error) {
      console.error('❌ Error en validación:', error);
      return false;
    }
  }
}

// Función principal para ejecutar la migración
async function runMigration() {
  const migration = new FirestoreMessageMigration();
  
  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const validate = args.includes('--validate');

  if (validate) {
    console.log('🔍 Ejecutando solo validación...');
    const isValid = await migration.validateMigration();
    process.exit(isValid ? 0 : 1);
  }

  if (dryRun) {
    console.log('⚠️ Ejecutando en modo DRY RUN - no se realizarán cambios');
  }

  try {
    const stats = await migration.migrateAllMessages(dryRun);
    
    if (stats.errorsCount > 0) {
      console.log('⚠️ Migración completada con errores');
      process.exit(1);
    } else {
      console.log('✅ Migración completada exitosamente');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration();
}

export { FirestoreMessageMigration }; 