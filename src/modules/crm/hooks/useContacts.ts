// Hook para manejar contactos del CRM
// Simplificado sin react-query
import { useState, useEffect } from 'react'
import { Contact } from '../mockContacts'
import { contactService } from '../services/contactService'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const result = await contactService.getContacts()
      if (result.success) {
        setContacts(result.data || [])
      } else {
        setError('Error al cargar contactos')
      }
    } catch (err) {
      setError('Error al cargar contactos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts
  }
}