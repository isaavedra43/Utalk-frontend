// Esquemas de validación con Zod
// Validaciones comunes para formularios y datos
import { z } from 'zod'

// Validaciones básicas
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email es requerido')

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/\d/, 'Debe contener al menos un número')

export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede exceder 50 caracteres')

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, 'Número de teléfono inválido')
  .optional()

// Esquemas de autenticación
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida')
})

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Esquemas de contacto
export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema,
  company: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional()
})

// Esquemas de campaña
export const campaignSchema = z.object({
  name: z.string().min(1, 'Nombre de campaña es requerido').max(100),
  description: z.string().max(500).optional(),
  templateId: z.string().min(1, 'Template es requerido'),
  segmentId: z.string().min(1, 'Segmento es requerido'),
  scheduledAt: z.date().optional()
})

// Tipos TypeScript derivados de los esquemas
export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ContactData = z.infer<typeof contactSchema>
export type CampaignData = z.infer<typeof campaignSchema>