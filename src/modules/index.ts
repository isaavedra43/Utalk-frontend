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
export { default as CampaignsModule } from './campaigns/CampaignsModule';
export { default as HRModule } from './hr/HRModule';
export { default as CallsModule } from './calls';
export { default as KnowledgeBaseModule } from './knowledge-base/KnowledgeBaseModule';
export { SupervisionModule } from './supervision';
export { CopilotModule } from './copilot';

// Exportar módulos adicionales
export { default as InventoryModule } from './inventory/InventoryModule';
export { FleetTrackingModule } from './fleet-tracking';
export { ProjectsModule } from './projects';

// Módulo de nómina integrado en HR
 