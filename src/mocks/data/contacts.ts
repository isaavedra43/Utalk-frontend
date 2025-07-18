// Datos mock para desarrollo - Contactos
// Simula datos reales para testing y desarrollo
import { Contact } from '@/types'

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 123 456 789',
    company: 'Empresa ABC',
    position: 'Gerente de Ventas',
    tags: ['cliente', 'premium'],
    status: 'qualified',
    notes: 'Cliente potencial muy interesado en nuestros servicios.',
    assignedTo: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@empresa.com',
    phone: '+34 987 654 321',
    company: 'Innovación XYZ',
    position: 'Directora de Marketing',
    tags: ['lead', 'marketing'],
    status: 'contacted',
    notes: 'Reunión programada para la próxima semana.',
    assignedTo: 'user2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos@startup.com',
    phone: '+34 555 123 456',
    company: 'StartupTech',
    position: 'CTO',
    tags: ['tech', 'startup'],
    status: 'new',
    notes: 'Contacto inicial vía LinkedIn.',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '4',
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@corporativo.com',
    phone: '+34 666 777 888',
    company: 'Corporativo Global',
    position: 'Jefa de Proyecto',
    tags: ['corporativo', 'proyecto'],
    status: 'converted',
    notes: 'Cliente convertido. Proyecto en curso.',
    assignedTo: 'user1',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Martín',
    email: 'david.martin@pyme.es',
    phone: '+34 111 222 333',
    company: 'PYME Solutions',
    position: 'CEO',
    tags: ['pyme', 'ceo'],
    status: 'lost',
    notes: 'No interesado en el servicio por el momento.',
    assignedTo: 'user2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  },
]

// Función helper para obtener contacto por ID
export const getContactById = (id: string): Contact | undefined => {
  return mockContacts.find(contact => contact.id === id)
}

// Función helper para filtrar contactos
export const filterContacts = (filters: {
  search?: string
  status?: string
  assignedTo?: string
}): Contact[] => {
  return mockContacts.filter(contact => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchLower) ||
        contact.lastName.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }

    if (filters.status && contact.status !== filters.status) {
      return false
    }

    if (filters.assignedTo && contact.assignedTo !== filters.assignedTo) {
      return false
    }

    return true
  })
} 