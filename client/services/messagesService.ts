// Servicio para interactuar con los mensajes de una conversación vía API REST.
// Permite obtener y enviar mensajes de forma robusta y tipada.

import apiClient, { handleApiError } from './apiClient'
import type { Message, ApiResponse } from './types'

/**
 * Envía un mensaje a través de Twilio y lo guarda en Firestore.
 * @param cid ID de la conversación.
 * @param text Contenido del mensaje.
 * @returns ApiResponse<Message>
 */
export async function sendMessage(cid: string, text: string): Promise<ApiResponse<Message>> {
  try {
    const res = await apiClient.post('/sendMessage', { cid, text })
    return { data: res.data, status: res.status }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Obtiene los mensajes de una conversación.
 * @param conversationId ID de la conversación
 * @returns ApiResponse<Message[]>
 */
export async function fetchMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
  try {
    const res = await apiClient.get(`/conversations/${conversationId}/messages`)
    return { data: res.data, status: res.status }
  } catch (error) {
    handleApiError(error)
  }
}

// TODO: Añadir soporte para adjuntos, edición y borrado de mensajes, y suscripción en tiempo real. 