import type { Client, ClientFilters, ClientPaginatedResponse, ClientActivity, ClientDeal } from '../../../types/client';
import { api } from '../../../config/api';
import { infoLog } from '../../../config/logger';

// Interfaces para respuestas del backend
interface BackendClientResponse {
  success: boolean;
  data: {
    clients: Client[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

interface BackendClientSingleResponse {
  success: boolean;
  data: Client;
  message: string;
}

export const clientService = {
  // ✅ LISTA DE CLIENTES - API REAL
  async getClients(filters: ClientFilters = {}): Promise<ClientPaginatedResponse<Client>> {
    try {
      infoLog('Obteniendo clientes desde API', { filters });
      
      const response = await api.get<BackendClientResponse>('/api/clients', { 
        params: filters 
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener clientes');
      }
      
      infoLog('Clientes obtenidos exitosamente', { 
        count: response.data.data.clients.length,
        total: response.data.data.pagination.total 
      });
      
      return {
        data: response.data.data.clients,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      infoLog('Error al obtener clientes', { error, filters });
      throw error;
    }
  },

  // ✅ CLIENTE ESPECÍFICO - API REAL
  async getClientById(clientId: string): Promise<Client> {
    try {
      infoLog('Obteniendo cliente por ID desde API', { clientId });
      
      const response = await api.get<BackendClientSingleResponse>(`/api/clients/${clientId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener cliente');
      }
      
      infoLog('Cliente obtenido exitosamente', { clientId });
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener cliente por ID', { error, clientId });
      throw error;
    }
  },

  // ✅ ACTUALIZAR CLIENTE - API REAL
  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      infoLog('Actualizando cliente en API', { clientId, updates });
      
      const response = await api.put<BackendClientSingleResponse>(`/api/clients/${clientId}`, updates);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar cliente');
      }
      
      infoLog('Cliente actualizado exitosamente', { clientId });
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al actualizar cliente', { error, clientId, updates });
      throw error;
    }
  },

  // ✅ CREAR CLIENTE - API REAL
  async createClient(clientData: Partial<Client>): Promise<Client> {
    try {
      infoLog('Creando nuevo cliente en API', { clientData });
      
      const response = await api.post<BackendClientSingleResponse>('/api/clients', clientData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear cliente');
      }
      
      infoLog('Cliente creado exitosamente', { clientId: response.data.data.id });
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al crear cliente', { error, clientData });
      throw error;
    }
  },

  // ✅ ELIMINAR CLIENTE - API REAL
  async deleteClient(clientId: string): Promise<void> {
    try {
      infoLog('Eliminando cliente en API', { clientId });
      
      const response = await api.delete<{ success: boolean; message: string }>(`/api/clients/${clientId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar cliente');
      }
      
      infoLog('Cliente eliminado exitosamente', { clientId });
    } catch (error) {
      infoLog('Error al eliminar cliente', { error, clientId });
      throw error;
    }
  },

  // 🔮 FUNCIONALIDADES FUTURAS - Actividades del cliente
  async getClientActivities(clientId: string): Promise<ClientActivity[]> {
    try {
      infoLog('Obteniendo actividades del cliente desde API', { clientId });
      
      // TODO: Implementar cuando el backend tenga el endpoint
      const response = await api.get<{ success: boolean; data: ClientActivity[] }>(`/api/clients/${clientId}/activities`);
      
      if (!response.data.success) {
        throw new Error('Error al obtener actividades del cliente');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener actividades del cliente', { error, clientId });
      throw error;
    }
  },

  // 🔮 FUNCIONALIDADES FUTURAS - Deals del cliente
  async getClientDeals(clientId: string): Promise<ClientDeal[]> {
    try {
      infoLog('Obteniendo deals del cliente desde API', { clientId });
      
      // TODO: Implementar cuando el backend tenga el endpoint
      const response = await api.get<{ success: boolean; data: ClientDeal[] }>(`/api/clients/${clientId}/deals`);
      
      if (!response.data.success) {
        throw new Error('Error al obtener deals del cliente');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener deals del cliente', { error, clientId });
      throw error;
    }
  }
}; 