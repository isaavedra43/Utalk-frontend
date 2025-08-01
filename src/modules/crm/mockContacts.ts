// Datos mock para el módulo CRM
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  position: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed'
  channel: 'email' | 'phone' | 'linkedin' | 'website' | 'referral'
  owner: string
  tags: string[]
  lastActivity: string
  createdAt: string
  updatedAt: string
  notes?: string
  value?: number
  probability?: number
}

export interface CRMStats {
  totalContacts: number
  newContacts: number
  qualifiedContacts: number
  closedDeals: number
  totalValue: number
  averageDealValue: number
  conversionRate: number
  responseTime: number
}

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@empresa.com',
    phone: '+34 600 123 456',
    company: 'TechCorp',
    position: 'CEO',
    status: 'qualified',
    channel: 'linkedin',
    owner: 'me',
    tags: ['tech', 'enterprise'],
    lastActivity: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    notes: 'Interesado en solución empresarial',
    value: 50000,
    probability: 0.8
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@startup.com',
    phone: '+34 600 789 012',
    company: 'StartupXYZ',
    position: 'CTO',
    status: 'new',
    channel: 'email',
    owner: 'team',
    tags: ['startup', 'tech'],
    lastActivity: '2024-01-14T14:20:00Z',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    value: 25000,
    probability: 0.6
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@consulting.com',
    phone: '+34 600 345 678',
    company: 'ConsultingPro',
    position: 'Director',
    status: 'proposal',
    channel: 'phone',
    owner: 'me',
    tags: ['consulting', 'enterprise'],
    lastActivity: '2024-01-13T16:45:00Z',
    createdAt: '2024-01-08T11:15:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    notes: 'Propuesta enviada, esperando respuesta',
    value: 75000,
    probability: 0.7
  }
]

export const mockCRMStats: CRMStats = {
  totalContacts: 156,
  newContacts: 23,
  qualifiedContacts: 45,
  closedDeals: 12,
  totalValue: 1250000,
  averageDealValue: 104167,
  conversionRate: 0.26,
  responseTime: 2.3
} 