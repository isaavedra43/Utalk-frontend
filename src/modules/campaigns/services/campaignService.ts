// 🛠️ SERVICIO DE CAMPAÑAS - UTalk Frontend
// Abstrae las llamadas a la API del backend para campañas

import { apiClient } from '@/services/apiClient'
import type { 
  Campaign, 
  CampaignFilters, 
  CampaignsResponse, 
  CampaignResponse,
  
  ContactsResponse,
  
  TemplatesResponse,
  CampaignStats
} from '../types'

/**
 * 🎯 SERVICIO PRINCIPAL DE CAMPAÑAS
 */
class CampaignService {
  
  /**
   * ✅ OBTENER LISTA DE CAMPAÑAS
   */
  async getCampaigns(filters: CampaignFilters = {}): Promise<CampaignsResponse> {
    try {
      console.log('🔍 CampaignService.getCampaigns called:', filters)
      
      // Construir query string desde filtros
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
      if (filters.search) queryParams.append('search', filters.search)
      
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status))
      }
      
      if (filters.type?.length) {
        filters.type.forEach(type => queryParams.append('type', type))
      }
      
      if (filters.channels?.length) {
        filters.channels.forEach(channel => queryParams.append('channels', channel))
      }
      
      if (filters.tags?.length) {
        filters.tags.forEach(tag => queryParams.append('tags', tag))
      }
      
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString())
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString())
      
      const url = `/campaigns?${queryParams.toString()}`
      console.log('📡 Making API call to:', url)
      
      const response = await apiClient.get(url)
      console.log('📥 Raw campaigns response:', response)
      
      // TODO: Aquí se integrará con el sistema de validación cuando se implemente CampaignValidator
      return {
        success: true,
        campaigns: response.data || response.campaigns || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 10
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getCampaigns error:', error)
      return {
        success: false,
        campaigns: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ OBTENER CAMPAÑA INDIVIDUAL
   */
  async getCampaign(campaignId: string): Promise<CampaignResponse> {
    try {
      console.log('🔍 CampaignService.getCampaign called:', campaignId)
      
      const response = await apiClient.get(`/campaigns/${campaignId}`)
      console.log('📥 Campaign response:', response)
      
      return {
        success: true,
        campaign: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ CREAR NUEVA CAMPAÑA
   */
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignResponse> {
    try {
      console.log('🔍 CampaignService.createCampaign called:', campaignData)
      
      const response = await apiClient.post('/campaigns', campaignData)
      console.log('📥 Create campaign response:', response)
      
      return {
        success: true,
        campaign: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.createCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear campaña'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR CAMPAÑA
   */
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<CampaignResponse> {
    try {
      console.log('🔍 CampaignService.updateCampaign called:', { campaignId, updates })
      
      const response = await apiClient.put(`/campaigns/${campaignId}`, updates)
      console.log('📥 Update campaign response:', response)
      
      return {
        success: true,
        campaign: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.updateCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar campaña'
      }
    }
  }
  
  /**
   * ✅ ELIMINAR CAMPAÑA
   */
  async deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 CampaignService.deleteCampaign called:', campaignId)
      
      await apiClient.delete(`/campaigns/${campaignId}`)
      console.log('✅ Campaign deleted successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CampaignService.deleteCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar campaña'
      }
    }
  }
  
  /**
   * ✅ CLONAR CAMPAÑA
   */
  async cloneCampaign(params: { id: string; newName?: string }): Promise<CampaignResponse> {
    try {
      console.log('🔍 CampaignService.cloneCampaign called:', params)
      
      const response = await apiClient.post(`/campaigns/${params.id}/clone`, {
        newName: params.newName
      })
      console.log('📥 Clone campaign response:', response)
      
      return {
        success: true,
        campaign: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.cloneCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al clonar campaña'
      }
    }
  }
  
  /**
   * ✅ ENVIAR CAMPAÑA
   */
  async sendCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 CampaignService.sendCampaign called:', campaignId)
      
      const response = await apiClient.post(`/campaigns/${campaignId}/send`)
      console.log('📥 Send campaign response:', response)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CampaignService.sendCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al enviar campaña'
      }
    }
  }
  
  /**
   * ✅ PAUSAR CAMPAÑA
   */
  async pauseCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 CampaignService.pauseCampaign called:', campaignId)
      
      await apiClient.post(`/campaigns/${campaignId}/pause`)
      console.log('✅ Campaign paused successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CampaignService.pauseCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al pausar campaña'
      }
    }
  }
  
  /**
   * ✅ REANUDAR CAMPAÑA
   */
  async resumeCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 CampaignService.resumeCampaign called:', campaignId)
      
      await apiClient.post(`/campaigns/${campaignId}/resume`)
      console.log('✅ Campaign resumed successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CampaignService.resumeCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al reanudar campaña'
      }
    }
  }
  
  /**
   * ✅ CANCELAR CAMPAÑA
   */
  async cancelCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 CampaignService.cancelCampaign called:', campaignId)
      
      await apiClient.post(`/campaigns/${campaignId}/cancel`)
      console.log('✅ Campaign cancelled successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CampaignService.cancelCampaign error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar campaña'
      }
    }
  }
  
  /**
   * ✅ OBTENER ESTADÍSTICAS DE CAMPAÑA
   */
  async getCampaignStats(campaignId: string): Promise<{ success: boolean; stats?: CampaignStats; error?: string }> {
    try {
      console.log('🔍 CampaignService.getCampaignStats called:', campaignId)
      
      const response = await apiClient.get(`/campaigns/${campaignId}/stats`)
      console.log('📥 Campaign stats response:', response)
      
      return {
        success: true,
        stats: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getCampaignStats error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      }
    }
  }
  
  /**
   * ✅ OBTENER CONTACTOS PARA CAMPAÑA
   */
  async getContactsForCampaign(filters: {
    search?: string
    tags?: string[]
    status?: string[]
    page?: number
    limit?: number
  } = {}): Promise<ContactsResponse> {
    try {
      console.log('🔍 CampaignService.getContactsForCampaign called:', filters)
      
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.search) queryParams.append('search', filters.search)
      
      if (filters.tags?.length) {
        filters.tags.forEach(tag => queryParams.append('tags', tag))
      }
      
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status))
      }
      
      const url = `/contacts?${queryParams.toString()}`
      const response = await apiClient.get(url)
      console.log('📥 Contacts response:', response)
      
      return {
        success: true,
        contacts: response.data || response.contacts || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 10
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getContactsForCampaign error:', error)
      return {
        success: false,
        contacts: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        error: error instanceof Error ? error.message : 'Error al obtener contactos'
      }
    }
  }
  
  /**
   * ✅ OBTENER PLANTILLAS DE CAMPAÑA
   */
  async getCampaignTemplates(): Promise<TemplatesResponse> {
    try {
      console.log('🔍 CampaignService.getCampaignTemplates called')
      
      const response = await apiClient.get('/campaigns/templates')
      console.log('📥 Templates response:', response)
      
      return {
        success: true,
        templates: response.data || response.templates || [],
        total: response.total || 0
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getCampaignTemplates error:', error)
      return {
        success: false,
        templates: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Error al obtener plantillas'
      }
    }
  }
  
  /**
   * ✅ VALIDAR MENSAJE DE CAMPAÑA
   */
  async validateCampaignMessage(message: string, type: 'whatsapp' | 'sms', variables: Record<string, string> = {}): Promise<{
    success: boolean
    isValid: boolean
    errors?: string[]
    estimatedCost?: number
    characterCount?: number
    smsPartsCount?: number
  }> {
    try {
      console.log('🔍 CampaignService.validateCampaignMessage called:', { message, type, variables })
      
      const response = await apiClient.post('/campaigns/validate-message', {
        message,
        type,
        variables
      })
      console.log('📥 Validate message response:', response)
      
      return {
        success: true,
        ...response.data
      }
      
    } catch (error) {
      console.error('❌ CampaignService.validateCampaignMessage error:', error)
      return {
        success: false,
        isValid: false,
        errors: ['Error al validar mensaje']
      }
    }
  }
  
  /**
   * ✅ OBTENER VISTA PREVIA DE CAMPAÑA
   */
  async getCampaignPreview(campaignId: string, contactId?: string): Promise<{
    success: boolean
    preview?: {
      whatsapp?: string
      sms?: string
      variables?: Record<string, string>
    }
    error?: string
  }> {
    try {
      console.log('🔍 CampaignService.getCampaignPreview called:', { campaignId, contactId })
      
      const url = contactId 
        ? `/campaigns/${campaignId}/preview?contactId=${contactId}`
        : `/campaigns/${campaignId}/preview`
        
      const response = await apiClient.get(url)
      console.log('📥 Campaign preview response:', response)
      
      return {
        success: true,
        preview: response.data || response
      }
      
    } catch (error) {
      console.error('❌ CampaignService.getCampaignPreview error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener vista previa'
      }
    }
  }
}

// ✅ INSTANCIA SINGLETON
export const campaignService = new CampaignService()
export default campaignService 