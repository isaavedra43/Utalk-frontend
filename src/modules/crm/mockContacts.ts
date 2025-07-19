// Datos mock para el módulo CRM de UTalk
// Incluye contactos, KPIs y datos de ejemplo para todas las vistas

export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'customer' | 'lead'
export type ContactChannel = 'whatsapp' | 'facebook' | 'email' | 'sms' | 'web'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  owner: string
  status: ContactStatus
  channel: ContactChannel
  lastMessage: string
  lastActivity: Date
  iaTag: string
  iaPercentage: number
  tags: string[]
  avatar?: string
  company?: string
  value: number
  conversions: number
}

export interface CRMStats {
  avgResponseTime: string
  closedChats: number
  conversionRate: number
  inactiveClients: number
  avgClientValue: number
  totalContacts: number
  activeContacts: number
  newContactsThisMonth: number
}

// Datos mock de estadísticas del CRM
export const mockCRMStats: CRMStats = {
  avgResponseTime: '2.5 min',
  closedChats: 1247,
  conversionRate: 68.5,
  inactiveClients: 23,
  avgClientValue: 2450,
  totalContacts: 1847,
  activeContacts: 1324,
  newContactsThisMonth: 156
}

// Datos mock de contactos
export const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    name: 'María García López',
    email: 'maria.garcia@empresa.com',
    phone: '+52 55 1234 5678',
    owner: 'Ana Martínez',
    status: 'customer',
    channel: 'whatsapp',
    lastMessage: 'Gracias por la información, me interesa el producto premium',
    lastActivity: new Date(Date.now() - 300000), // 5 min ago
    iaTag: 'Alta Conversión',
    iaPercentage: 92,
    tags: ['premium', 'interesado'],
    company: 'Tech Solutions SA',
    value: 5200,
    conversions: 3
  },
  {
    id: 'contact_2',
    name: 'Carlos Rodríguez',
    email: 'carlos.r@startup.mx',
    phone: '+52 81 9876 5432',
    owner: 'Luis Hernández',
    status: 'prospect',
    channel: 'email',
    lastMessage: '¿Podrían enviarme más detalles sobre los precios?',
    lastActivity: new Date(Date.now() - 1800000), // 30 min ago
    iaTag: 'Evaluando Precio',
    iaPercentage: 76,
    tags: ['precio', 'evaluando'],
    company: 'StartupMX',
    value: 2800,
    conversions: 0
  },
  {
    id: 'contact_3',
    name: 'Sandra Jiménez',
    email: 'sandra.j@comercial.com',
    phone: '+52 33 5555 0123',
    owner: 'Pedro Silva',
    status: 'active',
    channel: 'facebook',
    lastMessage: 'Necesito agendar una reunión para la próxima semana',
    lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
    iaTag: 'Reunión Pendiente',
    iaPercentage: 85,
    tags: ['reunión', 'urgente'],
    company: 'Comercial Global',
    value: 3400,
    conversions: 1
  },
  {
    id: 'contact_4',
    name: 'Roberto González',
    email: 'roberto.gonzalez@pyme.mx',
    phone: '+52 55 7777 8888',
    owner: 'Carmen López',
    status: 'lead',
    channel: 'sms',
    lastMessage: 'Hola, vi su anuncio y me gustaría saber más',
    lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
    iaTag: 'Primer Contacto',
    iaPercentage: 45,
    tags: ['nuevo', 'anuncio'],
    company: 'PYME México',
    value: 1200,
    conversions: 0
  },
  {
    id: 'contact_5',
    name: 'Elena Vásquez',
    email: 'elena.v@corporativo.com',
    phone: '+52 22 3333 4444',
    owner: 'Ana Martínez',
    status: 'inactive',
    channel: 'web',
    lastMessage: 'Déjenme pensarlo y les escribo la próxima semana',
    lastActivity: new Date(Date.now() - 86400000 * 7), // 1 week ago
    iaTag: 'Sin Respuesta',
    iaPercentage: 15,
    tags: ['inactivo', 'seguimiento'],
    company: 'Corporativo SA',
    value: 800,
    conversions: 0
  },
  {
    id: 'contact_6',
    name: 'Fernando Morales',
    email: 'fernando.m@tecnologia.mx',
    phone: '+52 55 9999 0000',
    owner: 'Luis Hernández',
    status: 'customer',
    channel: 'whatsapp',
    lastMessage: 'Perfecto, procedo con la compra del paquete empresarial',
    lastActivity: new Date(Date.now() - 600000), // 10 min ago
    iaTag: 'Compra Confirmada',
    iaPercentage: 98,
    tags: ['empresarial', 'confirmado'],
    company: 'TecnoMX',
    value: 8500,
    conversions: 2
  },
  {
    id: 'contact_7',
    name: 'Patricia Ruiz',
    email: 'patricia.ruiz@educacion.gob.mx',
    phone: '+52 55 1111 2222',
    owner: 'Carmen López',
    status: 'prospect',
    channel: 'email',
    lastMessage: 'Necesitamos cotización para 500 licencias educativas',
    lastActivity: new Date(Date.now() - 1200000), // 20 min ago
    iaTag: 'Oportunidad Grande',
    iaPercentage: 88,
    tags: ['educación', 'gobierno', 'volumen'],
    company: 'SEP',
    value: 25000,
    conversions: 0
  },
  {
    id: 'contact_8',
    name: 'Diego Castillo',
    email: 'diego.c@freelancer.com',
    phone: '+52 81 6666 7777',
    owner: 'Pedro Silva',
    status: 'lead',
    channel: 'facebook',
    lastMessage: 'Soy freelancer, ¿tienen descuentos para independientes?',
    lastActivity: new Date(Date.now() - 5400000), // 1.5 hours ago
    iaTag: 'Busca Descuento',
    iaPercentage: 62,
    tags: ['freelancer', 'descuento'],
    company: 'Independiente',
    value: 450,
    conversions: 0
  }
]

