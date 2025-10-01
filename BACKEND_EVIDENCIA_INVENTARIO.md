# 📋 Documentación Backend - Funcionalidad de Evidencias para Inventario

## 🎯 Objetivo

Implementar en el backend la funcionalidad de subida y gestión de evidencias (archivos/imágenes) para las plataformas del módulo de inventario.

## 📁 Estructura de Endpoints Requeridos

### ✅ 1. Subir Evidencias
```
POST /api/inventory/evidence/upload
```

**Content-Type**: `multipart/form-data`

**Parámetros del FormData**:
- `files`: File[] - Archivos a subir (múltiples)
- `descriptions`: string[] - Descripciones opcionales para cada archivo
- `platformId`: string - ID de la plataforma
- `module`: string - "inventory" (fijo)
- `entityType`: string - "platform" (fijo)

**Validaciones**:
- ✅ Máximo 10MB por archivo
- ✅ Tipos permitidos: JPG, JPEG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT
- ✅ Máximo 20 archivos por subida
- ✅ Verificar que la plataforma existe

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "evi_123456789",
      "fileName": "foto_material.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2048576,
      "uploadDate": "2025-10-01T10:30:00Z",
      "uploadedBy": "user_123",
      "description": "Foto del material recibido",
      "url": "/uploads/inventory/evidence/evi_123456789_foto_material.jpg"
    }
  ]
}
```

---

### ✅ 2. Obtener Evidencias de una Plataforma
```
GET /api/inventory/evidence/{platformId}
```

**Parámetros**:
- `platformId`: string (en la URL)

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "evi_123456789",
      "fileName": "foto_material.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2048576,
      "uploadDate": "2025-10-01T10:30:00Z",
      "uploadedBy": "user_123",
      "description": "Foto del material recibido",
      "url": "/uploads/inventory/evidence/evi_123456789_foto_material.jpg"
    }
  ]
}
```

---

### ✅ 3. Eliminar Evidencia
```
DELETE /api/inventory/evidence/{evidenceId}
```

**Body**:
```json
{
  "platformId": "platform_123"
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "message": "Evidencia eliminada exitosamente"
}
```

---

## 🗄️ Estructura de Base de Datos

### ✅ Tabla: `inventory_evidence`

```sql
CREATE TABLE inventory_evidence (
  id VARCHAR(255) PRIMARY KEY,
  platform_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  description TEXT,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  INDEX idx_platform_id (platform_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at)
);
```

### ✅ Relación con Plataformas

```sql
-- Asegurar que la tabla platforms existe
ALTER TABLE platforms 
ADD COLUMN evidence_count INT DEFAULT 0;

-- Trigger para actualizar contador de evidencias
DELIMITER //
CREATE TRIGGER update_evidence_count_insert
AFTER INSERT ON inventory_evidence
FOR EACH ROW
BEGIN
  UPDATE platforms 
  SET evidence_count = (
    SELECT COUNT(*) 
    FROM inventory_evidence 
    WHERE platform_id = NEW.platform_id
  )
  WHERE id = NEW.platform_id;
END//

CREATE TRIGGER update_evidence_count_delete
AFTER DELETE ON inventory_evidence
FOR EACH ROW
BEGIN
  UPDATE platforms 
  SET evidence_count = (
    SELECT COUNT(*) 
    FROM inventory_evidence 
    WHERE platform_id = OLD.platform_id
  )
  WHERE id = OLD.platform_id;
END//
DELIMITER ;
```

---

## 📂 Estructura de Archivos

### ✅ Directorio de Almacenamiento

```
/uploads/
  /inventory/
    /evidence/
      /{year}/
        /{month}/
          /evi_{id}_{filename}
```

**Ejemplo**:
```
/uploads/inventory/evidence/2025/10/evi_123456789_foto_material.jpg
```

### ✅ Configuración de Almacenamiento

**Variables de Entorno**:
```env
INVENTORY_EVIDENCE_PATH=/uploads/inventory/evidence
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain
```

---

## 🔒 Validaciones y Seguridad

### ✅ Validaciones de Archivo

```javascript
// Validaciones implementadas
const validateFile = (file) => {
  // 1. Tamaño máximo
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Archivo demasiado grande');
  }
  
  // 2. Tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido');
  }
  
  // 3. Nombre de archivo
  if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
    throw new Error('Nombre de archivo inválido');
  }
  
  // 4. Límite de archivos por plataforma
  const existingCount = await getEvidenceCount(platformId);
  if (existingCount >= 50) {
    throw new Error('Límite de evidencias alcanzado');
  }
};
```

