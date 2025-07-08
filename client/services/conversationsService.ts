// Servicio para interactuar con el recurso de conversaciones vía API REST.
// Expone funciones reutilizables y robustas para el frontend.

import apiClient, { handleApiError } from './apiClient'
import type { Conversation, ApiResponse } from './types'

/**
 * Obtiene la lista de conversaciones del usuario autenticado.
 * @returns ApiResponse<Conversation[]>
 */
export async function fetchConversations(): Promise<ApiResponse<Conversation[]>> {
  try {
    const res = await apiClient.get('/conversations')
    return { data: res.data, status: res.status }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Crea una nueva conversación.
 * @param payload { title: string }
 * @returns ApiResponse<Conversation>
 */
export async function createConversation(payload: { title: string }): Promise<ApiResponse<Conversation>> {
  try {
    const res = await apiClient.post('/conversations', payload)
    return { data: res.data, status: res.status }
  } catch (error) {
    handleApiError(error)
  }
}

// TODO: Añadir soporte para paginación, búsqueda y edición de conversaciones. 