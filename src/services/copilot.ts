import api from './api';

// Tipos base del Copiloto
export interface CopilotResponse {
  response: string;
  model?: string;
  usage?: unknown;
  suggestions?: string[];
}

export interface CopilotTone {
  tone: string;
  sentiment: string;
  urgency: string;
}

export interface CopilotAnalysis {
  tone: CopilotTone;
  opportunities: string[];
}

export interface CopilotImprovements {
  gaps: string[];
  improvements: string[];
  plan: string[];
}

export interface ConversationMemoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationMemory {
  messages: ConversationMemoryMessage[];
  summary?: string;
  context?: Record<string, unknown>;
}

// Endpoints REST dedicados al Copiloto
const BASE = '/api/copilot';

export const copilotService = {
  async chat(payload: { message: string; conversationId: string; agentId: string }): Promise<CopilotResponse> {
    const { data } = await api.post(`${BASE}/chat`, payload);
    return data as CopilotResponse;
  },

  async generateResponse(payload: { conversationId: string; agentId: string; message?: string }): Promise<CopilotResponse> {
    const { data } = await api.post(`${BASE}/generate-response`, payload);
    return data as CopilotResponse;
  },

  async analyzeConversation(payload: { conversationMemory: ConversationMemory }): Promise<CopilotAnalysis> {
    const { data } = await api.post(`${BASE}/analyze-conversation`, payload);
    return data as CopilotAnalysis;
  },

  async optimizeResponse(payload: { response: string }): Promise<{ optimized: string }> {
    const { data } = await api.post(`${BASE}/optimize-response`, payload);
    return data as { optimized: string };
  },

  async strategySuggestions(payload: { agentId: string; analysis?: Record<string, unknown>; conversationMemory?: ConversationMemory }): Promise<{ strategies: string[]; actionPlan: string[] }> {
    const { data } = await api.post(`${BASE}/strategy-suggestions`, payload);
    return data as { strategies: string[]; actionPlan: string[] };
  },

  async quickResponse(payload: { urgency: 'low' | 'normal' | 'medium' | 'high'; context?: { lastMessage?: string; conversationId?: string; customerInfo?: Record<string, unknown>; productInfo?: Record<string, unknown>; } }): Promise<{ quick: string }> {
    const { data } = await api.post(`${BASE}/quick-response`, payload);
    return data as { quick: string };
  },

  async improveExperience(payload: { agentId: string; conversationMemory: ConversationMemory; analysis?: Record<string, unknown> }): Promise<CopilotImprovements> {
    const { data } = await api.post(`${BASE}/improve-experience`, payload);
    return data as CopilotImprovements;
  },

  async health(): Promise<{ status: string }> {
    const { data } = await api.get(`${BASE}/health`);
    return data as { status: string };
  },

  async test(): Promise<{ ok: boolean }> {
    const { data } = await api.post(`${BASE}/test`, {});
    return data as { ok: boolean };
  },

  async clearCache(): Promise<{ cleared: boolean }> {
    const { data } = await api.post(`${BASE}/clear-cache`, {});
    return data as { cleared: boolean };
  }
};


