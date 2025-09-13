import api from './api';

// ==========================================
// INTERFACES PARA CONFIGURACIÓN DE IMPUESTOS
// ==========================================

export interface TaxConfig {
  id: string;
  name: string;                    // Nombre interno (ISR, IMSS, IVA)
  displayName: string;             // Nombre para mostrar
  description: string;
  type: 'percentage' | 'fixed' | 'progressive';
  value: number;                   // Valor del impuesto
  category: 'federal' | 'state' | 'municipal' | 'custom';
  isEnabled: boolean;              // Si está activo
  isOptional: boolean;             // Si es opcional (puede activarse/desactivarse)
  isCustom: boolean;               // Si es personalizado por el usuario
  scope: 'global' | 'employee';   // Alcance del impuesto
  employeeId?: string;             // Solo si scope = 'employee'
  companyId: string;
  
  // Configuración avanzada
  minAmount?: number;              // Monto mínimo para aplicar
  maxAmount?: number;              // Monto máximo (null = sin límite)
  baseOn: 'gross' | 'net' | 'sbc'; // En qué se basa el cálculo
  priority: number;                // Orden de aplicación
  
  // Para impuestos progresivos (ISR)
  brackets?: Array<{
    lower: number;
    upper: number;
    rate: number;
  }>;
  
  // Metadatos
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxSettings {
  useGlobalDefaults: boolean;      // Si usa configuración global o personalizada
  enabledTaxes: string[];          // Array de nombres de impuestos habilitados
  customTaxes: TaxConfig[];        // Array de configuraciones personalizadas
  taxOverrides: Record<string, {   // Overrides para impuestos globales
    value?: number;
    isEnabled?: boolean;
  }>;
}

export interface TaxPreviewResult {
  employee: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  preview: {
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
    perceptions: {
      baseSalary: number;
      extras: number;
      details: Array<{
        concept: string;
        amount: number;
        description?: string;
      }>;
    };
    deductions: {
      taxes: Array<{
        name: string;
        amount: number;
        rate?: number;
        type: string;
      }>;
      extras: number;
      details: Array<{
        concept: string;
        amount: number;
        description?: string;
      }>;
    };
  };
}

export interface CreateTaxConfigRequest {
  name: string;
  displayName: string;
  description: string;
  type: 'percentage' | 'fixed' | 'progressive';
  value: number;
  category: 'federal' | 'state' | 'municipal' | 'custom';
  isOptional: boolean;
  baseOn?: 'gross' | 'net' | 'sbc';
  minAmount?: number;
  maxAmount?: number;
  priority?: number;
  brackets?: Array<{
    lower: number;
    upper: number;
    rate: number;
  }>;
}

export interface UpdateEmployeeTaxSettingsRequest {
  taxSettings: TaxSettings;
}

// ==========================================
// SERVICIO DE CONFIGURACIÓN DE IMPUESTOS
// ==========================================

class TaxConfigService {
  
  // ==========================================
  // CONFIGURACIONES GLOBALES
  // ==========================================
  
