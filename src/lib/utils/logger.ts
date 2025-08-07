/**
 * Sistema de logging centralizado para UTalk Frontend
 * Reemplaza console.log statements con un sistema estructurado
 * Basado en la documentación del backend y mejores prácticas
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    data?: any;
    error?: Error;
}

class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private isDevelopment: boolean = import.meta.env.DEV;

    private constructor() {
        // Configurar nivel de log basado en el entorno
        this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.logLevel;
    }

    private formatMessage(level: string, message: string, context?: string): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? `[${context}]` : '';
        return `${timestamp} ${level}${contextStr}: ${message}`;
    }

    private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error): void {
        if (!this.shouldLog(level)) return;

        const levelStr = LogLevel[level];
        const formattedMessage = this.formatMessage(levelStr, message, context);

        // En desarrollo, usar console para debugging
        if (this.isDevelopment) {
            switch (level) {
                case LogLevel.DEBUG:
                    // eslint-disable-next-line no-console
                    console.debug(formattedMessage, data || '');
                    break;
                case LogLevel.INFO:
                    // eslint-disable-next-line no-console
                    console.info(formattedMessage, data || '');
                    break;
                case LogLevel.WARN:
                    // eslint-disable-next-line no-console
                    console.warn(formattedMessage, data || '');
                    break;
                case LogLevel.ERROR:
                    // eslint-disable-next-line no-console
                    console.error(formattedMessage, error || data || '');
                    break;
            }
        } else {
            // En producción, enviar a servicio de logging (Sentry, etc.)
            this.sendToLoggingService({
                level,
                message,
                timestamp: new Date().toISOString(),
                context,
                data,
                error
            });
        }
    }

    private sendToLoggingService(_entry: LogEntry): void {
        // En producción, enviar a servicio de logging externo
        // Por ahora, solo en desarrollo se usa console
        if (this.isDevelopment) {
            return;
        }

        // TODO: Implementar envío a servicio de logging en producción
        // Ejemplo: Sentry, LogRocket, etc.
    }

    public debug(message: string, context?: string, data?: any): void {
        this.log(LogLevel.DEBUG, message, context, data);
    }

    public info(message: string, context?: string, data?: any): void {
        this.log(LogLevel.INFO, message, context, data);
    }

    public warn(message: string, context?: string, data?: any): void {
        this.log(LogLevel.WARN, message, context, data);
    }

    public error(message: string, context?: string, error?: Error, data?: any): void {
        this.log(LogLevel.ERROR, message, context, data, error);
    }

    // Métodos específicos para diferentes contextos
    public auth(message: string, data?: any): void {
        this.info(message, 'AUTH', data);
    }

    public socket(message: string, data?: any): void {
        this.info(message, 'SOCKET', data);
    }

    public api(message: string, data?: any): void {
        this.info(message, 'API', data);
    }

    public store(message: string, data?: any): void {
        this.debug(message, 'STORE', data);
    }

    public validation(message: string, data?: any): void {
        this.debug(message, 'VALIDATION', data);
    }

    public chat(message: string, data?: any): void {
        this.debug(message, 'CHAT', data);
    }
}

// Instancia singleton
export const logger = Logger.getInstance();

// Funciones de conveniencia para uso directo
export const logDebug = (message: string, context?: string, data?: any) => logger.debug(message, context, data);
export const logInfo = (message: string, context?: string, data?: any) => logger.info(message, context, data);
export const logWarn = (message: string, context?: string, data?: any) => logger.warn(message, context, data);
export const logError = (message: string, context?: string, error?: Error, data?: any) => logger.error(message, context, error, data);

// Funciones específicas por contexto - aceptan data como segundo parámetro
export const logAuth = (message: string, data?: any) => logger.auth(message, data);
export const logSocket = (message: string, data?: any) => logger.socket(message, data);
export const logApi = (message: string, data?: any) => logger.api(message, data);
export const logStore = (message: string, data?: any) => logger.store(message, data);
export const logValidation = (message: string, data?: any) => logger.validation(message, data);
export const logChat = (message: string, data?: any) => logger.chat(message, data);

// Funciones de conveniencia que aceptan error como segundo parámetro
export const logErrorWithContext = (message: string, context: string, error?: Error, data?: any) => logger.error(message, context, error, data);
export const logWarnWithContext = (message: string, context: string, data?: any) => logger.warn(message, context, data); 