// Módulo CRM - Gestión de contactos y clientes
// Exportaciones públicas del módulo para uso en otras partes de la aplicación

// Componentes principales
// export { ContactList } from './components/ContactList'
// export { ContactDetail } from './components/ContactDetail'
// export { ContactForm } from './components/ContactForm'

// Servicios
// export { contactService } from './services/contactService'

// Hooks específicos del módulo
// export { useContacts } from './hooks/useContacts'
// export { useContactForm } from './hooks/useContactForm'

// Tipos específicos
// export type { Contact, ContactFilters } from './types'

// Rutas del módulo
export const CRM_ROUTES = {
  index: '/crm',
  contacts: '/crm/contacts',
  contactDetail: '/crm/contacts/:id',
  newContact: '/crm/contacts/new',
  companies: '/crm/companies',
  deals: '/crm/deals',
  reports: '/crm/reports',
} as const 