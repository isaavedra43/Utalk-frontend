/**
 * Tipos HTTP y de API para UTalk Frontend
 */

export interface ApiError {
  response?: {
    status: number;
    statusText: string;
    data?: Record<string, unknown>;
  };
  request?: unknown;
  message: string;
  config?: Record<string, unknown>;
  code?: string;
}

export interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

export interface ApiErrorContext {
  method?: string;
  url?: string;
  status?: number;
  message: string;
  timestamp: string;
}

export interface ErrorDetails {
  code?: string;
  message: string;
  field?: string;
  value?: unknown;
}
