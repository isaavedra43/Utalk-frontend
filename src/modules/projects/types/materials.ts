// Gestión de materiales e inventario

export interface ProjectInventory {
  projectId: string;
  
  // Materiales del proyecto
  materials: ProjectMaterial[];
  
  // Integración con inventario global
  inventoryIntegration: InventoryIntegration;
  
  // Solicitudes de materiales
  materialRequests: MaterialRequest[];
  
  // Órdenes de compra
  purchaseOrders: PurchaseOrder[];
  
  // Entregas
  deliveries: Delivery[];
  
  // Control de desperdicios
  waste: WasteTracking[];
  
  // Resumen
  totalBudgeted: number;
  totalSpent: number;
  totalCommitted: number;
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  
  // Identificación
  name: string;
  code?: string;
  specification: string;
  category: string;
  unit: string;
  
  // Cantidades
  quantityPlanned: number;
  quantityOrdered: number;
  quantityDelivered: number;
  quantityUsed: number;
  quantityRemaining: number;
  quantityWasted: number;
  
  // Costos
  unitCost: number;
  totalCost: number;
  budgetedCost: number;
  actualCost: number;
  variance: number;
  
  // Proveedores
  preferredProviderId?: string; // Del módulo de proveedores
  preferredProviderName?: string;
  alternateProviders: AlternateProvider[];
  
  // Ubicación (para construcción)
  storage: MaterialStorage[];
  
  // Tracking
  status: 'pending' | 'ordered' | 'in_transit' | 'delivered' | 'in_use' | 'depleted';
  deliveryDate?: Date;
  estimatedDeliveryDate?: Date;
  
  // Calidad
  qualityStandard?: string;
  certificationRequired: boolean;
  certifications: MaterialCertification[];
  
  // Documentación
  datasheets: MaterialDocument[];
  photos: string[];
  
  // Tareas asociadas
  taskIds: string[]; // Tareas que requieren este material
  
  // Alertas
  minStock: number;
  reorderPoint: number;
  alertOnLowStock: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  notes?: string;
}

export interface AlternateProvider {
  providerId: string;
  providerName: string;
  unitCost: number;
  leadTime: number; // Días
  minimumOrder: number;
  lastUsed?: Date;
  rating?: number;
}

export interface MaterialStorage {
  id: string;
  location: string;
  zone: string;
  floor?: string;
  area?: string;
  bin?: string;
  quantity: number;
  lastUpdated: Date;
  updatedBy: string;
}

