// Exportación central de módulos
// Aquí se exportarán todos los módulos cuando se implementen

// Por ahora, solo exportamos el módulo de chat existente
export { ChatArea } from '../components/chat/ChatArea';
export { ConversationList } from '../components/chat/ConversationList';

// Exportar módulo de autenticación
export { AuthModule } from './auth';

// Exportar módulo de dashboard
export { DashboardModule } from './dashboard';

// Exportar módulo de equipo
export { TeamModule } from './team';

// Exportar módulo de notificaciones
export { NotificationsModule } from './notifications';

// Exportar nuevos módulos
export { InternalChatModule } from './internal-chat';
export { CampaignsModule } from './campaigns';
export { PhoneModule } from './phone';
export { KnowledgeBaseModule } from './knowledge-base';
export { HRModule } from './hr';
export { SupervisionModule } from './supervision';
export { CopilotModule } from './copilot';

// Exportar módulos adicionales
export { ProvidersModule } from './providers';
export { WarehouseModule } from './warehouse';
export { ShippingModule } from './shipping';
export { ServicesModule } from './services';
 