### ✅ Seguridad

- ✅ **Autenticación**: Verificar token JWT en todas las rutas
- ✅ **Autorización**: Verificar que el usuario tenga acceso a la plataforma
- ✅ **Sanitización**: Limpiar nombres de archivo y descripciones
- ✅ **Rate Limiting**: Máximo 10 subidas por minuto por usuario
- ✅ **Antivirus**: Escanear archivos subidos (opcional)

---

## 🔄 Flujo de Implementación

### ✅ Paso 1: Crear Migración
```sql
-- Crear tabla inventory_evidence
-- Agregar columna evidence_count a platforms
-- Crear triggers para contador
```

### ✅ Paso 2: Crear Modelo
```javascript
// models/InventoryEvidence.js
class InventoryEvidence {
  static async create(data) { /* ... */ }
  static async findByPlatformId(platformId) { /* ... */ }
  static async delete(evidenceId, platformId) { /* ... */ }
  static async getCount(platformId) { /* ... */ }
}
```

### ✅ Paso 3: Crear Controlador
```javascript
// controllers/inventoryEvidenceController.js
class InventoryEvidenceController {
  async upload(req, res) { /* ... */ }
  async getByPlatform(req, res) { /* ... */ }
  async delete(req, res) { /* ... */ }
}
```

### ✅ Paso 4: Crear Rutas
```javascript
// routes/inventoryEvidence.js
router.post('/upload', authMiddleware, upload.array('files', 20), evidenceController.upload);
router.get('/:platformId', authMiddleware, evidenceController.getByPlatform);
router.delete('/:evidenceId', authMiddleware, evidenceController.delete);
```

### ✅ Paso 5: Middleware de Upload
```javascript
// middleware/uploadMiddleware.js
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const uploadPath = `${EVIDENCE_PATH}/${year}/${month}`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = generateId();
    const sanitizedName = sanitizeFileName(file.originalname);
    cb(null, `evi_${uniqueId}_${sanitizedName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 20
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});
```

---

## 📊 Endpoints Adicionales (Opcionales)

### ✅ Obtener Estadísticas de Evidencias
```
GET /api/inventory/evidence/stats/{platformId}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "totalFiles": 5,
    "totalSize": 15728640,
    "fileTypes": {
      "image/jpeg": 3,
      "application/pdf": 2
    },
    "lastUpload": "2025-10-01T10:30:00Z"
  }
}
```

### ✅ Descargar Evidencia
```
GET /api/inventory/evidence/download/{evidenceId}
```

**Headers**:
- `Authorization`: Bearer token

**Respuesta**: Archivo binario con headers apropiados

---

## 🧪 Testing

### ✅ Casos de Prueba

1. **Subida Exitosa**:
   - ✅ Archivo válido < 10MB
   - ✅ Tipo de archivo permitido
   - ✅ Plataforma existe
   - ✅ Usuario autenticado

2. **Validaciones**:
   - ✅ Archivo muy grande (>10MB)
   - ✅ Tipo de archivo no permitido
   - ✅ Plataforma no existe
   - ✅ Usuario no autenticado
   - ✅ Límite de archivos alcanzado

3. **Eliminación**:
   - ✅ Evidencia existe
   - ✅ Usuario tiene permisos
   - ✅ Archivo físico eliminado
   - ✅ Registro en BD eliminado

---

## 🚀 Deployment

### ✅ Checklist de Deployment

- ✅ **Base de datos**: Ejecutar migraciones
- ✅ **Archivos**: Crear directorio de uploads con permisos
- ✅ **Variables**: Configurar variables de entorno
- ✅ **Backup**: Configurar backup de archivos
- ✅ **Monitoring**: Configurar logs y métricas
- ✅ **Testing**: Ejecutar suite de pruebas

---

## 📝 Notas Importantes

### ✅ Consideraciones

1. **Performance**: 
   - Implementar CDN para archivos estáticos
   - Compresión de imágenes automática
   - Lazy loading de evidencias

2. **Backup**:
   - Backup automático de archivos
   - Replicación en múltiples servidores
   - Versionado de archivos

3. **Escalabilidad**:
   - Almacenamiento en cloud (AWS S3, etc.)
   - Base de datos optimizada con índices
   - Cache de metadatos

4. **Compliance**:
   - Retención de archivos según políticas
   - Logs de auditoría
   - GDPR compliance si aplica

---

**Fecha**: Octubre 1, 2025  
**Versión**: 1.0  
**Estado**: ✅ **Listo para implementación**
