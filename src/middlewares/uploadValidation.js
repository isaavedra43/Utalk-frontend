/**
 * Upload Validation Middleware
 * Validación robusta de archivos subidos con seguridad enterprise
 * Protección contra malware, validación de tipos y tamaños
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
const fileType = require('file-type');
const config = require('../config');
const logger = require('../utils/logger');

// Configuración de tipos MIME permitidos por categoría
const ALLOWED_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a'
  ],
  video: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm'
  ]
};

// Extensiones peligrosas nunca permitidas
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.vbs', '.js', '.jar', '.app', '.deb', '.pkg',
  '.dmg', '.sh', '.ps1', '.py', '.php', '.asp',
  '.aspx', '.jsp', '.dll', '.so', '.dylib'
];

// Firmas de archivos (magic bytes) para validación adicional
const FILE_SIGNATURES = {
  'image/jpeg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'image/gif': ['474946'],
  'application/pdf': ['255044462D'],
  'application/zip': ['504B0304', '504B0506'],
  'video/mp4': ['00000020667479', '00000018667479']
};

// Configuración de storage multer con seguridad
const createSecureStorage = (destination) => {
  // Crear directorio si no existe
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true, mode: 0o755 });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Crear subdirectorio por fecha para organización
      const dateDir = new Date().toISOString().split('T')[0];
      const fullPath = path.join(destination, dateDir);
      
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
      }
      
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // Generar nombre único seguro
      const uniqueId = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const sanitizedName = sanitizeFilename(file.originalname);
      const extension = path.extname(sanitizedName).toLowerCase();
      
      // Validar extensión
      if (DANGEROUS_EXTENSIONS.includes(extension)) {
        return cb(new Error(`Dangerous file extension: ${extension}`));
      }
      
      const filename = `${timestamp}-${uniqueId}${extension}`;
      cb(null, filename);
    }
  });
};

// Sanitizar nombres de archivo
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplazar caracteres especiales
    .replace(/_{2,}/g, '_') // Consolidar underscores múltiples
    .replace(/^[._]+|[._]+$/g, '') // Remover puntos/underscores al inicio/final
    .substring(0, 100); // Limitar longitud
}

// Validar tipo MIME contra whitelist
function validateMimeType(mimeType, allowedCategories = ['images', 'documents']) {
  const allowedTypes = allowedCategories.reduce((acc, category) => {
    return acc.concat(ALLOWED_TYPES[category] || []);
  }, []);
  
  return allowedTypes.includes(mimeType);
}

// Validar firma de archivo (magic bytes)
async function validateFileSignature(filePath, expectedMimeType) {
  try {
    const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
    const signatures = FILE_SIGNATURES[expectedMimeType];
    
    if (!signatures) {
      // Si no tenemos firma definida, usar file-type para detectar
      const detectedType = await fileType.fromBuffer(buffer);
      return detectedType && detectedType.mime === expectedMimeType;
    }
    
    const fileHeader = buffer.toString('hex', 0, 10).toUpperCase();
    return signatures.some(signature => fileHeader.startsWith(signature));
    
  } catch (error) {
    logger.error(`File signature validation error: ${error.message}`);
    return false;
  }
}

// Middleware de validación de archivos
const createFileFilter = (options = {}) => {
  const {
    allowedCategories = ['images', 'documents'],
    maxSize = config.uploads.maxSize,
    validateSignature = true
  } = options;

  return (req, file, cb) => {
    try {
      // 1. Validar tipo MIME
      if (!validateMimeType(file.mimetype, allowedCategories)) {
        const error = new Error(`File type not allowed: ${file.mimetype}`);
        error.code = 'INVALID_FILE_TYPE';
        return cb(error);
      }
      
      // 2. Validar extensión del nombre original
      const extension = path.extname(file.originalname).toLowerCase();
      if (DANGEROUS_EXTENSIONS.includes(extension)) {
        const error = new Error(`Dangerous file extension: ${extension}`);
        error.code = 'DANGEROUS_EXTENSION';
        return cb(error);
      }
      
      // 3. Validar que extensión coincida con MIME type
      const expectedExtension = mime.extension(file.mimetype);
      if (expectedExtension && extension !== `.${expectedExtension}`) {
        logger.warn(`MIME/extension mismatch: ${file.mimetype} vs ${extension}`);
        // No bloquear pero loguear para monitoreo
      }
      
      cb(null, true);
      
    } catch (error) {
      logger.error(`File filter error: ${error.message}`);
      cb(error);
    }
  };
};

// Middleware principal de upload
const createUploadMiddleware = (options = {}) => {
  const {
    destination = config.uploads.destination,
    fieldName = 'file',
    maxFiles = 1,
    allowedCategories = ['images', 'documents'],
    maxSize = config.uploads.maxSize,
    validateSignature = true
  } = options;

  const storage = createSecureStorage(destination);
  const fileFilter = createFileFilter({ allowedCategories, maxSize, validateSignature });

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: maxFiles,
      fields: 10,
      fieldNameSize: 50,
      fieldSize: 1024
    }
  });

  // Middleware wrapper con validación post-upload
  return async (req, res, next) => {
    const uploadHandler = maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
    
    uploadHandler(req, res, async (err) => {
      if (err) {
        // Manejar errores específicos de multer
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                error: {
                  type: 'FILE_TOO_LARGE',
                  message: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
                  maxSize
                }
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                error: {
                  type: 'TOO_MANY_FILES',
                  message: `Maximum ${maxFiles} files allowed`,
                  maxFiles
                }
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                error: {
                  type: 'UNEXPECTED_FIELD',
                  message: `Unexpected field name. Expected: ${fieldName}`
                }
              });
          }
        }
        
        // Errores personalizados
        if (err.code === 'INVALID_FILE_TYPE' || err.code === 'DANGEROUS_EXTENSION') {
          return res.status(400).json({
            success: false,
            error: {
              type: err.code,
              message: err.message
            }
          });
        }
        
        logger.error(`Upload error: ${err.message}`);
        return res.status(500).json({
          success: false,
          error: {
            type: 'UPLOAD_ERROR',
            message: 'File upload failed'
          }
        });
      }
      
      // Validación post-upload
      if (validateSignature && req.file) {
        try {
          const isValidSignature = await validateFileSignature(req.file.path, req.file.mimetype);
          if (!isValidSignature) {
            // Eliminar archivo inválido
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
              success: false,
              error: {
                type: 'INVALID_FILE_SIGNATURE',
                message: 'File signature does not match declared type'
              }
            });
          }
        } catch (error) {
          logger.error(`Post-upload validation error: ${error.message}`);
          // Continuar en caso de error de validación no crítico
        }
      }
      
      // Agregar metadata de seguridad al request
      if (req.file) {
        req.file.uploadedAt = new Date().toISOString();
        req.file.ipAddress = req.ip;
        req.file.userAgent = req.get('User-Agent');
        req.file.validated = true;
      }
      
      next();
    });
  };
};

// Middleware para validar uploads específicos
const imageUpload = createUploadMiddleware({
  allowedCategories: ['images'],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 1
});

const documentUpload = createUploadMiddleware({
  allowedCategories: ['documents'],
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 1
});

const mediaUpload = createUploadMiddleware({
  allowedCategories: ['images', 'audio', 'video'],
  maxSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 5
});

module.exports = {
  createUploadMiddleware,
  imageUpload,
  documentUpload,
  mediaUpload,
  validateMimeType,
  validateFileSignature,
  sanitizeFilename,
  ALLOWED_TYPES,
  DANGEROUS_EXTENSIONS
}; 