export interface MaterialCertification {
  id: string;
  type: string;
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface MaterialDocument {
  id: string;
  type: 'datasheet' | 'msds' | 'specification' | 'certification' | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface InventoryIntegration {
  linkedInventoryId?: string; // ID del inventario global
  autoReserve: boolean;
  autoOrder: boolean;
  minStockAlert: boolean;
  syncEnabled: boolean;
  lastSynced?: Date;
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  requestNumber: string; // REQ-001
  
  // Solicitante
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  
  // Material
  materialId?: string;
  materialName: string;
  quantity: number;
  unit: string;
  
  // Uso
  purpose: string;
  taskId?: string;
  phaseId?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiredDate: Date;
  
  // Estado
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'ordered' | 'delivered' | 'cancelled';
  
  // Aprobación
  approvals: RequestApproval[];
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Validación contra presupuesto
  budgetValidated: boolean;
  budgetCategoryId?: string;
  estimatedCost: number;
  approvedCost?: number;
  
  // Orden de compra generada
  purchaseOrderId?: string;
  
  // Entrega
  deliveredAt?: Date;
  deliveredBy?: string;
  deliveredQuantity?: number;
  
  // Notas
  notes?: string;
  attachments: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestApproval {
  id: string;
  approver: string;
  approverName: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  comments?: string;
  order: number;
}

export interface PurchaseOrder {
  id: string;
  projectId: string;
  orderNumber: string; // PO-001
  
  // Proveedor (del módulo de proveedores)
  providerId: string;
  providerName: string;
  providerContact?: string;
  
  // Fechas
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  
  // Items
  items: PurchaseOrderItem[];
  
  // Costos
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  
  // Estado
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'delivered' | 'cancelled';
  
  // Tracking
  trackingNumber?: string;
  carrier?: string;
  
  // Aprobación
  approvedBy?: string;
  approvedAt?: Date;
  
  // Recepción
  receivedBy?: string;
  receivedAt?: Date;
  deliveryIds: string[]; // Puede tener entregas parciales
  
  // Documentos
  documentUrl?: string;
  invoiceId?: string;
  attachments: string[];
  
  // Notas
  notes?: string;
  terms?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PurchaseOrderItem {
  id: string;
  materialId?: string;
  materialName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  
  // Entrega
  quantityDelivered: number;
  quantityRemaining: number;
  
  // Asociación
  taskId?: string;
  requestId?: string;
  
  tax?: number;
  discount?: number;
}

export interface Delivery {
  id: string;
  projectId: string;
  purchaseOrderId?: string;
  deliveryNumber: string; // DEL-001
  
  // Proveedor
  providerId?: string;
  providerName: string;
  
  // Fecha y hora
  scheduledDate: Date;
  actualDate: Date;
  scheduledTime?: string;
  actualTime?: string;
  
  // Items
  items: DeliveryItem[];
  
  // Recepción
  receivedBy: string;
  receivedByName: string;
  inspectedBy?: string;
  
  // Estado
  status: 'scheduled' | 'in_transit' | 'arrived' | 'inspected' | 'accepted' | 'rejected' | 'partial';
  
  // Inspección
  inspectionNotes?: string;
  qualityIssues: QualityIssue[];
  acceptanceStatus: 'accepted' | 'rejected' | 'conditional';
  
  // Ubicación de almacenamiento
  storageLocations: {
    materialId: string;
    locationId: string;
    quantity: number;
  }[];
  
  // Documentos
  deliveryNote?: string;
  packingList?: string;
  photos: string[];
  signatures: DeliverySignature[];
  
  // Notas
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  id: string;
  materialId?: string;
  materialName: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  
  // Inspección
  inspected: boolean;
  passed: boolean;
  notes?: string;
}

export interface QualityIssue {
  id: string;
  materialId: string;
  materialName: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  quantityAffected: number;
  photos: string[];
  resolution?: string;
  resolvedAt?: Date;
}

export interface DeliverySignature {
  type: 'driver' | 'receiver' | 'inspector';
  name: string;
  signatureUrl: string;
  timestamp: Date;
}

export interface WasteTracking {
  id: string;
  projectId: string;
  
  // Material
  materialId: string;
  materialName: string;
  
  // Cantidad
  quantity: number;
  unit: string;
  
  // Costo
  unitCost: number;
  totalCost: number;
  
  // Razón
  reason: 'damage' | 'excess' | 'obsolete' | 'quality' | 'theft' | 'other';
  description: string;
  
  // Responsable
  reportedBy: string;
  reportedAt: Date;
  
  // Ubicación
  taskId?: string;
  location?: string;
  
  // Prevención
  preventable: boolean;
  preventionMeasures?: string;
  
  // Fotos
  photos: string[];
  
  // Metadata
  createdAt: Date;
  tags: string[];
}

// Reportes de materiales
export interface MaterialsSummary {
  totalMaterials: number;
  totalBudgeted: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  
  byCategory: {
    category: string;
    count: number;
    budgeted: number;
    spent: number;
  }[];
  
  byStatus: {
    status: string;
    count: number;
    quantity: number;
  }[];
  
  pendingRequests: number;
  pendingOrders: number;
  lowStockItems: number;
  totalWaste: number;
  wastePercentage: number;
  
  lastCalculated: Date;
}

