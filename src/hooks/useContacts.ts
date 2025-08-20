import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Contact } from '../types';
import { contactsService, mockContacts } from '../services/contacts';
import { infoLog } from '../config/logger';

export const useContacts = (filters: {
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const [currentPage, setCurrentPage] = useState(filters.page || 1);

  // Query para obtener contactos
  const {
    data: contactsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['contacts', filters, currentPage],
    queryFn: () => contactsService.getContacts({
      ...filters,
      page: currentPage,
      limit: filters.limit || 20
    }),
    // Por ahora usar datos mock mientras no hay backend
    initialData: {
      contacts: mockContacts,
      total: mockContacts.length,
      page: 1,
      limit: 20,
      hasMore: false
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  });

  // Query para obtener tags de contactos
  const {
    data: contactTags,
    isLoading: isLoadingTags
  } = useQuery({
    queryKey: ['contact-tags'],
    queryFn: () => contactsService.getContactTags(),
    initialData: ['VIP', 'Premium', 'New Customer', 'Technical Support', 'Order Management'],
    staleTime: 60000 // 1 minuto
  });

  // Mutation para crear contacto
  const createContactMutation = useMutation({
    mutationFn: (contactData: {
      phone: string;
      name: string;
      email?: string;
      company?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }) => contactsService.createContact(contactData),
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation para actualizar contacto
  const updateContactMutation = useMutation({
    mutationFn: ({ contactId, updateData }: {
      contactId: string;
      updateData: {
        name?: string;
        email?: string;
        company?: string;
        tags?: string[];
        metadata?: Record<string, unknown>;
      };
    }) => contactsService.updateContact(contactId, updateData),
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation para eliminar contacto
  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => contactsService.deleteContact(contactId),
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation para agregar tags
  const addContactTagsMutation = useMutation({
    mutationFn: ({ contactId, tags }: { contactId: string; tags: string[] }) =>
      contactsService.addContactTags(contactId, tags),
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation para remover tags
  const removeContactTagsMutation = useMutation({
    mutationFn: ({ contactId, tags }: { contactId: string; tags: string[] }) =>
      contactsService.removeContactTags(contactId, tags),
    onSuccess: () => {
      refetch();
    }
  });

  // Función para crear contacto
  const createContact = useCallback(async (contactData: {
    phone: string;
    name: string;
    email?: string;
    company?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }) => {
    try {
      await createContactMutation.mutateAsync(contactData);
    } catch (error) {
      infoLog('Error creando contacto:', error);
      throw error;
    }
  }, [createContactMutation]);

  // Función para actualizar contacto
  const updateContact = useCallback(async (contactId: string, updateData: {
    name?: string;
    email?: string;
    company?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }) => {
    try {
      await updateContactMutation.mutateAsync({ contactId, updateData });
    } catch (error) {
      infoLog('Error actualizando contacto:', error);
      throw error;
    }
  }, [updateContactMutation]);

  // Función para eliminar contacto
  const deleteContact = useCallback(async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync(contactId);
    } catch (error) {
      infoLog('Error eliminando contacto:', error);
      throw error;
    }
  }, [deleteContactMutation]);

  // Función para agregar tags
  const addContactTags = useCallback(async (contactId: string, tags: string[]) => {
    try {
      await addContactTagsMutation.mutateAsync({ contactId, tags });
    } catch (error) {
      infoLog('Error agregando tags:', error);
      throw error;
    }
  }, [addContactTagsMutation]);

  // Función para remover tags
  const removeContactTags = useCallback(async (contactId: string, tags: string[]) => {
    try {
      await removeContactTagsMutation.mutateAsync({ contactId, tags });
    } catch (error) {
      infoLog('Error removiendo tags:', error);
      throw error;
    }
  }, [removeContactTagsMutation]);

  // Función para buscar contacto por teléfono
  const searchContactByPhone = useCallback(async (phone: string): Promise<Contact | null> => {
    try {
      return await contactsService.searchContactByPhone(phone);
    } catch (error) {
      infoLog('Error buscando contacto:', error);
      return null;
    }
  }, []);

  // Función para cargar más contactos
  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  // Función para cambiar página
  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    // Datos
    contacts: contactsData?.contacts || [],
    total: contactsData?.total || 0,
    page: contactsData?.page || 1,
    limit: contactsData?.limit || 20,
    hasMore: contactsData?.hasMore || false,
    contactTags: contactTags || [],

    // Estados
    isLoading,
    isLoadingTags,
    error,

    // Acciones
    createContact,
    updateContact,
    deleteContact,
    addContactTags,
    removeContactTags,
    searchContactByPhone,
    loadMore,
    changePage,
    refetch,

    // Estados de mutaciones
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
    isAddingTags: addContactTagsMutation.isPending,
    isRemovingTags: removeContactTagsMutation.isPending
  };
}; 