  /**
   * Obtener todas las configuraciones de impuestos globales
   */
  async getGlobalTaxConfigs(companyId: string = 'default'): Promise<TaxConfig[]> {
    try {
      const response = await api.get('/api/tax-config/global', {
        params: { companyId }
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error obteniendo configuraciones globales:', error);
      throw error;
    }
  }
  
  /**
   * Crear una nueva configuración de impuesto global
   */
  async createGlobalTaxConfig(configData: CreateTaxConfigRequest): Promise<TaxConfig> {
    try {
      const response = await api.post('/api/tax-config/global', configData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando configuración global:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar una configuración de impuesto
   */
  async updateTaxConfig(configId: string, configData: Partial<CreateTaxConfigRequest>): Promise<TaxConfig> {
    try {
      const response = await api.put(`/api/tax-config/${configId}`, configData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      throw error;
    }
  }
  
  /**
   * Eliminar una configuración de impuesto
   */
  async deleteTaxConfig(configId: string): Promise<void> {
    try {
      await api.delete(`/api/tax-config/${configId}`);
    } catch (error) {
      console.error('❌ Error eliminando configuración:', error);
      throw error;
    }
  }
  
  // ==========================================
  // CONFIGURACIONES POR EMPLEADO
  // ==========================================
  
  /**
   * Obtener configuraciones de impuestos para un empleado específico
   */
  async getEmployeeTaxConfigs(employeeId: string): Promise<TaxConfig[]> {
    try {
      const response = await api.get(`/api/tax-config/employee/${employeeId}`);
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error obteniendo configuraciones del empleado:', error);
      throw error;
    }
  }
  
  /**
   * Crear configuración de impuesto específica para un empleado
   */
  async createEmployeeTaxConfig(employeeId: string, configData: CreateTaxConfigRequest): Promise<TaxConfig> {
    try {
      const response = await api.post(`/api/tax-config/employee/${employeeId}`, configData);
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando configuración del empleado:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar configuraciones de impuestos de un empleado
   */
  async updateEmployeeTaxSettings(employeeId: string, settings: UpdateEmployeeTaxSettingsRequest): Promise<void> {
    try {
      await api.put(`/api/tax-config/employee/${employeeId}/settings`, settings);
    } catch (error) {
      console.error('❌ Error actualizando configuraciones del empleado:', error);
      throw error;
    }
  }
  
  // ==========================================
  // CONFIGURACIÓN EFECTIVA
  // ==========================================
  
  /**
   * Obtener la configuración efectiva de impuestos para un empleado
   * (combinación de global + empleado específico)
   */
  async getEffectiveTaxConfig(employeeId: string): Promise<TaxConfig[]> {
    try {
      const response = await api.get(`/api/tax-config/effective/${employeeId}`);
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error obteniendo configuración efectiva:', error);
      throw error;
    }
  }
  
  // ==========================================
  // CONFIGURACIÓN POR DEFECTO
  // ==========================================
  
  /**
   * Crear configuraciones por defecto para México (ISR, IMSS, IVA, INFONAVIT)
   */
  async createDefaultTaxes(companyId: string = 'default'): Promise<TaxConfig[]> {
    try {
      const response = await api.post('/api/tax-config/create-defaults', { companyId });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('❌ Error creando configuraciones por defecto:', error);
      throw error;
    }
  }
  
  // ==========================================
  // VISTA PREVIA
  // ==========================================
  
  /**
   * Obtener vista previa de cálculo de impuestos para un empleado
   */
  async previewTaxCalculation(employeeId: string, periodDate: string): Promise<TaxPreviewResult> {
    try {
      const response = await api.post(`/api/tax-config/preview/${employeeId}`, {
        periodDate
      });
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo vista previa:', error);
      throw error;
    }
  }
  
  // ==========================================
  // UTILIDADES
  // ==========================================
  
  /**
   * Obtener tipos de impuestos disponibles
   */
  getTaxTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { 
        value: 'percentage', 
        label: 'Porcentaje', 
        description: 'Porcentaje del salario (ej: 10%)' 
      },
      { 
        value: 'fixed', 
        label: 'Monto Fijo', 
        description: 'Cantidad fija (ej: $500 MXN)' 
      },
      { 
        value: 'progressive', 
        label: 'Progresivo', 
        description: 'Tramos progresivos (ej: ISR)' 
      }
    ];
  }
  
  /**
   * Obtener categorías de impuestos disponibles
   */
  getTaxCategories(): Array<{ value: string; label: string; description: string }> {
    return [
      { 
        value: 'federal', 
        label: 'Federal', 
        description: 'Impuestos federales (ISR, IVA)' 
      },
      { 
        value: 'state', 
        label: 'Estatal', 
        description: 'Impuestos estatales' 
      },
      { 
        value: 'municipal', 
        label: 'Municipal', 
        description: 'Impuestos municipales' 
      },
      { 
        value: 'custom', 
        label: 'Personalizado', 
        description: 'Configuraciones personalizadas' 
      }
    ];
  }
  
  /**
   * Obtener bases de cálculo disponibles
   */
  getCalculationBases(): Array<{ value: string; label: string; description: string }> {
    return [
      { 
        value: 'gross', 
        label: 'Salario Bruto', 
        description: 'Calcular sobre el salario bruto total' 
      },
      { 
        value: 'net', 
        label: 'Salario Neto', 
        description: 'Calcular sobre el salario neto' 
      },
      { 
        value: 'sbc', 
        label: 'SBC', 
        description: 'Calcular sobre el Salario Base de Cotización' 
      }
    ];
  }
  
  /**
   * Formatear configuración de impuesto para mostrar
   */
  formatTaxConfig(config: TaxConfig): string {
    switch (config.type) {
      case 'percentage':
        return `${config.value}%`;
      case 'fixed':
        return `$${config.value.toLocaleString('es-MX')} MXN`;
      case 'progressive':
        return 'Progresivo';
      default:
        return config.value.toString();
    }
  }
  
  /**
   * Validar configuración de impuesto
   */
  validateTaxConfig(config: Partial<CreateTaxConfigRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.name?.trim()) {
      errors.push('El nombre es requerido');
    }
    
    if (!config.displayName?.trim()) {
      errors.push('El nombre para mostrar es requerido');
    }
    
    if (!config.type) {
      errors.push('El tipo de impuesto es requerido');
    }
    
    if (config.value === undefined || config.value === null) {
      errors.push('El valor es requerido');
    } else if (config.value < 0) {
      errors.push('El valor no puede ser negativo');
    }
    
    if (config.type === 'percentage' && config.value > 100) {
      errors.push('El porcentaje no puede ser mayor a 100%');
    }
    
    if (config.type === 'progressive' && (!config.brackets || config.brackets.length === 0)) {
      errors.push('Los tramos son requeridos para impuestos progresivos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exportar instancia única del servicio
export const taxConfigService = new TaxConfigService();
export default taxConfigService;
