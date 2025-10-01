// Export principal del módulo de inventario
export { default as InventoryModule } from './InventoryModule';

// Export de tipos
export type { Platform, Piece, InventorySettings, ExportData } from './types';

// Export de servicios
export { StorageService } from './services/storageService';
export { ExportService } from './services/exportService';

// Export de hooks
export { useInventory } from './hooks/useInventory';

// Export de utilidades
export * from './utils/calculations';

