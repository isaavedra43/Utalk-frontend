/**
 * Middlewares de Validación con Joi
 * Valida todos los datos de entrada en endpoints críticos
 * Previene ataques de inyección y datos maliciosos
 */

const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Middleware genérico de validación
 * @param {Object} schema - Esquema Joi
 * @param {string} source - Fuente de datos ('body', 'params', 'query')
 * @returns {Function} - Middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      logger.warn('Validation error', {
        source,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })),
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Reemplazar datos originales con datos validados
    req[source] = value;
    next();
  };
};

/**
 * Esquemas de validación para autenticación
 */
const authSchemas = {
  login: Joi.object({
    identifier: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'Identifier must be at least 3 characters',
        'string.max': 'Identifier must not exceed 100 characters',
        'any.required': 'Identifier is required'
      }),
    password: Joi.string().min(8).max(128).required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
        'any.required': 'Password is required'
      })
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string().email().max(255).required()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must not exceed 255 characters',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(8).max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
        'any.required': 'Password is required'
      }),
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
      }),
    role: Joi.string().valid('admin', 'agent').default('agent')
      .messages({
        'any.only': 'Role must be either admin or agent'
      }),
    department: Joi.string().valid('support', 'sales', 'billing', 'admin').default('support')
      .messages({
        'any.only': 'Department must be one of: support, sales, billing, admin'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().min(8).max(128).required()
      .messages({
        'string.min': 'Current password must be at least 8 characters',
        'string.max': 'Current password must not exceed 128 characters',
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string().min(8).max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.max': 'New password must not exceed 128 characters',
        'string.pattern.base': 'New password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
        'any.required': 'New password is required'
      })
  })
};

/**
 * Esquemas de validación para mensajería
 */
const messageSchemas = {
  sendWhatsApp: Joi.object({
    to: Joi.string().pattern(/^\+\d{10,15}$/).required()
      .messages({
        'string.pattern.base': 'Phone number must be in international format (+1234567890)',
        'any.required': 'Recipient phone number is required'
      }),
    message: Joi.string().min(1).max(1600).required()
      .messages({
        'string.min': 'Message cannot be empty',
        'string.max': 'Message must not exceed 1600 characters',
        'any.required': 'Message content is required'
      }),
    mediaUrl: Joi.string().uri().optional()
      .messages({
        'string.uri': 'Media URL must be a valid URL'
      }),
    conversationId: Joi.string().uuid().optional()
      .messages({
        'string.uuid': 'Conversation ID must be a valid UUID'
      })
  }),

  sendSMS: Joi.object({
    to: Joi.string().pattern(/^\+\d{10,15}$/).required()
      .messages({
        'string.pattern.base': 'Phone number must be in international format (+1234567890)',
        'any.required': 'Recipient phone number is required'
      }),
    message: Joi.string().min(1).max(160).required()
      .messages({
        'string.min': 'Message cannot be empty',
        'string.max': 'SMS message must not exceed 160 characters',
        'any.required': 'Message content is required'
      }),
    conversationId: Joi.string().uuid().optional()
      .messages({
        'string.uuid': 'Conversation ID must be a valid UUID'
      })
  }),

  messageStatus: Joi.object({
    messageId: Joi.string().required()
      .messages({
        'any.required': 'Message ID is required'
      })
  })
};

/**
 * Esquemas de validación para media
 */
const mediaSchemas = {
  upload: Joi.object({
    file: Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().valid(
        // Imágenes
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        // Documentos
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv',
        // Audio
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
        // Video
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'
      ).required()
      .messages({
        'any.only': 'File type not allowed. Supported types: images (jpg, png, gif, webp), documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv), audio (mp3, wav, ogg), video (mp4, mpeg, mov, avi)',
        'any.required': 'File mimetype is required'
      }),
      size: Joi.number().max(50 * 1024 * 1024).required() // 50MB max
        .messages({
          'number.max': 'File size must not exceed 50MB',
          'any.required': 'File size is required'
        }),
      buffer: Joi.binary().required()
        .messages({
          'any.required': 'File buffer is required'
        })
    }).required()
    .messages({
      'any.required': 'File is required'
    })
  })
};

/**
 * Esquemas de validación para CRM
 */