// Filtros disponibles para el CRM
export const contactStatusOptions = [
  { value: 'all', label: 'Todos los Estados', count: mockContacts.length },
  { value: 'active', label: 'Activos', count: mockContacts.filter(c => c.status === 'active').length },
  { value: 'customer', label: 'Clientes', count: mockContacts.filter(c => c.status === 'customer').length },
  { value: 'prospect', label: 'Prospectos', count: mockContacts.filter(c => c.status === 'prospect').length },
  { value: 'lead', label: 'Leads', count: mockContacts.filter(c => c.status === 'lead').length },
  { value: 'inactive', label: 'Inactivos', count: mockContacts.filter(c => c.status === 'inactive').length }
]

export const contactChannelOptions = [
  { value: 'all', label: 'Todos los Canales', count: mockContacts.length },
  { value: 'whatsapp', label: 'WhatsApp', count: mockContacts.filter(c => c.channel === 'whatsapp').length },
  { value: 'email', label: 'Email', count: mockContacts.filter(c => c.channel === 'email').length },
  { value: 'facebook', label: 'Facebook', count: mockContacts.filter(c => c.channel === 'facebook').length },
  { value: 'sms', label: 'SMS', count: mockContacts.filter(c => c.channel === 'sms').length },
  { value: 'web', label: 'Web', count: mockContacts.filter(c => c.channel === 'web').length }
]

// Función helper para obtener el color del status
export const getStatusColor = (status: ContactStatus): string => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    customer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    lead: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
  return colors[status]
}

// Función helper para obtener el ícono del canal
export const getChannelIcon = (channel: ContactChannel): string => {
  const icons = {
    whatsapp: '📱',
    facebook: '📘',
    email: '📧',
    sms: '💬',
    web: '🌐'
  }
  return icons[channel]
}

// Función helper para obtener el color del porcentaje de IA
export const getIAPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600 dark:text-green-400'
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (percentage >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
} 