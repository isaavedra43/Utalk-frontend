import { z } from "zod";

// Schema base para usuarios
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "agent", "viewer"]),
  status: z.enum(["active", "inactive"]).default("active"),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),
});

// Schema para crear/actualizar contacto
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .email("Email inválido")
    .or(z.string().length(0))
    .optional(),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de teléfono inválido"),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  section: z.enum(["leads", "customers", "prospects"]).default("leads"),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  customFields: z.record(z.string()).optional(),
});

// Schema para mensajes
export const messageSchema = z.object({
  to: z
    .string()
    .min(1, "El destinatario es requerido")
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de teléfono inválido"),
  body: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(1600, "El mensaje es demasiado largo"),
  mediaUrl: z
    .string()
    .url("URL de media inválida")
    .optional(),
  type: z.enum(["text", "image", "video", "audio", "document"]).default("text"),
});

// Schema para campañas
export const campaignSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo"),
  description: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional(),
  type: z.enum(["broadcast", "drip", "promotional", "informational"]),
  channels: z.array(z.enum(["whatsapp", "sms", "email"])).min(1, "Selecciona al menos un canal"),
  status: z.enum(["draft", "scheduled", "active", "paused", "completed", "cancelled"]).default("draft"),
  content: z.object({
    subject: z.string().min(1, "El asunto es requerido").max(200),
    body: z.string().min(1, "El contenido es requerido").max(2000),
    mediaUrl: z.string().url().optional(),
  }),
  targeting: z.object({
    segments: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    contactIds: z.array(z.string()).optional(),
    filters: z.record(z.any()).optional(),
  }),
  schedule: z.object({
    sendNow: z.boolean().default(true),
    scheduledAt: z.date().optional(),
    timezone: z.string().default("America/Mexico_City"),
  }),
  settings: z.object({
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    allowUnsubscribe: z.boolean().default(true),
  }),
});

// Schema para documentos de knowledge base
export const documentSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título es demasiado largo"),
  description: z
    .string()
    .max(500, "La descripción es demasiado larga")
    .optional(),
  category: z
    .string()
    .min(1, "La categoría es requerida"),
  tags: z.array(z.string()).default([]),
  content: z
    .string()
    .max(50000, "El contenido es demasiado largo")
    .optional(),
  isPublic: z.boolean().default(false),
  permissions: z.array(z.string()).optional(),
});

// Schema para FAQs
export const faqSchema = z.object({
  question: z
    .string()
    .min(10, "La pregunta debe tener al menos 10 caracteres")
    .max(300, "La pregunta es demasiado larga"),
  answer: z
    .string()
    .min(20, "La respuesta debe tener al menos 20 caracteres")
    .max(2000, "La respuesta es demasiado larga"),
  category: z
    .string()
    .min(1, "La categoría es requerida"),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

// Schema para miembros del equipo
export const teamMemberSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número")
    .optional(),
  role: z.string().min(1, "El rol es requerido"),
  department: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Formato de teléfono inválido")
    .optional(),
  avatar: z.string().url().optional(),
  permissions: z.array(z.string()).optional(),
});

// Schema para roles
export const roleSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del rol debe tener al menos 2 caracteres")
    .max(50, "El nombre del rol es demasiado largo"),
  description: z
    .string()
    .max(200, "La descripción es demasiado larga")
    .optional(),
  permissions: z.array(z.string()).min(1, "Debe seleccionar al menos un permiso"),
});

// Schema para configuración de usuario
export const userSettingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    timezone: z.string().default("America/Mexico_City"),
    language: z.enum(["es", "en"]).default("es"),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    newMessages: z.boolean().default(true),
    campaignUpdates: z.boolean().default(true),
    teamActivity: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    activityVisible: z.boolean().default(false),
    emailVisible: z.boolean().default(false),
  }),
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número"),
  confirmPassword: z
    .string()
    .min(1, "La confirmación de contraseña es requerida"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Schema para filtros de búsqueda
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Schema para configuración de campaña avanzada
export const campaignAdvancedSchema = campaignSchema.extend({
  abTesting: z.object({
    enabled: z.boolean().default(false),
    variantA: z.object({
      name: z.string(),
      content: z.string(),
      percentage: z.number().min(0).max(100),
    }).optional(),
    variantB: z.object({
      name: z.string(),
      content: z.string(),
      percentage: z.number().min(0).max(100),
    }).optional(),
  }).optional(),
  automation: z.object({
    triggers: z.array(z.object({
      type: z.enum(["time", "action", "condition"]),
      config: z.record(z.any()),
    })).optional(),
    actions: z.array(z.object({
      type: z.enum(["send", "wait", "tag", "segment"]),
      config: z.record(z.any()),
    })).optional(),
  }).optional(),
});

// Tipos TypeScript derivados de los schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;
export type DocumentFormData = z.infer<typeof documentSchema>;
export type FAQFormData = z.infer<typeof faqSchema>;
export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
export type RoleFormData = z.infer<typeof roleSchema>;
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>;
export type CampaignAdvancedFormData = z.infer<typeof campaignAdvancedSchema>;

// Esquemas parciales para actualizaciones
export const updateContactSchema = contactSchema.partial();
export const updateCampaignSchema = campaignSchema.partial();
export const updateTeamMemberSchema = teamMemberSchema.partial();
export const updateDocumentSchema = documentSchema.partial();
export const updateFAQSchema = faqSchema.partial();

export type UpdateContactFormData = z.infer<typeof updateContactSchema>;
export type UpdateCampaignFormData = z.infer<typeof updateCampaignSchema>;
export type UpdateTeamMemberFormData = z.infer<typeof updateTeamMemberSchema>;
export type UpdateDocumentFormData = z.infer<typeof updateDocumentSchema>;
export type UpdateFAQFormData = z.infer<typeof updateFAQSchema>; 