const crmSchemas = {
  createClient: Joi.object({
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Client name must be at least 2 characters',
        'string.max': 'Client name must not exceed 100 characters',
        'any.required': 'Client name is required'
      }),
    email: Joi.string().email().max(255).optional()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must not exceed 255 characters'
      }),
    phone: Joi.string().pattern(/^\+\d{10,15}$/).required()
      .messages({
        'string.pattern.base': 'Phone number must be in international format (+1234567890)',
        'any.required': 'Phone number is required'
      }),
    company: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Company name must not exceed 100 characters'
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed',
        'string.max': 'Each tag must not exceed 50 characters'
      }),
    notes: Joi.string().max(1000).optional()
      .messages({
        'string.max': 'Notes must not exceed 1000 characters'
      })
  }),

  updateClient: Joi.object({
    name: Joi.string().min(2).max(100).optional()
      .messages({
        'string.min': 'Client name must be at least 2 characters',
        'string.max': 'Client name must not exceed 100 characters'
      }),
    email: Joi.string().email().max(255).optional()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.max': 'Email must not exceed 255 characters'
      }),
    phone: Joi.string().pattern(/^\+\d{10,15}$/).optional()
      .messages({
        'string.pattern.base': 'Phone number must be in international format (+1234567890)'
      }),
    company: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Company name must not exceed 100 characters'
      }),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed',
        'string.max': 'Each tag must not exceed 50 characters'
      }),
    notes: Joi.string().max(1000).optional()
      .messages({
        'string.max': 'Notes must not exceed 1000 characters'
      })
  })
};

/**
 * Esquemas de validación para campañas
 */
const campaignSchemas = {
  createCampaign: Joi.object({
    name: Joi.string().min(3).max(100).required()
      .messages({
        'string.min': 'Campaign name must be at least 3 characters',
        'string.max': 'Campaign name must not exceed 100 characters',
        'any.required': 'Campaign name is required'
      }),
    description: Joi.string().max(500).optional()
      .messages({
        'string.max': 'Description must not exceed 500 characters'
      }),
    type: Joi.string().valid('promotional', 'transactional', 'notification').required()
      .messages({
        'any.only': 'Campaign type must be one of: promotional, transactional, notification',
        'any.required': 'Campaign type is required'
      }),
    channel: Joi.string().valid('twilio', 'facebook', 'email', 'webchat').required()
      .messages({
        'any.only': 'Channel must be one of: twilio, facebook, email, webchat',
        'any.required': 'Channel is required'
      }),
    audience: Joi.object({
      segmentId: Joi.string().uuid().optional()
        .messages({
          'string.uuid': 'Segment ID must be a valid UUID'
        }),
      filters: Joi.object({
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
        location: Joi.string().max(100).optional(),
        lastActivity: Joi.string().valid('24h', '7d', '30d', '90d').optional()
      }).optional()
    }).optional(),
    content: Joi.object({
      subject: Joi.string().max(200).optional()
        .messages({
          'string.max': 'Subject must not exceed 200 characters'
        }),
      text: Joi.string().min(1).max(1600).required()
        .messages({
          'string.min': 'Message content cannot be empty',
          'string.max': 'Message content must not exceed 1600 characters',
          'any.required': 'Message content is required'
        }),
      html: Joi.string().max(10000).optional()
        .messages({
          'string.max': 'HTML content must not exceed 10000 characters'
        }),
      mediaUrl: Joi.string().uri().optional()
        .messages({
          'string.uri': 'Media URL must be a valid URL'
        })
    }).required()
    .messages({
      'any.required': 'Campaign content is required'
    }),
    schedule: Joi.object({
      sendNow: Joi.boolean().default(true),
      scheduledDate: Joi.when('sendNow', {
        is: false,
        then: Joi.date().iso().min('now').required()
          .messages({
            'date.min': 'Scheduled date must be in the future',
            'any.required': 'Scheduled date is required when sendNow is false'
          }),
        otherwise: Joi.optional()
      }),
      timezone: Joi.string().default('America/Mexico_City').optional()
    }).optional()
  })
};

/**
 * Esquemas de validación para parámetros de URL
 */
const paramSchemas = {
  userId: Joi.object({
    userId: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'User ID must be a valid UUID',
        'any.required': 'User ID is required'
      })
  }),

  messageId: Joi.object({
    messageId: Joi.string().required()
      .messages({
        'any.required': 'Message ID is required'
      })
  }),

  conversationId: Joi.object({
    conversationId: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'Conversation ID must be a valid UUID',
        'any.required': 'Conversation ID is required'
      })
  }),

  campaignId: Joi.object({
    campaignId: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'Campaign ID must be a valid UUID',
        'any.required': 'Campaign ID is required'
      })
  })
};

