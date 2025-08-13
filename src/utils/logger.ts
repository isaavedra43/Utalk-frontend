/* Sistema de logs global para el proyecto (visible en consola del navegador)
 * Uso: import { logger } from '../utils/logger';
 *       logger.info('TAG', 'mensaje', { data });
 */

type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

const getTimestamp = () => new Date().toISOString();

const styles: Record<LogLevel, string> = {
	INFO: 'background:#1e40af;color:white;padding:2px 6px;border-radius:4px',
	SUCCESS: 'background:#15803d;color:white;padding:2px 6px;border-radius:4px',
	WARN: 'background:#b45309;color:white;padding:2px 6px;border-radius:4px',
	ERROR: 'background:#b91c1c;color:white;padding:2px 6px;border-radius:4px',
};

function log(level: LogLevel, tag: string, message: string, payload?: unknown) {
	const prefix = `%c${level}%c ${getTimestamp()} %c[${tag}]`;
	const base = 'color:inherit;padding:0;margin:0';
	const tagStyle = 'color:#334155;font-weight:600';
	if (payload !== undefined) {
		console.log(prefix, styles[level], base, tagStyle, message, payload);
	} else {
		console.log(prefix, styles[level], base, tagStyle, message);
	}
}

export const logger = {
	info: (tag: string, message: string, payload?: unknown) => log('INFO', tag, message, payload),
	success: (tag: string, message: string, payload?: unknown) => log('SUCCESS', tag, message, payload),
	warn: (tag: string, message: string, payload?: unknown) => log('WARN', tag, message, payload),
	error: (tag: string, message: string, payload?: unknown) => log('ERROR', tag, message, payload),
}; 