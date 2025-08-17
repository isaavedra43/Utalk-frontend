import type { 
  Client, 
  ClientFilters, 
  ClientPaginatedResponse,
  ClientApiResponse,
  ClientActivity,
  ClientDeal
} from '../../../types/client';
import { logger, LogCategory } from '../../../utils/logger';
import { logClientError } from '../../../config/logging';

// Mock data para desarrollo
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Gabriela Vega',
    company: 'TechAdvantage',
    email: 'gabriela.vega@techadvantage.com',
    phone: '+52 55 5529 5710',
    whatsapp: '+52 55 5529 5710',
    avatar: '',
    initials: 'GV',
    status: 'won',
    stage: 'ganado',
    score: 99,
    winRate: 100,
    expectedValue: 102000,
    probability: 100,
    source: 'facebook',
    segment: 'startup',
    tags: ['VIP', 'Empresa', 'Startup'],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-08-11'),
    lastContact: new Date('2025-08-11'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '2',
    name: 'Raúl Gutiérrez',
    company: 'TechLeaders',
    email: 'raul.gutierrez@techleaders.com',
    phone: '+52 55 1234 5678',
    whatsapp: '+52 55 1234 5678',
    avatar: '',
    initials: 'RG',
    status: 'won',
    stage: 'ganado',
    score: 99,
    winRate: 100,
    expectedValue: 465000,
    probability: 100,
    source: 'linkedin',
    segment: 'enterprise',
    tags: ['VIP', 'Empresa'],
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-07-22'),
    lastContact: new Date('2025-07-22'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '3',
    name: 'Emilio Guerrero',
    company: 'DataFlow',
    email: 'emilio.guerrero@dataflow.com',
    phone: '+52 55 8765 4321',
    whatsapp: '+52 55 8765 4321',
    avatar: '',
    initials: 'EG',
    status: 'won',
    stage: 'ganado',
    score: 99,
    winRate: 100,
    expectedValue: 451000,
    probability: 100,
    source: 'website',
    segment: 'sme',
    tags: ['Premium'],
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-07-22'),
    lastContact: new Date('2025-07-22'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '4',
    name: 'Diego Martín',
    company: 'TechAdvantage',
    email: 'diego.martin@techadvantage.com',
    phone: '+52 55 9876 5432',
    whatsapp: '+52 55 9876 5432',
    avatar: '',
    initials: 'DM',
    status: 'won',
    stage: 'ganado',
    score: 99,
    winRate: 100,
    expectedValue: 227000,
    probability: 100,
    source: 'referral',
    segment: 'startup',
    tags: ['VIP'],
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2025-08-02'),
    lastContact: new Date('2025-08-02'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '5',
    name: 'Andrés Vargas',
    company: 'FutureTech',
    email: 'andres.vargas@futuretech.com',
    phone: '+52 55 1122 3344',
    whatsapp: '+52 55 1122 3344',
    avatar: '',
    initials: 'AV',
    status: 'won',
    stage: 'ganado',
    score: 99,
    winRate: 100,
    expectedValue: 443000,
    probability: 100,
    source: 'cold_call',
    segment: 'enterprise',
    tags: ['VIP', 'Empresa'],
    createdAt: new Date('2025-05-12'),
    updatedAt: new Date('2025-08-10'),
    lastContact: new Date('2025-08-10'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '6',
    name: 'Sergio Delgado',
    company: 'InnovateNow',
    email: 'sergio.delgado@innovatnow.com',
    phone: '+52 55 5566 7788',
    whatsapp: '+52 55 5566 7788',
    avatar: '',
    initials: 'SD',
    status: 'won',
    stage: 'ganado',
    score: 98,
    winRate: 100,
    expectedValue: 313000,
    probability: 100,
    source: 'event',
    segment: 'sme',
    tags: ['Premium'],
    createdAt: new Date('2025-06-18'),
    updatedAt: new Date('2025-07-18'),
    lastContact: new Date('2025-07-18'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  },
  {
    id: '7',
    name: 'Alberto Peña',
    company: 'Innovación Digital',
    email: 'alberto.pena@innovaciondigital.com',
    phone: '+52 55 9988 7766',
    whatsapp: '+52 55 9988 7766',
    avatar: '',
    initials: 'AP',
    status: 'won',
    stage: 'ganado',
    score: 95,
    winRate: 100,
    expectedValue: 388000,
    probability: 100,
    source: 'advertising',
    segment: 'startup',
    tags: ['Hot Lead'],
    createdAt: new Date('2025-07-25'),
    updatedAt: new Date('2025-07-31'),
    lastContact: new Date('2025-07-31'),
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez'
  }
];

// Función para simular delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para filtrar clientes
const filterClients = (clients: Client[], filters: ClientFilters): Client[] => {
  let filtered = [...clients];

  // Aplicar filtros de búsqueda
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(client => 
      client.name.toLowerCase().includes(searchTerm) ||
      client.company.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm)
    );
  }

  // Aplicar filtros por etapa
  if (filters.stages && filters.stages.length > 0) {
    filtered = filtered.filter(client => 
      filters.stages!.includes(client.stage)
    );
  }

  // Aplicar filtros por agente
  if (filters.agents && filters.agents.length > 0) {
    filtered = filtered.filter(client => 
      client.assignedTo && filters.agents!.includes(client.assignedTo)
    );
  }

  // Aplicar filtros por score de IA
  if (filters.aiScoreMin !== undefined) {
    filtered = filtered.filter(client => client.score >= filters.aiScoreMin!);
  }
  if (filters.aiScoreMax !== undefined) {
    filtered = filtered.filter(client => client.score <= filters.aiScoreMax!);
  }

  // Aplicar filtros por valor
  if (filters.valueMin !== undefined) {
    filtered = filtered.filter(client => client.expectedValue >= filters.valueMin!);
  }
  if (filters.valueMax !== undefined) {
    filtered = filtered.filter(client => client.expectedValue <= filters.valueMax!);
  }

  // Aplicar filtros por probabilidad
  if (filters.probabilityMin !== undefined) {
    filtered = filtered.filter(client => client.probability >= filters.probabilityMin!);
  }
  if (filters.probabilityMax !== undefined) {
    filtered = filtered.filter(client => client.probability <= filters.probabilityMax!);
  }

  // Aplicar filtros por estado
  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filtered.filter(client => 
      filters.statuses!.includes(client.status)
    );
  }

  // Aplicar filtros por etiquetas
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(client => 
      client.tags.some(tag => filters.tags!.includes(tag))
    );
  }

  // Aplicar filtros por fuente
  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter(client => 
      filters.sources!.includes(client.source)
    );
  }

  // Aplicar filtros por segmento
  if (filters.segments && filters.segments.length > 0) {
    filtered = filtered.filter(client => 
      filters.segments!.includes(client.segment)
    );
  }

  // Aplicar filtros por fecha
  if (filters.createdAfter) {
    filtered = filtered.filter(client => 
      new Date(client.createdAt) >= filters.createdAfter!
    );
  }
  if (filters.createdBefore) {
    filtered = filtered.filter(client => 
      new Date(client.createdAt) <= filters.createdBefore!
    );
  }

  // Ordenamiento
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'value':
          aValue = a.expectedValue;
          bValue = b.expectedValue;
          break;
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'lastContact':
          aValue = a.lastContact ? new Date(a.lastContact) : new Date(0);
          bValue = b.lastContact ? new Date(b.lastContact) : new Date(0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
};