/**
 * CORRECCIÓN CRÍTICA: Esquema de paginación definido por separado para evitar referencia circular
 * Este esquema se reutiliza en userFilters y messageFilters sin causar error de inicialización
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).default(20)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    }),
  sort: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt').optional(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

/**
 * Esquemas de validación para query parameters
 * CORRECCIÓN CRÍTICA: Se define después del paginationSchema para evitar referencia circular
 */
const querySchemas = {
  pagination: paginationSchema,

  userFilters: Joi.object({
    role: Joi.string().valid('admin', 'agent').optional(),
    department: Joi.string().valid('support', 'sales', 'billing', 'admin').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().max(100).optional()
      .messages({
        'string.max': 'Search term must not exceed 100 characters'
      })
  }).concat(paginationSchema), // CORREGIDO: Usar paginationSchema en lugar de querySchemas.pagination

  messageFilters: Joi.object({
    channel: Joi.string().valid('twilio', 'facebook', 'email', 'webchat').optional(),
    direction: Joi.string().valid('incoming', 'outgoing').optional(),
    status: Joi.string().valid('pending', 'sent', 'delivered', 'read', 'failed').optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional()
      .messages({
        'date.min': 'Date to must be after date from'
      })
  }).concat(paginationSchema) // CORREGIDO: Usar paginationSchema en lugar de querySchemas.pagination
};

/**
 * Middlewares de validación específicos
 */
const validators = {
  // Autenticación
  validateLogin: validate(authSchemas.login),
  validateRegister: validate(authSchemas.register),
  validateChangePassword: validate(authSchemas.changePassword),

  // Mensajería
  validateSendWhatsApp: validate(messageSchemas.sendWhatsApp),
  validateSendSMS: validate(messageSchemas.sendSMS),
  validateMessageStatus: validate(messageSchemas.messageStatus, 'params'),

  // Media
  validateMediaUpload: validate(mediaSchemas.upload),

  // CRM
  validateCreateClient: validate(crmSchemas.createClient),
  validateUpdateClient: validate(crmSchemas.updateClient),

  // Campañas
  validateCreateCampaign: validate(campaignSchemas.createCampaign),

  // Parámetros
  validateUserId: validate(paramSchemas.userId, 'params'),
  validateMessageId: validate(paramSchemas.messageId, 'params'),
  validateConversationId: validate(paramSchemas.conversationId, 'params'),
  validateCampaignId: validate(paramSchemas.campaignId, 'params'),

  // Query parameters
  validatePagination: validate(querySchemas.pagination, 'query'),
  validateUserFilters: validate(querySchemas.userFilters, 'query'),
  validateMessageFilters: validate(querySchemas.messageFilters, 'query')
};

/**
 * Middleware de validación de archivos multimedia
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateMediaFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'FILE_REQUIRED',
      message: 'File is required'
    });
  }

  const file = req.file;
  const maxSizes = {
    'image': 5 * 1024 * 1024,    // 5MB para imágenes
    'document': 10 * 1024 * 1024, // 10MB para documentos
    'audio': 8 * 1024 * 1024,    // 8MB para audio
    'video': 50 * 1024 * 1024    // 50MB para video
  };

  const allowedTypes = {
    'image': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    'document': [
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ],
    'audio': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    'video': ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
  };

  // Determinar tipo de archivo
  let fileType = null;
  for (const [type, mimeTypes] of Object.entries(allowedTypes)) {
    if (mimeTypes.includes(file.mimetype)) {
      fileType = type;
      break;
    }
  }

  if (!fileType) {
    logger.warn('Invalid file type attempted upload', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: 'INVALID_FILE_TYPE',
      message: 'File type not allowed',
      allowedTypes: Object.values(allowedTypes).flat()
    });
  }

  // Verificar tamaño
  if (file.size > maxSizes[fileType]) {
    logger.warn('File size exceeded', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      maxSize: maxSizes[fileType],
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: `File size exceeds maximum allowed for ${fileType} files`,
      maxSize: maxSizes[fileType],
      currentSize: file.size
    });
  }

  // Agregar información del tipo de archivo al request
  req.fileType = fileType;
  req.maxAllowedSize = maxSizes[fileType];

  next();
};

/**
 * Middleware de sanitización de datos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remover caracteres potencialmente peligrosos
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  validate,
  validators,
  validateMediaFile,
  sanitizeInput,
  authSchemas,
  messageSchemas,
  mediaSchemas,
  crmSchemas,
  campaignSchemas,
  paramSchemas,
  querySchemas
}; 