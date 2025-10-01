// Servicio para manejo de configuración del módulo de inventario

import type { ModuleConfiguration, Provider, MaterialOption } from '../types';
import { generateId } from '../utils/calculations';

const CONFIG_STORAGE_KEY = 'inventory_module_config';
const DEFAULT_MATERIAL_CATEGORIES = [
  'Mármol',
  'Granito', 
  'Cuarzo',
  'Piedra Natural',
  'Otros'
];

// Configuración por defecto
const DEFAULT_CONFIG: ModuleConfiguration = {
  providers: [
    {
      id: 'prov-001',
      name: 'Mármoles del Norte',
      contact: 'Juan Pérez',
      phone: '+52 81 1234-5678',
      materialIds: ['mat-001', 'mat-002', 'mat-003', 'mat-004'] // Mármoles y Granitos
    },
    {
      id: 'prov-002', 
      name: 'Canteras del Sur',
      contact: 'María González',
      phone: '+52 33 9876-5432',
      materialIds: ['mat-005', 'mat-006', 'mat-007', 'mat-008'] // Cuarzos y Piedras Naturales
    },
    {
      id: 'prov-003',
      name: 'Piedras Preciosas SA',
      contact: 'Carlos Rodríguez',
      phone: '+52 55 2468-1357',
      materialIds: ['mat-001', 'mat-004', 'mat-005', 'mat-009', 'mat-010'] // Variedad de materiales premium
    }
  ],
  materials: [
    // Mármoles
    {
      id: 'mat-001',
      name: 'Mármol Blanco Carrara',
      category: 'Mármol',
      description: 'Mármol blanco de alta calidad',
      isActive: true,
      providerIds: ['prov-001', 'prov-003'] // Mármoles del Norte y Piedras Preciosas
    },
    {
      id: 'mat-002',
      name: 'Mármol Travertino',
      category: 'Mármol',
      description: 'Mármol travertino natural',
      isActive: true,
      providerIds: ['prov-001'] // Solo Mármoles del Norte
    },
    {
      id: 'mat-003',
      name: 'Mármol Negro Marquina',
      category: 'Mármol',
      description: 'Mármol negro elegante',
      isActive: true,
      providerIds: ['prov-001'] // Solo Mármoles del Norte
    },
    // Granitos
    {
      id: 'mat-004',
      name: 'Granito Gris',
      category: 'Granito',
      description: 'Granito gris resistente',
      isActive: true,
      providerIds: ['prov-001', 'prov-003'] // Mármoles del Norte y Piedras Preciosas
    },
    {
      id: 'mat-005',
      name: 'Granito Negro Absoluto',
      category: 'Granito',
      description: 'Granito negro absoluto',
      isActive: true,
      providerIds: ['prov-002', 'prov-003'] // Canteras del Sur y Piedras Preciosas
    },
    // Cuarzos
    {
      id: 'mat-006',
      name: 'Cuarzo Blanco',
      category: 'Cuarzo',
      description: 'Cuarzo blanco brillante',
      isActive: true,
      providerIds: ['prov-002'] // Solo Canteras del Sur
    },
    {
      id: 'mat-007',
      name: 'Cuarzo Gris',
      category: 'Cuarzo',
      description: 'Cuarzo gris moderno',
      isActive: true,
      providerIds: ['prov-002'] // Solo Canteras del Sur
    }
  ],
  settings: {
    defaultStandardWidth: 0.3,
    autoSaveEnabled: true,
    showPieceNumbers: true,
    allowMultipleMaterials: true,
    requireMaterialSelection: true,
    defaultMaterialCategories: DEFAULT_MATERIAL_CATEGORIES
  },
  lastUpdated: new Date()
};