// Función para paginar resultados
const paginateResults = <T>(data: T[], page: number = 1, limit: number = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit)
    }
  };
};

export const clientService = {
  // Obtener lista de clientes
  async getClients(filters: ClientFilters = {}): Promise<ClientPaginatedResponse<Client>> {
    try {
      logger.info(LogCategory.API, 'Obteniendo clientes', { filters });
      
      // Simular delay de API
      await delay(500);
      
      // Filtrar clientes
      const filteredClients = filterClients(mockClients, filters);
      
      // Paginar resultados
      const result = paginateResults(
        filteredClients, 
        filters.page || 1, 
        filters.limit || 20
      );
      
      logger.info(LogCategory.API, 'Clientes obtenidos exitosamente', { 
        count: result.data.length,
        total: result.pagination.total 
      });
      
      return result;
    } catch (error) {
      logClientError('Error al obtener clientes', error, { filters });
      throw error;
    }
  },

  // Obtener cliente por ID
  async getClientById(clientId: string): Promise<ClientApiResponse<Client>> {
    try {
      logger.info(LogCategory.API, 'Obteniendo cliente por ID', { clientId });
      
      await delay(300);
      
      const client = mockClients.find(c => c.id === clientId);
      
      if (!client) {
        throw new Error(`Cliente con ID ${clientId} no encontrado`);
      }
      
      logger.info(LogCategory.API, 'Cliente obtenido exitosamente', { clientId });
      
      return {
        data: client,
        success: true,
        message: 'Cliente obtenido exitosamente'
      };
    } catch (error) {
      logClientError('Error al obtener cliente por ID', error, { clientId });
      throw error;
    }
  },

  // Actualizar cliente
  async updateClient(clientId: string, updates: Partial<Client>): Promise<ClientApiResponse<Client>> {
    try {
      logger.info(LogCategory.API, 'Actualizando cliente', { clientId, updates });
      
      await delay(400);
      
      const clientIndex = mockClients.findIndex(c => c.id === clientId);
      
      if (clientIndex === -1) {
        throw new Error(`Cliente con ID ${clientId} no encontrado`);
      }
      
      const updatedClient = {
        ...mockClients[clientIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      mockClients[clientIndex] = updatedClient;
      
      logger.info(LogCategory.API, 'Cliente actualizado exitosamente', { clientId });
      
      return {
        data: updatedClient,
        success: true,
        message: 'Cliente actualizado exitosamente'
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al actualizar cliente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Crear cliente
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientApiResponse<Client>> {
    try {
      logger.info(LogCategory.API, 'Creando nuevo cliente', { clientData });
      
      await delay(600);
      
      const newClient: Client = {
        ...clientData,
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockClients.unshift(newClient);
      
      logger.info(LogCategory.API, 'Cliente creado exitosamente', { clientId: newClient.id });
      
      return {
        data: newClient,
        success: true,
        message: 'Cliente creado exitosamente'
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al crear cliente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Eliminar cliente
  async deleteClient(clientId: string): Promise<ClientApiResponse<void>> {
    try {
      logger.info(LogCategory.API, 'Eliminando cliente', { clientId });
      
      await delay(300);
      
      const clientIndex = mockClients.findIndex(c => c.id === clientId);
      
      if (clientIndex === -1) {
        throw new Error(`Cliente con ID ${clientId} no encontrado`);
      }
      
      mockClients.splice(clientIndex, 1);
      
      logger.info(LogCategory.API, 'Cliente eliminado exitosamente', { clientId });
      
      return {
        data: undefined,
        success: true,
        message: 'Cliente eliminado exitosamente'
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al eliminar cliente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener actividades del cliente
  async getClientActivities(clientId: string): Promise<ClientApiResponse<ClientActivity[]>> {
    try {
      logger.info(LogCategory.API, 'Obteniendo actividades del cliente', { clientId });
      
      await delay(300);
      
      // Mock activities
      const activities: ClientActivity[] = [
        {
          id: '1',
          clientId,
          type: 'whatsapp',
          title: 'Mensaje WhatsApp',
          description: 'Cliente pregunta sobre tiempo de implementación',
          timestamp: new Date('2025-08-12T17:06:30'),
          agentId: 'admin@company.com',
          agentName: 'PS Pedro Sánchez',
          metadata: {
            messageContent: '¿Cuánto tiempo toma la implementación?'
          }
        },
        {
          id: '2',
          clientId,
          type: 'call',
          title: 'Llamada comercial',
          description: 'Demo del producto - 45 minutos. Cliente muy interesado.',
          timestamp: new Date('2025-08-11T19:06:30'),
          duration: 45,
          agentId: 'admin@company.com',
          agentName: 'PS Pedro Sánchez',
          metadata: {
            callNotes: 'Cliente mostró mucho interés en las funcionalidades avanzadas'
          }
        }
      ];
      
      logger.info(LogCategory.API, 'Actividades obtenidas exitosamente', { clientId, count: activities.length });
      
      return {
        data: activities,
        success: true,
        message: 'Actividades obtenidas exitosamente'
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener actividades del cliente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },

  // Obtener deals del cliente
  async getClientDeals(clientId: string): Promise<ClientApiResponse<ClientDeal[]>> {
    try {
      logger.info(LogCategory.API, 'Obteniendo deals del cliente', { clientId });
      
      await delay(300);
      
      // Mock deals
      const deals: ClientDeal[] = [
        {
          id: '1',
          clientId,
          title: 'Implementación CRM Enterprise',
          description: 'Implementación completa del CRM para la empresa',
          value: 450000,
          probability: 75,
          stage: 'negociacion',
          expectedCloseDate: new Date('2025-08-27'),
          currency: 'USD',
          dealType: 'new_business',
          winProbability: 75,
          daysInStage: 15,
          assignedTo: 'admin@company.com',
          assignedToName: 'PS Pedro Sánchez',
          createdAt: new Date('2025-07-15'),
          updatedAt: new Date('2025-08-12'),
          tags: ['Enterprise', 'CRM'],
          notes: 'Cliente interesado en funcionalidades avanzadas'
        }
      ];
      
      logger.info(LogCategory.API, 'Deals obtenidos exitosamente', { clientId, count: deals.length });
      
      return {
        data: deals,
        success: true,
        message: 'Deals obtenidos exitosamente'
      };
    } catch (error) {
      logger.error(LogCategory.API, 'Error al obtener deals del cliente', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}; 