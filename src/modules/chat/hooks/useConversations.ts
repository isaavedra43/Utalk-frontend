// Hook para gestión de conversaciones
// ✅ VERSIÓN ULTRA-SIMPLIFICADA CON DATOS MOCK
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// ✅ DATOS MOCK PARA CONVERSACIONES
function createMockConversations(userEmail: string) {
  return [
    {
      id: "49e451d0-769e-49d8-aa89-9ff2b83c6d37",
      title: "Consulta sobre producto",
      status: "open" as const,
      priority: "medium" as const,
      contact: {
        id: "contact-1",
        name: "María García",
        phone: "+521477379184",
        email: "maria.garcia@example.com",
        avatar: null,
        isOnline: true,
        lastSeen: new Date(Date.now() - 300000), // 5 minutos ago
        company: "Empresa Demo",
        department: "Ventas",
        tags: ["cliente", "vip"],
        createdAt: new Date(Date.now() - 86400000), // 1 día ago
        updatedAt: new Date(Date.now() - 300000),
        customFields: {},
        isBlocked: false
      },
      channel: "whatsapp" as const,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 300000),
      assignedTo: {
        email: userEmail,
        name: "Administrador del Sistema",
        role: "admin",
        avatar: null
      },
      lastMessage: {
        id: "msg-1",
        content: "Hola, tengo una pregunta sobre sus productos",
        timestamp: new Date(Date.now() - 300000),
        senderName: "María García",
        type: "text" as const
      },
      messageCount: 3,
      unreadCount: 0,
      tags: ["consulta", "producto"],
      metadata: {
        source: "whatsapp",
        customFields: {},
        satisfaction: 5
      }
    },
    {
      id: "30736859-217e-4b67-a9f8-df76d0840624",
      title: "Soporte técnico",
      status: "pending" as const,
      priority: "high" as const,
      contact: {
        id: "contact-2",
        name: "Juan Pérez",
        phone: "+521461529681",
        email: "juan.perez@example.com",
        avatar: null,
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000), // 30 minutos ago
        company: "Tech Solutions",
        department: "IT",
        tags: ["cliente", "soporte"],
        createdAt: new Date(Date.now() - 172800000), // 2 días ago
        updatedAt: new Date(Date.now() - 1800000),
        customFields: {},
        isBlocked: false
      },
      channel: "email" as const,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 1800000),
      assignedTo: {
        email: userEmail,
        name: "Administrador del Sistema",
        role: "admin",
        avatar: null
      },
      lastMessage: {
        id: "msg-2",
        content: "Necesito ayuda con la configuración del sistema",
        timestamp: new Date(Date.now() - 1800000),
        senderName: "Juan Pérez",
        type: "text" as const
      },
      messageCount: 5,
      unreadCount: 2,
      tags: ["soporte", "urgente"],
      metadata: {
        source: "email",
        customFields: {},
        satisfaction: null
      }
    },
    {
      id: "78082b28-3ebb-4b55-8e58-9ff6da20b196e",
      title: "Información comercial",
      status: "closed" as const,
      priority: "low" as const,
      contact: {
        id: "contact-3",
        name: "Ana López",
        phone: "+521477521021",
        email: "ana.lopez@example.com",
        avatar: null,
        isOnline: true,
        lastSeen: new Date(Date.now() - 60000), // 1 minuto ago
        company: "Comercial ABC",
        department: "Compras",
        tags: ["prospecto"],
        createdAt: new Date(Date.now() - 259200000), // 3 días ago
        updatedAt: new Date(Date.now() - 60000),
        customFields: {},
        isBlocked: false
      },
      channel: "web" as const,
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 60000),
      assignedTo: {
        email: userEmail,
        name: "Administrador del Sistema",
        role: "admin",
        avatar: null
      },
      lastMessage: {
        id: "msg-3",
        content: "Gracias por la información, todo resuelto",
        timestamp: new Date(Date.now() - 60000),
        senderName: "Ana López",
        type: "text" as const
      },
      messageCount: 8,
      unreadCount: 0,
      tags: ["comercial", "resuelto"],
      metadata: {
        source: "web",
        customFields: {},
        satisfaction: 4
      }
    }
  ]
}

export function useConversations() {
  const { isAuthenticated, isAuthLoaded, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])

  // ✅ DATOS MOCK BASADOS EN USUARIO
  const mockConversations = useMemo(() => {
    if (!user?.email) return []
    return createMockConversations(user.email)
  }, [user?.email])

  // ✅ VALIDACIÓN DE AUTENTICACIÓN
  useEffect(() => {
    if (!isAuthLoaded) {
      console.log('[CONVERSATIONS] Auth not loaded yet')
      setIsLoading(true)
      return
    }

    if (!isAuthenticated || !user) {
      console.log('[CONVERSATIONS] User not authenticated')
      setIsLoading(false)
      setConversations([])
      return
    }

    // ✅ SIMULAR CARGA DE CONVERSACIONES
    console.log('[CONVERSATIONS] Cargando conversaciones mock')
    setIsLoading(true)
    
    const timer = setTimeout(() => {
      setConversations(mockConversations)
      setIsLoading(false)
      console.log('[CONVERSATIONS] Conversaciones mock cargadas:', mockConversations.length)
    }, 300)

    return () => clearTimeout(timer)
  }, [isAuthLoaded, isAuthenticated, user, mockConversations])

  return {
    data: conversations, // ✅ SIEMPRE ARRAY VÁLIDO
    isLoading,
    error: null,
    refetch: () => {
      console.log('[CONVERSATIONS] Refetch solicitado')
      return Promise.resolve({ data: conversations })
    }
  }
} 