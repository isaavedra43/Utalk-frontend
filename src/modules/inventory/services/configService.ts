// Servicio para manejo de configuración del módulo de inventario

import type { ModuleConfiguration, Provider, MaterialOption, Driver } from '../types';
import { generateId } from '../utils/calculations';

const CONFIG_STORAGE_KEY = 'inventory_module_config';
const DEFAULT_MATERIAL_CATEGORIES = [
  'Mármol',
  'Granito', 
  'Cuarzo',
  'Piedra Natural',
  'Otros'
];

// ✅ Configuración VACÍA por defecto - Solo datos reales del backend
const DEFAULT_CONFIG: ModuleConfiguration = {
  providers: [], // ✅ NO HAY PROVEEDORES FALSOS - Solo los que cree el usuario
  materials: [], // ✅ NO HAY MATERIALES FALSOS - Solo los que cree el usuario
  drivers: [], // ✅ NO HAY CHOFERES FALSOS - Solo los que cree el usuario
  settings: {
    defaultStandardWidth: 0.3,
    autoSaveEnabled: true,
    showPieceNumbers: true,
    allowMultipleMaterials: true,
    requireMaterialSelection: false, // ✅ No requerir material para permitir registros sin configuración previa
    defaultMaterialCategories: DEFAULT_MATERIAL_CATEGORIES
  },
  lastUpdated: new Date()
};

export class ConfigService {
  /**
   * Obtiene la configuración actual del módulo
   * ✅ NO CREA DATOS FALSOS - Retorna configuración vacía
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
    
    // ✅ Retornar configuración VACÍA - No crear datos falsos
    console.log('✅ Inicializando configuración vacía - Usuario debe crear proveedores y materiales');
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
   * Resetea la configuración a los valores por defecto (VACÍA)
   * ✅ NO CREA DATOS FALSOS
   */
  static resetConfiguration(): ModuleConfiguration {
    console.log('✅ Reseteando configuración a configuración vacía - Solo datos reales');
    const defaultConfig = { ...DEFAULT_CONFIG };
    this.saveConfiguration(defaultConfig);
    return defaultConfig;
  }

  /**
   * ELIMINADO: Ya no se fuerza inicialización de datos falsos
   * ✅ Solo se permite limpiar la configuración local
   */
  static clearLocalConfiguration(): void {
    console.log('🧹 Limpiando configuración local - Datos se obtendrán del backend');
    localStorage.removeItem(CONFIG_STORAGE_KEY);
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

  // ==================== GESTIÓN DE CHOFERES ====================

  /**
   * Obtiene todos los choferes
   */
  static getDrivers(): Driver[] {
    const config = this.getConfiguration();
    return config.drivers || [];
  }

  /**
   * Obtiene choferes activos
   */
  static getActiveDrivers(): Driver[] {
    return this.getDrivers().filter(d => d.isActive !== false);
  }

  /**
   * Agrega un nuevo chofer
   */
  static addDriver(driver: Omit<Driver, 'id'>): Driver {
    const config = this.getConfiguration();
    const newDriver: Driver = {
      ...driver,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    config.drivers.push(newDriver);
    this.saveConfiguration(config);
    return newDriver;
  }

  /**
   * Actualiza un chofer existente
   */
  static updateDriver(driverId: string, updates: Partial<Driver>): Driver {
    const config = this.getConfiguration();
    const index = config.drivers.findIndex(d => d.id === driverId);
    
    if (index === -1) {
      throw new Error('Chofer no encontrado');
    }

    config.drivers[index] = {
      ...config.drivers[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveConfiguration(config);
    return config.drivers[index];
  }

  /**
   * Elimina un chofer
   */
  static deleteDriver(driverId: string): void {
    const config = this.getConfiguration();
    const index = config.drivers.findIndex(d => d.id === driverId);
    
    if (index === -1) {
      throw new Error('Chofer no encontrado');
    }

    config.drivers.splice(index, 1);
    this.saveConfiguration(config);
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
      totalDrivers: config.drivers.length,
      activeDrivers: config.drivers.filter(d => d.isActive !== false).length,
      materialCategories: config.settings.defaultMaterialCategories.length,
      lastUpdated: config.lastUpdated
    };
  }
}
