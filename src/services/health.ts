import api from './api';
import { logger } from '../utils/logger';

// Health check al backend
export async function healthCheckBackend(): Promise<void> {
	try {
		logger.systemInfo('Iniciando health check al backend...', { category: 'HEALTH' });
		const response = await api.get('/ping', {
			headers: { 'Cache-Control': 'no-cache' },
		});
		logger.systemInfo('Backend OK', response.data);
	} catch (error: unknown) {
		const err = error as { response?: { status?: number; data?: unknown }; message?: string };
		logger.systemError(
			`Error conectando al backend${err.response?.status ? ` (HTTP ${err.response.status})` : ''}`,
			new Error(err.message || 'Error de conexión'),
			{
				message: err.message,
				data: err.response?.data,
			}
		);
	}
} 