/**
 * Realtime Store
 * Store para manejar actualizaciones en tiempo real del módulo de equipo
 */

import { teamBackendService } from '$lib/services/team-backend.service';
import type { AgentAction, AgentInsight, AgentMetrics } from '$lib/types/team';
import { derived, writable } from 'svelte/store';

// ============================================================================
// TIPOS
// ============================================================================

export interface RealtimeUpdate {
  type: 'agent_update' | 'metrics_update' | 'action_completed' | 'insight_generated';
  agentId?: string;
  data: any;
  timestamp: Date;
}

export interface RealtimeStatus {
  connected: boolean;
  channels: string[];
  lastUpdate: Date | null;
  error: string | null;
}

// ============================================================================
// STORES
// ============================================================================

// Estado de conexión real-time
export const realtimeStatus = writable<RealtimeStatus>({
  connected: false,
  channels: [],
  lastUpdate: null,
  error: null
});

// Actualizaciones en tiempo real
export const realtimeUpdates = writable<RealtimeUpdate[]>([]);

// Métricas en tiempo real por agente
export const realtimeMetrics = writable<Map<string, AgentMetrics>>(new Map());

// Acciones IA en tiempo real
export const realtimeActionsStore = writable<AgentAction[]>([]);

// Insights en tiempo real
export const realtimeInsights = writable<AgentInsight[]>([]);

// ============================================================================
// DERIVED STORES
// ============================================================================

// Métricas actualizadas de un agente específico
export const getAgentRealtimeMetrics = (agentId: string) => {
  return derived(realtimeMetrics, $metrics => $metrics.get(agentId));
};

// Acciones pendientes de un agente
export const getAgentPendingActions = (agentId: string) => {
  return derived(realtimeActionsStore, $actions =>
    $actions.filter(
      (action: AgentAction) => action.agentId === agentId && action.status === 'pending'
    )
  );
};

// Insights críticos
export const getCriticalInsights = derived(realtimeInsights, $insights =>
  $insights.filter(insight => insight.severity === 'high')
);

// ============================================================================
// SERVICIO DE REAL-TIME
// ============================================================================

class RealtimeService {
  private channels: Map<string, unknown> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 2000;

  /**
   * Conectar a un canal real-time
   */
  connectToChannel(channel: string): void {
    if (this.channels.has(channel)) {
      console.warn(`Ya conectado al canal: ${channel}`);
      return;
    }

    try {
      const ws = teamBackendService.connectRealtime(channel, (data: unknown) => {
        this.handleRealtimeMessage(channel, data);
      });

      this.channels.set(channel, ws);

      realtimeStatus.update(status => ({
        ...status,
        connected: true,
        channels: [...status.channels, channel],
        error: null
      }));

      console.log(`Conectado al canal real-time: ${channel}`);
    } catch (error) {
      console.error(`Error conectando al canal ${channel}:`, error);
      this.handleConnectionError(channel, error);
    }
  }

  /**
   * Desconectar de un canal
   */
  disconnectFromChannel(channel: string): void {
    const ws = this.channels.get(channel);
    if (ws) {
      teamBackendService.disconnectRealtime(channel);
      this.channels.delete(channel);

      realtimeStatus.update(status => ({
        ...status,
        channels: status.channels.filter(c => c !== channel),
        connected: status.channels.length > 1
      }));

      console.log(`Desconectado del canal: ${channel}`);
    }
  }

  /**
   * Enviar mensaje a un canal
   */
  sendMessage(channel: string, message: unknown): void {
    teamBackendService.sendRealtimeMessage(channel, message);
  }

  /**
   * Manejar mensajes real-time
   */
  private handleRealtimeMessage(channel: string, data: unknown): void {
    const dataObj = data as Record<string, unknown>;
    const update: RealtimeUpdate = {
      type: dataObj.type as RealtimeUpdate['type'],
      agentId: dataObj.agentId as string | undefined,
      data: dataObj.payload,
      timestamp: new Date()
    };

    // Agregar a la lista de actualizaciones
    realtimeUpdates.update(updates => {
      const newUpdates = [update, ...updates.slice(0, 49)]; // Mantener solo las últimas 50
      return newUpdates;
    });

    // Actualizar estado según el tipo de mensaje
    switch (dataObj.type) {
      case 'agent_update':
        this.handleAgentUpdate(dataObj);
        break;
      case 'metrics_update':
        this.handleMetricsUpdate(dataObj);
        break;
      case 'action_completed':
        this.handleActionUpdate(dataObj);
        break;
      case 'insight_generated':
        this.handleInsightUpdate(dataObj);
        break;
      default:
        console.warn(`Tipo de mensaje desconocido: ${dataObj.type}`);
    }

    // Actualizar timestamp de última actualización
    realtimeStatus.update(status => ({
      ...status,
      lastUpdate: new Date()
    }));
  }

  /**
   * Manejar actualización de agente
   */
  private handleAgentUpdate(data: Record<string, unknown>): void {
    // Aquí se actualizaría el store de agentes
    // Por ahora solo loggeamos
    console.log('Actualización de agente recibida:', data);
  }

