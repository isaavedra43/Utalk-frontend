// Hook personalizado para gestión de contactos
// Abstrae la lógica de React Query para contactos
// Proporciona estados y métodos para el componente
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService, ContactFilters } from '../services/contactService'
import { ContactData } from '@/lib/validations'

// Keys para React Query
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  stats: () => [...contactKeys.all, 'stats'] as const,
}

// Hook para obtener lista de contactos
export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: () => contactService.getContacts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para obtener un contacto específico
export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactService.getContact(id),
    enabled: !!id,
  })
}

// Hook para estadísticas de contactos
export function useContactStats() {
  return useQuery({
    queryKey: contactKeys.stats(),
    queryFn: () => contactService.getContactStats(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// Hook para crear contacto
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContactData) => contactService.createContact(data),
    onSuccess: () => {
      // Invalidar caché de listas
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() })
    },
  })
}

// Hook para actualizar contacto
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactData> }) =>
      contactService.updateContact(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar caché específico y listas
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.stats() })
    },
  })
}

// Hook para eliminar contacto
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      // Invalidar todas las consultas de contactos
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}

// Hook para asignar contacto
export function useAssignContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, userId }: { contactId: string; userId: string }) =>
      contactService.assignContact(contactId, userId),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })
}

// Hook para gestionar etiquetas
export function useContactTags() {
  const queryClient = useQueryClient()

  const addTags = useMutation({
    mutationFn: ({ contactId, tags }: { contactId: string; tags: string[] }) =>
      contactService.addTags(contactId, tags),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })

  const removeTags = useMutation({
    mutationFn: ({ contactId, tags }: { contactId: string; tags: string[] }) =>
      contactService.removeTags(contactId, tags),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) })
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
    },
  })

  return { addTags, removeTags }
}

// Hook completo para gestión de contactos
export function useContactManagement() {
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const assignContact = useAssignContact()
  const { addTags, removeTags } = useContactTags()

  return {
    createContact,
    updateContact,
    deleteContact,
    assignContact,
    addTags,
    removeTags,
  }
} 