export class ConfigService {
  /**
   * Obtiene la configuración actual del módulo
   */
  static getConfiguration(): ModuleConfiguration {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Convertir fechas de string a Date
        config.lastUpdated = new Date(config.lastUpdated);
        return config;
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
    
    // Si no existe configuración, inicializar con la configuración por defecto
    console.log('🔧 Inicializando configuración por defecto del inventario...');
    this.saveConfiguration(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  /**
   * Guarda la configuración del módulo
   */
  static saveConfiguration(config: ModuleConfiguration): void {
    try {
      const configToSave = {
        ...config,
        lastUpdated: new Date()
      };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw new Error('No se pudo guardar la configuración');
    }
  }

  /**
   * Resetea la configuración a los valores por defecto
   */
  static resetConfiguration(): ModuleConfiguration {
    console.log('🔄 Reseteando configuración del inventario a valores por defecto...');
    const defaultConfig = { ...DEFAULT_CONFIG };
    this.saveConfiguration(defaultConfig);
    return defaultConfig;
  }

  /**
   * Fuerza la inicialización de la configuración por defecto
   */
  static initializeDefaultConfiguration(): ModuleConfiguration {
    console.log('🚀 Forzando inicialización de configuración por defecto...');
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    return this.resetConfiguration();
  }

  // ==================== GESTIÓN DE PROVEEDORES ====================

  /**
   * Obtiene todos los proveedores
   */
  static getProviders(): Provider[] {
    const config = this.getConfiguration();
    return config.providers;
  }

  /**
   * Agrega un nuevo proveedor
   */
  static addProvider(provider: Omit<Provider, 'id'>): Provider {
    const config = this.getConfiguration();
    const newProvider: Provider = {
      ...provider,
      id: generateId()
    };
    
    config.providers.push(newProvider);
    this.saveConfiguration(config);
    return newProvider;
  }

  /**
   * Actualiza un proveedor existente
   */
  static updateProvider(providerId: string, updates: Partial<Provider>): Provider {
    const config = this.getConfiguration();
    const index = config.providers.findIndex(p => p.id === providerId);
    
    if (index === -1) {
      throw new Error('Proveedor no encontrado');
    }

    config.providers[index] = { ...config.providers[index], ...updates };
    this.saveConfiguration(config);
    return config.providers[index];
  }

  /**
   * Elimina un proveedor
   */
  static deleteProvider(providerId: string): void {
    const config = this.getConfiguration();
    const index = config.providers.findIndex(p => p.id === providerId);
    
    if (index === -1) {
      throw new Error('Proveedor no encontrado');
    }

    config.providers.splice(index, 1);
    this.saveConfiguration(config);
  }

  // ==================== GESTIÓN DE MATERIALES ====================

  /**
   * Obtiene todos los materiales
   */
  static getMaterials(): MaterialOption[] {
    const config = this.getConfiguration();
    return config.materials;
  }

  /**
   * Obtiene materiales activos
   */
  static getActiveMaterials(): MaterialOption[] {
    const materials = this.getMaterials();
    return materials.filter(m => m.isActive !== false);
  }

  /**
   * Agrega un nuevo material
   */
  static addMaterial(material: Omit<MaterialOption, 'id'>): MaterialOption {
    const config = this.getConfiguration();
    const newMaterial: MaterialOption = {
      ...material,
      id: generateId(),
      isActive: material.isActive !== false
    };
    
    config.materials.push(newMaterial);
    this.saveConfiguration(config);
    return newMaterial;
  }

  /**
   * Actualiza un material existente
   */
  static updateMaterial(materialId: string, updates: Partial<MaterialOption>): MaterialOption {
    const config = this.getConfiguration();
    const index = config.materials.findIndex(m => m.id === materialId);
    
    if (index === -1) {
      throw new Error('Material no encontrado');
    }

    config.materials[index] = { ...config.materials[index], ...updates };
    this.saveConfiguration(config);
    return config.materials[index];
  }

  /**
   * Elimina un material
   */
  static deleteMaterial(materialId: string): void {
    const config = this.getConfiguration();
    const index = config.materials.findIndex(m => m.id === materialId);
    
    if (index === -1) {
      throw new Error('Material no encontrado');
    }

    config.materials.splice(index, 1);
    this.saveConfiguration(config);
  }

  /**
   * Activa/desactiva un material
   */
  static toggleMaterialStatus(materialId: string): MaterialOption {
    const material = this.getMaterials().find(m => m.id === materialId);
    if (!material) {
      throw new Error('Material no encontrado');
    }

    return this.updateMaterial(materialId, { isActive: !material.isActive });
  }

  // ==================== CONFIGURACIÓN GENERAL ====================

  /**
   * Obtiene la configuración general
   */
  static getSettings() {
    const config = this.getConfiguration();
    return config.settings;
  }

  /**
   * Actualiza la configuración general
   */
  static updateSettings(updates: Partial<ModuleConfiguration['settings']>): void {
    const config = this.getConfiguration();
    config.settings = { ...config.settings, ...updates };
    this.saveConfiguration(config);
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtiene las categorías de materiales disponibles
   */
  static getMaterialCategories(): string[] {
    const config = this.getConfiguration();
    return config.settings.defaultMaterialCategories;
  }

  /**
   * Agrega una nueva categoría de material
   */
  static addMaterialCategory(category: string): void {
    const config = this.getConfiguration();
    if (!config.settings.defaultMaterialCategories.includes(category)) {
      config.settings.defaultMaterialCategories.push(category);
      this.saveConfiguration(config);
    }
  }

  /**
   * Elimina una categoría de material
   */
  static removeMaterialCategory(category: string): void {
    const config = this.getConfiguration();
    const index = config.settings.defaultMaterialCategories.indexOf(category);
    if (index > -1) {
      config.settings.defaultMaterialCategories.splice(index, 1);
      this.saveConfiguration(config);
    }
  }

  /**
   * Exporta la configuración completa
   */
  static exportConfiguration(): string {
    const config = this.getConfiguration();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Importa una configuración desde JSON
   */
  static importConfiguration(jsonConfig: string): ModuleConfiguration {
    try {
      const config = JSON.parse(jsonConfig);
      
      // Validar estructura básica
      if (!config.providers || !config.materials || !config.settings) {
        throw new Error('Configuración inválida');
      }

      // Convertir fechas
      config.lastUpdated = new Date(config.lastUpdated || new Date());
      
      this.saveConfiguration(config);
      return config;
    } catch (error) {
      console.error('Error al importar configuración:', error);
      throw new Error('No se pudo importar la configuración');
    }
  }

  /**
   * Obtiene estadísticas de la configuración
   */
  static getConfigurationStats() {
    const config = this.getConfiguration();
    return {
      totalProviders: config.providers.length,
      totalMaterials: config.materials.length,
      activeMaterials: config.materials.filter(m => m.isActive !== false).length,
      materialCategories: config.settings.defaultMaterialCategories.length,
      lastUpdated: config.lastUpdated
    };
  }
}