  /**
   * Manejar actualización de métricas
   */
  private handleMetricsUpdate(data: Record<string, unknown>): void {
    if (data.agentId && data.payload) {
      realtimeMetrics.update(metrics => {
        const newMetrics = new Map(metrics);
        newMetrics.set(data.agentId as string, data.payload as AgentMetrics);
        return newMetrics;
      });
    }
  }

  /**
   * Manejar actualización de acción
   */
  private handleActionUpdate(data: Record<string, unknown>): void {
    if (data.payload) {
      realtimeActionsStore.update((actions: AgentAction[]) => {
        const payload = data.payload as AgentAction;
        const existingIndex = actions.findIndex((a: AgentAction) => a.id === payload.id);
        if (existingIndex >= 0) {
          // Actualizar acción existente
          const updatedActions = [...actions];
          updatedActions[existingIndex] = payload;
          return updatedActions;
        } else {
          // Agregar nueva acción
          return [payload, ...actions];
        }
      });
    }
  }

  /**
   * Manejar actualización de insight
   */
  private handleInsightUpdate(data: Record<string, unknown>): void {
    if (data.payload) {
      realtimeInsights.update(insights => {
        const payload = data.payload as AgentInsight;
        const existingIndex = insights.findIndex(i => i.id === payload.id);
        if (existingIndex >= 0) {
          // Actualizar insight existente
          const updatedInsights = [...insights];
          updatedInsights[existingIndex] = payload;
          return updatedInsights;
        } else {
          // Agregar nuevo insight
          return [payload, ...insights];
        }
      });
    }
  }

  /**
   * Manejar error de conexión
   */
  private handleConnectionError(channel: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    realtimeStatus.update(status => ({
      ...status,
      error: `Error conectando a ${channel}: ${errorMessage}`
    }));

    // Intentar reconectar
    this.attemptReconnect(channel);
  }

  /**
   * Intentar reconectar a un canal
   */
  private attemptReconnect(channel: string): void {
    const attempts = this.reconnectAttempts.get(channel) || 0;

    if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts.set(channel, attempts + 1);

      setTimeout(
        () => {
          console.log(
            `Reintentando conexión a ${channel} (${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`
          );
          this.connectToChannel(channel);
        },
        this.RECONNECT_DELAY * Math.pow(2, attempts)
      );
    } else {
      console.error(`Máximo de reintentos alcanzado para ${channel}`);
      this.reconnectAttempts.delete(channel);

      realtimeStatus.update(status => ({
        ...status,
        error: `No se pudo conectar a ${channel} después de ${this.MAX_RECONNECT_ATTEMPTS} intentos`
      }));
    }
  }

  /**
   * Limpiar todas las conexiones
   */
  cleanup(): void {
    this.channels.forEach((_, channel) => {
      this.disconnectFromChannel(channel);
    });

    this.channels.clear();
    this.reconnectAttempts.clear();

    realtimeStatus.set({
      connected: false,
      channels: [],
      lastUpdate: null,
      error: null
    });
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus(): RealtimeStatus {
    let status: RealtimeStatus;
    realtimeStatus.subscribe(s => (status = s))();
    return status!;
  }
}

// Exportar instancia singleton
export const realtimeService = new RealtimeService();

// ============================================================================
// ACCIONES DEL STORE
// ============================================================================

export const realtimeActions = {
  /**
   * Conectar a canal de agentes
   */
  connectToAgentsChannel: () => {
    realtimeService.connectToChannel('agents');
  },

  /**
   * Conectar a canal de métricas
   */
  connectToMetricsChannel: () => {
    realtimeService.connectToChannel('metrics');
  },

  /**
   * Conectar a canal de acciones IA
   */
  connectToActionsChannel: () => {
    realtimeService.connectToChannel('ai-actions');
  },

  /**
   * Conectar a canal de insights
   */
  connectToInsightsChannel: () => {
    realtimeService.connectToChannel('insights');
  },

  /**
   * Desconectar de un canal
   */
  disconnectFromChannel: (channel: string) => {
    realtimeService.disconnectFromChannel(channel);
  },

  /**
   * Limpiar actualizaciones
   */
  clearUpdates: () => {
    realtimeUpdates.set([]);
  },

  /**
   * Limpiar métricas de un agente
   */
  clearAgentMetrics: (agentId: string) => {
    realtimeMetrics.update(metrics => {
      const newMetrics = new Map(metrics);
      newMetrics.delete(agentId);
      return newMetrics;
    });
  },

  /**
   * Limpiar acciones de un agente
   */
  clearAgentActions: (agentId: string) => {
    realtimeActionsStore.update((actions: AgentAction[]) =>
      actions.filter((action: AgentAction) => action.agentId !== agentId)
    );
  },

  /**
   * Limpiar insights de un agente
   */
  clearAgentInsights: (agentId: string) => {
    realtimeInsights.update(insights => insights.filter(insight => insight.agentId !== agentId));
  },

  /**
   * Limpiar todo
   */
  cleanup: () => {
    realtimeService.cleanup();
    realtimeUpdates.set([]);
    realtimeMetrics.set(new Map());
    realtimeActionsStore.set([]);
    realtimeInsights.set([]);
  }
};
