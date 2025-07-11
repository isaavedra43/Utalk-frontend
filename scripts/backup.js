/**
 * Script de Backup y Recuperación
 * Realiza backups automáticos de Firestore y permite restauración
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../src/utils/logger');

// Configuración
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 30; // Mantener 30 backups
const COLLECTIONS = ['users', 'clients', 'conversations', 'messages', 'refreshTokens', 'campaigns'];

class BackupService {
  constructor() {
    this.db = admin.firestore();
    this.ensureBackupDir();
  }

  /**
   * Crear directorio de backups si no existe
   */
  ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`📁 Directorio de backups creado: ${BACKUP_DIR}`);
    }
  }

  /**
   * Realizar backup completo
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`🔄 Iniciando backup: ${backupName}`);
    
    try {
      // Crear directorio del backup
      fs.mkdirSync(backupPath, { recursive: true });

      // Backup de cada colección
      const backupData = {
        timestamp: new Date().toISOString(),
        collections: {},
        metadata: {
          version: '1.0.0',
          totalDocuments: 0,
          collections: COLLECTIONS.length
        }
      };

      for (const collectionName of COLLECTIONS) {
        console.log(`  📄 Respaldando colección: ${collectionName}`);
        const documents = await this.backupCollection(collectionName);
        backupData.collections[collectionName] = documents;
        backupData.metadata.totalDocuments += documents.length;
        
        // Guardar colección individual
        const collectionFile = path.join(backupPath, `${collectionName}.json`);
        fs.writeFileSync(collectionFile, JSON.stringify(documents, null, 2));
      }

      // Guardar backup completo
      const backupFile = path.join(backupPath, 'backup.json');
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // Crear metadatos del backup
      const metadataFile = path.join(backupPath, 'metadata.json');
      const metadata = {
        ...backupData.metadata,
        timestamp: backupData.timestamp,
        name: backupName,
        size: this.getDirectorySize(backupPath),
        collections: COLLECTIONS
      };
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

      console.log(`✅ Backup completado: ${backupName}`);
      console.log(`   📊 Total documentos: ${backupData.metadata.totalDocuments}`);
      console.log(`   💾 Tamaño: ${this.formatSize(metadata.size)}`);

      // Limpiar backups antiguos
      await this.cleanOldBackups();

      return {
        success: true,
        backupName,
        path: backupPath,
        metadata
      };

    } catch (error) {
      console.error(`❌ Error en backup: ${error.message}`);
      logger.error('Backup failed', error);
      throw error;
    }
  }

  /**
   * Respaldar una colección específica
   */
  async backupCollection(collectionName) {
    try {
      const snapshot = await this.db.collection(collectionName).get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          data: doc.data()
        });
      });

      return documents;
    } catch (error) {
      console.warn(`⚠️  Advertencia: No se pudo respaldar ${collectionName}: ${error.message}`);
      return [];
    }
  }

  /**
   * Restaurar desde backup
   */
  async restoreBackup(backupName, options = {}) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    const backupFile = path.join(backupPath, 'backup.json');

    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup no encontrado: ${backupName}`);
    }

    console.log(`🔄 Iniciando restauración desde: ${backupName}`);

    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      const { dryRun = false, collections = COLLECTIONS } = options;

      if (dryRun) {
        console.log('🧪 Modo dry-run activado - no se realizarán cambios');
      }

      let totalRestored = 0;

      for (const collectionName of collections) {
        if (backupData.collections[collectionName]) {
          console.log(`  📄 Restaurando colección: ${collectionName}`);
          const restored = await this.restoreCollection(
            collectionName, 
            backupData.collections[collectionName],
            dryRun
          );
          totalRestored += restored;
        }
      }

      console.log(`✅ Restauración completada`);
      console.log(`   📊 Total documentos restaurados: ${totalRestored}`);

      return {
        success: true,
        backupName,
        totalRestored,
        dryRun
      };

    } catch (error) {
      console.error(`❌ Error en restauración: ${error.message}`);
      logger.error('Restore failed', error);
      throw error;
    }
  }

  /**
   * Restaurar una colección específica
   */
  async restoreCollection(collectionName, documents, dryRun = false) {
    if (dryRun) {
      console.log(`    🧪 [DRY-RUN] Se restaurarían ${documents.length} documentos en ${collectionName}`);
      return documents.length;
    }

    const batch = this.db.batch();
    let batchCount = 0;
    let totalRestored = 0;

    for (const document of documents) {
      const docRef = this.db.collection(collectionName).doc(document.id);
      batch.set(docRef, document.data);
      batchCount++;
      totalRestored++;

      // Firestore batch limit is 500
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`    ✅ Restaurados ${totalRestored} documentos en ${collectionName}`);
    return totalRestored;
  }

  /**
   * Listar backups disponibles
   */
  listBackups() {
    const backups = [];
    
    if (!fs.existsSync(BACKUP_DIR)) {
      return backups;
    }

    const entries = fs.readdirSync(BACKUP_DIR);
    
    for (const entry of entries) {
      const entryPath = path.join(BACKUP_DIR, entry);
      const metadataFile = path.join(entryPath, 'metadata.json');
      
      if (fs.statSync(entryPath).isDirectory() && fs.existsSync(metadataFile)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
          backups.push({
            name: entry,
            ...metadata,
            path: entryPath
          });
        } catch (error) {
          console.warn(`⚠️  Metadata corrupta para backup: ${entry}`);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Limpiar backups antiguos
   */
  async cleanOldBackups() {
    const backups = this.listBackups();
    
    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      
      for (const backup of toDelete) {
        try {
          fs.rmSync(backup.path, { recursive: true, force: true });
          console.log(`🗑️  Backup eliminado: ${backup.name}`);
        } catch (error) {
          console.warn(`⚠️  No se pudo eliminar backup: ${backup.name}`);
        }
      }
    }
  }

  /**
   * Obtener tamaño de directorio
   */
  getDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += this.getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error calculando tamaño: ${error.message}`);
    }
    
    return size;
  }

  /**
   * Formatear tamaño en bytes
   */
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validar integridad de backup
   */
  async validateBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    const backupFile = path.join(backupPath, 'backup.json');
    const metadataFile = path.join(backupPath, 'metadata.json');

    console.log(`🔍 Validando backup: ${backupName}`);

    const issues = [];

    // Verificar archivos principales
    if (!fs.existsSync(backupFile)) {
      issues.push('Archivo backup.json faltante');
    }

    if (!fs.existsSync(metadataFile)) {
      issues.push('Archivo metadata.json faltante');
    }

    if (issues.length > 0) {
      return { valid: false, issues };
    }

    try {
      // Validar estructura JSON
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

      // Verificar colecciones
      for (const collectionName of COLLECTIONS) {
        const collectionFile = path.join(backupPath, `${collectionName}.json`);
        
        if (!fs.existsSync(collectionFile)) {
          issues.push(`Archivo de colección faltante: ${collectionName}.json`);
          continue;
        }

        try {
          const collectionData = JSON.parse(fs.readFileSync(collectionFile, 'utf8'));
          
          if (!Array.isArray(collectionData)) {
            issues.push(`Formato inválido en colección: ${collectionName}`);
          }
        } catch (error) {
          issues.push(`JSON corrupto en colección: ${collectionName}`);
        }
      }

      // Verificar consistencia de metadatos
      if (metadata.collections.length !== COLLECTIONS.length) {
        issues.push('Inconsistencia en número de colecciones');
      }

      console.log(issues.length === 0 ? '✅ Backup válido' : `❌ ${issues.length} problemas encontrados`);

      return {
        valid: issues.length === 0,
        issues,
        metadata
      };

    } catch (error) {
      return {
        valid: false,
        issues: [`Error de validación: ${error.message}`]
      };
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const backupService = new BackupService();

  try {
    switch (command) {
      case 'create':
        await backupService.createBackup();
        break;

      case 'list':
        const backups = backupService.listBackups();
        console.log('\n📋 Backups disponibles:');
        if (backups.length === 0) {
          console.log('   No hay backups disponibles');
        } else {
          backups.forEach(backup => {
            console.log(`   📦 ${backup.name}`);
            console.log(`      📅 ${new Date(backup.timestamp).toLocaleString()}`);
            console.log(`      📊 ${backup.totalDocuments} documentos`);
            console.log(`      💾 ${backupService.formatSize(backup.size)}`);
            console.log('');
          });
        }
        break;

      case 'restore':
        const backupName = process.argv[3];
        if (!backupName) {
          console.error('❌ Especifica el nombre del backup a restaurar');
          process.exit(1);
        }
        
        const dryRun = process.argv.includes('--dry-run');
        await backupService.restoreBackup(backupName, { dryRun });
        break;

      case 'validate':
        const validateName = process.argv[3];
        if (!validateName) {
          console.error('❌ Especifica el nombre del backup a validar');
          process.exit(1);
        }
        
        const validation = await backupService.validateBackup(validateName);
        if (!validation.valid) {
          console.error('❌ Problemas encontrados:');
          validation.issues.forEach(issue => console.error(`   - ${issue}`));
          process.exit(1);
        }
        break;

      default:
        console.log(`
🔧 Script de Backup y Recuperación

Uso:
  node scripts/backup.js create                    # Crear nuevo backup
  node scripts/backup.js list                      # Listar backups
  node scripts/backup.js restore <nombre>          # Restaurar backup
  node scripts/backup.js restore <nombre> --dry-run # Simular restauración
  node scripts/backup.js validate <nombre>         # Validar backup

Ejemplos:
  node scripts/backup.js create
  node scripts/backup.js restore backup-2024-01-15T10-30-00-000Z
  node scripts/backup.js validate backup-2024-01-15T10-30-00-000Z --dry-run

Configuración:
  📁 Directorio de backups: ${BACKUP_DIR}
  📊 Máximo de backups: ${MAX_BACKUPS}
  📄 Colecciones: ${COLLECTIONS.join(', ')}
        `);
        break;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = BackupService; 