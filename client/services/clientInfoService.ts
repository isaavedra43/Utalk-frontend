// Servicio para obtener información de cliente asociada a una conversación.
// Permite al frontend mostrar detalles del cliente en el chat.

import apiClient, { handleApiError } from './apiClient'
import type { ClientInfo, ApiResponse } from './types'

/**
 * Obtiene la información del cliente para una conversación dada.
 * @param conversationId ID de la conversación
 * @returns ApiResponse<ClientInfo>
 */
export async function fetchClientInfo(conversationId: string): Promise<ApiResponse<ClientInfo>> {
  try {
    const res = await apiClient.get(`/conversations/${conversationId}`)
    return { data: res.data, status: res.status }
  } catch (error) {
    handleApiError(error)
  }
}

// TODO: Añadir soporte para actualización de datos y validación de campos. 