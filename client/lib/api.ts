/**
 * Centralized API Client
 * Handles all communication with the backend
 * Includes authentication, error handling, and request/response interceptors
 * ACTUALIZADO: Configuración fullstack con rutas relativas
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration - FULLSTACK OPTIMIZADO
// En producción usa rutas relativas (mismo dominio), en desarrollo localhost
const getApiBaseUrl = () => {
  // Si estamos en producción o build, usar rutas relativas
  if (import.meta.env.PROD || import.meta.env.VITE_USE_RELATIVE_URLS === 'true') {
    return ''; // Rutas relativas - mismo dominio
  }
  
  // En desarrollo, usar variable de entorno o fallback a localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = 30000; // 30 seconds

console.log(`API configurada para: ${API_BASE_URL || 'rutas relativas (mismo dominio)'}`);

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  department: string;
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  profile?: {
    avatar?: string;
    phone?: string;
    timezone?: string;
    language?: string;
  };
  stats?: {
    totalLogins: number;
    lastLogin: string;
    lastActivity: string;
  };
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  channel: 'whatsapp' | 'facebook' | 'email' | 'sms' | 'webchat';
  status: 'active' | 'pending' | 'resolved' | 'closed';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  assignedTo?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  senderId: string;
  senderName: string;
  mediaUrl?: string;
  mediaType?: string;
  metadata?: Record<string, any>;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  channel: 'whatsapp' | 'facebook' | 'email' | 'sms' | 'webchat';
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  notes: string;
  customFields: Record<string, any>;
  stats: {
    totalConversations: number;
    totalMessages: number;
    avgResponseTime: number;
    lastActivity: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'promotional' | 'transactional' | 'notification';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  channels: ('whatsapp' | 'facebook' | 'email' | 'sms')[];
  audience: {
    segmentId?: string;
    filters: Record<string, any>;
    totalRecipients: number;
  };
  content: {
    subject?: string;
    text: string;
    html?: string;
    mediaUrl?: string;
  };
  schedule: {
    sendNow: boolean;
    scheduledDate?: string;
    timezone: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    unsubscribed: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messagesLastHour: number;
  avgResponseTime: number;
  satisfactionScore: number;
  agentsOnline: number;
  channelDistribution: Record<string, number>;
  trends: {
    conversations: number[];
    messages: number[];
    responseTime: number[];
  };
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token Management
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const expiry = localStorage.getItem('tokenExpiry');
      this.tokenExpiry = expiry ? parseInt(expiry) : null;
    } catch (error) {
      console.warn('Failed to load tokens from storage:', error);
    }
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);

    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toString());
    } catch (error) {
      console.warn('Failed to save tokens to storage:', error);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() >= this.tokenExpiry - 60000; // 1 minute buffer
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;

    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    } catch (error) {
      console.warn('Failed to clear tokens from storage:', error);
    }
  }
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = this.tokenManager.getAccessToken();
        
        if (token && !this.tokenManager.isTokenExpired()) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (token && this.tokenManager.isTokenExpired()) {
          // Try to refresh token
          await this.refreshTokenIfNeeded();
          const newToken = this.tokenManager.getAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshTokenIfNeeded();
            const newToken = this.tokenManager.getAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve();
    }

    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
        withCredentials: true,
      });

      const { accessToken, expiresIn } = response.data.data;
      this.tokenManager.setTokens(accessToken, refreshToken, expiresIn);
    } catch (error) {
      this.tokenManager.clearTokens();
      throw new ApiError('Token refresh failed', 401, 'REFRESH_FAILED');
    }
  }

  private handleApiError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'An error occurred';
      const code = data?.error || 'UNKNOWN_ERROR';
      return new ApiError(message, status, code, data);
    } else if (error.request) {
      return new ApiError('Network error', 0, 'NETWORK_ERROR');
    } else {
      return new ApiError(error.message || 'Unknown error', 0, 'UNKNOWN_ERROR');
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post<ApiResponse<LoginResponse>>('/api/users/auth/login', credentials);
      const { accessToken, refreshToken, expiresIn, user } = response.data.data!;
      
      this.tokenManager.setTokens(accessToken, refreshToken, expiresIn);
      
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/users/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.tokenManager.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<{ user: User }>>('/api/users/me');
      return response.data.data!.user;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async refreshTokens(): Promise<void> {
    await this.refreshTokenIfNeeded();
  }

  // Conversations Methods
  async getConversations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    search?: string;
  }): Promise<{ conversations: Conversation[]; total: number; page: number; limit: number }> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/api/conversations', { params });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await this.client.get<ApiResponse<Conversation>>(`/api/conversations/${id}`);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    try {
      const response = await this.client.put<ApiResponse<Conversation>>(`/api/conversations/${id}`, updates);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Messages Methods
  async getMessages(conversationId: string, params?: {
    page?: number;
    limit?: number;
    before?: string;
    after?: string;
  }): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    try {
      const response = await this.client.get<ApiResponse<any>>(`/api/conversations/${conversationId}/messages`, { params });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async sendMessage(conversationId: string, message: {
    content: string;
    type?: 'text' | 'image' | 'audio' | 'video' | 'document';
    mediaUrl?: string;
    mediaType?: string;
  }): Promise<Message> {
    try {
      const response = await this.client.post<ApiResponse<Message>>(`/api/conversations/${conversationId}/messages`, message);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async uploadMedia(file: File, type: 'image' | 'audio' | 'video' | 'document'): Promise<{ url: string; type: string; size: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await this.client.post<ApiResponse<any>>('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Clients/CRM Methods
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    channel?: string;
    tags?: string[];
  }): Promise<{ clients: Client[]; total: number; page: number; limit: number }> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/api/crm/clients', { params });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getClient(id: string): Promise<Client> {
    try {
      const response = await this.client.get<ApiResponse<Client>>(`/api/crm/clients/${id}`);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    try {
      const response = await this.client.post<ApiResponse<Client>>('/api/crm/clients', client);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const response = await this.client.put<ApiResponse<Client>>(`/api/crm/clients/${id}`, updates);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/crm/clients/${id}`);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Campaigns Methods
  async getCampaigns(params?: {
    page?: number;
    limit?: number;
    status?: string;
    channel?: string;
    type?: string;
  }): Promise<{ campaigns: Campaign[]; total: number; page: number; limit: number }> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/api/campaigns/campaigns', { params });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await this.client.get<ApiResponse<Campaign>>(`/api/campaigns/campaigns/${id}`);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await this.client.post<ApiResponse<Campaign>>('/api/campaigns/campaigns', campaign);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await this.client.put<ApiResponse<Campaign>>(`/api/campaigns/campaigns/${id}`, updates);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/campaigns/campaigns/${id}`);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async sendCampaign(id: string): Promise<void> {
    try {
      await this.client.post(`/api/campaigns/campaigns/${id}/send`);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Dashboard Methods
  async getDashboardMetrics(timeRange: string = '24h'): Promise<DashboardMetrics> {
    try {
      const response = await this.client.get<ApiResponse<DashboardMetrics>>('/api/dashboard/overview', {
        params: { timeRange }
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getAgentStats(params?: {
    timeRange?: string;
    agentId?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/api/dashboard/agents', { params });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Twilio/WhatsApp Methods
  async sendWhatsAppMessage(to: string, message: string, mediaUrl?: string): Promise<any> {
    try {
      const response = await this.client.post<ApiResponse<any>>('/api/channels/twilio/send/whatsapp', {
        to,
        message,
        mediaUrl
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async sendSMS(to: string, message: string): Promise<any> {
    try {
      const response = await this.client.post<ApiResponse<any>>('/api/channels/twilio/send/sms', {
        to,
        message
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await this.client.get<ApiResponse<any>>(`/api/channels/twilio/message/${messageId}/status`);
      return response.data.data!;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Utility Methods
  isAuthenticated(): boolean {
    const token = this.tokenManager.getAccessToken();
    return token !== null && !this.tokenManager.isTokenExpired();
  }

  getAuthToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  // Health Check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 