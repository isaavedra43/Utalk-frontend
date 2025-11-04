// ============================================
// PROVIDER
// ============================================
export interface Provider {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  materialIds?: string[];
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  taxId?: string;
  paymentTerms?: string; // "30 días", "60 días", "Contado", etc.
  creditLimit?: number;
  website?: string;
  bankAccount?: string;
  currency?: string;
}

// ============================================
// MATERIAL
// ============================================
export interface ProviderMaterial {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  unit: string; // "m²", "kg", "pieza", etc.
  sku?: string;
  imageUrl?: string;
  stock?: number;
  minStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PURCHASE ORDER (ORDEN DE COMPRA)
// ============================================
export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  providerId: string;
  providerName: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'in_transit' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  internalNotes?: string;
  
  // Fechas
  createdAt: string;
  sentAt?: string;
  expectedDeliveryDate?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  
  // Quien lo crea/gestiona
  createdBy: string;
  createdByName: string;
  
  // Información de entrega
  deliveryAddress?: string;
  deliveryNotes?: string;
  
  // Documentos
  attachments?: string[];
}

// ============================================
// PAYMENT (PAGO)
// ============================================
export interface Payment {
  id: string;
  paymentNumber: string;
  providerId: string;
  providerName: string;
  purchaseOrderId?: string; // Puede estar relacionado con una orden específica o ser un pago general
  orderNumber?: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'check' | 'card' | 'other';
  reference?: string; // Número de referencia, cheque, etc.
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  
  // Fechas
  paymentDate: string;
  createdAt: string;
  
  // Quien lo registra
  createdBy: string;
  createdByName: string;
  
  // Documentos
  receiptUrl?: string;
  attachments?: string[];
}

// ============================================
// ACTIVITY / HISTORY (HISTORIAL)
// ============================================
export interface ProviderActivity {
  id: string;
  providerId: string;
  type: 'created' | 'updated' | 'order_created' | 'order_updated' | 'order_accepted' | 'order_rejected' | 
        'order_delivered' | 'payment_created' | 'payment_completed' | 'material_added' | 'material_updated' | 
        'material_deleted' | 'note_added' | 'document_uploaded' | 'status_changed';
  description: string;
  details?: Record<string, any>; // JSON con detalles adicionales
  entityType?: 'provider' | 'order' | 'payment' | 'material';
  entityId?: string;
  
  // Fechas y usuario
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

// ============================================
// ACCOUNT STATEMENT (ESTADO DE CUENTA)
// ============================================
export interface AccountStatement {
  providerId: string;
  providerName: string;
  period: {
    from: string;
    to: string;
  };
  
  // Saldos
  openingBalance: number; // Saldo inicial
  totalOrders: number; // Total de órdenes
  totalPayments: number; // Total de pagos
  currentBalance: number; // Saldo actual (órdenes - pagos)
  
  // Detalles
  orders: {
    id: string;
    orderNumber: string;
    date: string;
    amount: number;
    status: string;
  }[];
  
  payments: {
    id: string;
    paymentNumber: string;
    date: string;
    amount: number;
    method: string;
  }[];
  
  // Estadísticas
  totalPurchaseOrders: number;
  completedOrders: number;
  pendingOrders: number;
  overduePayments: number;
}

// ============================================
// STATISTICS
// ============================================
export interface ProviderStatistics {
  providerId: string;
  totalSpent: number;
  totalOrders: number;
  totalPayments: number;
  currentBalance: number;
  averageOrderValue: number;
  averageDeliveryTime: number; // días
  onTimeDeliveryRate: number; // porcentaje
  activeContracts: number;
}

// ============================================
// DOCUMENT
// ============================================
export interface ProviderDocument {
  id: string;
  providerId: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'certificate' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  notes?: string;
}

// ============================================
// PROVIDER RATING
// ============================================
export interface ProviderRating {
  overall: number;
  quality: number;
  delivery: number;
  price: number;
  communication: number;
  totalReviews: number;
}
