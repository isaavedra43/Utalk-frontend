// 📋 MÓDULO DE CAMPAÑAS - UTalk Frontend
// Exportaciones principales del módulo

// ✅ COMPONENTES PRINCIPALES
export { default as CampaignsDashboard } from './components/CampaignsDashboard'
export { default as CampaignsList } from './components/CampaignsList'
export { default as CampaignsSidebar } from './components/CampaignsSidebar'

// ✅ HOOKS
export { useCampaigns, useCampaign, useCampaignStats } from './hooks/useCampaigns'

// ✅ SERVICIOS
export { campaignService } from './services/campaignService'

// ✅ TIPOS
export type {
  Campaign,
  CampaignStatus,
  CampaignType,
  CampaignChannel,
  CampaignMessage,
  CampaignVariable,
  CampaignAttachment,
  CallToAction,
  SelectedContact,
  ContactCampaignStatus,
  ContactSendResult,
  ContactInteraction,
  CampaignSettings,
  CampaignStats,
  ChannelStats,
  CampaignFilters,
  CampaignTemplate,
  ContactSegment,
  SegmentCriteria,
  CampaignModuleConfig,
  CampaignsResponse,
  CampaignResponse,
  ContactsResponse,
  TemplatesResponse,
  CampaignAction,
  CampaignEvent
} from './types'

// ✅ CONSTANTES
export {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_LABELS,
  CONTACT_STATUS_LABELS
} from './types' 