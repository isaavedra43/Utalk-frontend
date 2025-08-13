import api from './api';
import { logger } from '../utils/logger';

// Health check al backend
export async function healthCheckBackend(): Promise<void> {
	try {
		logger.info('HEALTH', 'Iniciando health check al backend...');
		const response = await api.get('/ping', {
			headers: { 'Cache-Control': 'no-cache' },
		});
		logger.success('HEALTH', 'Backend OK', response.data);
	} catch (error: unknown) {
		const err = error as { response?: { status?: number; data?: unknown }; message?: string };
		logger.error(
			'HEALTH',
			`Error conectando al backend${err.response?.status ? ` (HTTP ${err.response.status})` : ''}`,
			{
				message: err.message,
				data: err.response?.data,
			}
		);
	}
} 