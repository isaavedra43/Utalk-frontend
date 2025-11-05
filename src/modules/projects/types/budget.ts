// Presupuesto y control financiero

export interface ProjectBudget {
  id: string;
  projectId: string;
  
  // Presupuesto general
  total: number;
  currency: string;
  
  // Presupuesto por categoría
  categories: BudgetCategory[];
  
  // Presupuesto por fase
  phases: PhaseBudget[];
  
  // Presupuesto por recurso
  resources: ResourceBudget[];
  
  // Control de cambios
  changeOrders: ChangeOrder[];
  
  // Análisis
  forecast: BudgetForecast;
  variance: BudgetVariance;
  
  // Flujo de caja
  cashFlow: CashFlowProjection[];
  
  // Alertas
  alerts: BudgetAlert[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
  reviewedBy?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  
  // Montos
  budgeted: number;
  spent: number;
  committed: number; // Comprometido pero no gastado
  remaining: number;
  forecast: number;
  
  // Subcategorías
  parentId?: string;
  subcategories: BudgetCategory[];
  level: number;
  
  // Alertas
  alertThreshold?: number; // % para alertar
  alertAt?: number; // Monto para alertar
  
  // Metadata
  color?: string;
  icon?: string;
  order: number;
}

export interface PhaseBudget {
  phaseId: string;
  phaseName: string;
  budgeted: number;
  spent: number;
  committed: number;
  remaining: number;
  forecast: number;
}

export interface ResourceBudget {
  resourceType: 'labor' | 'material' | 'equipment' | 'service' | 'other';
  resourceId?: string;
  resourceName: string;
  budgeted: number;
  spent: number;
  committed: number;
  remaining: number;
}

export interface ChangeOrder {
  id: string;
  code: string; // CO-001
  title: string;
  description: string;
  
  // Impacto
  budgetImpact: number;
  scheduleImpact: number; // Días
  
  // Estado
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'implemented';
  requestedBy: string;
  requestedAt: Date;
  
  // Aprobación
  approvals: Approval[];
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Implementación
  implementedAt?: Date;
  implementedBy?: string;
  
  // Justificación
  justification: string;
  attachments: string[];
  
  // Categorías afectadas
  affectedCategories: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  id: string;
  approver: string;
  approverName: string;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  comments?: string;
  order: number;
}

export interface BudgetForecast {
  estimatedTotal: number;
  estimatedOverrun: number;
  estimatedOverrunPercentage: number;
  confidence: number; // 0-100
  forecastDate: Date;
  reasoning: string[];
  assumptions: string[];
  risks: string[];
}

export interface BudgetVariance {
  total: number;
  percentage: number;
  
  byCategory: {
    categoryId: string;
    categoryName: string;
    variance: number;
    percentage: number;
  }[];
  
  byPhase: {
    phaseId: string;
    phaseName: string;
    variance: number;
    percentage: number;
  }[];
  
  byResourceType: {
    resourceType: string;
    variance: number;
    percentage: number;
  }[];
  
  lastCalculated: Date;
}

export interface CashFlowProjection {
  date: Date;
  inflow: number;
  outflow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  projectedBalance: number;
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  categoryId?: string;
  phaseId?: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// Gestión de gastos
export interface Expense {
  id: string;
  projectId: string;
  code?: string; // EXP-001
  
  // Básico
  date: Date;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  type: 'material' | 'labor' | 'equipment' | 'service' | 'other';
  
  // Relaciones
  providerId?: string; // Del módulo de proveedores
  providerName?: string;
  employeeId?: string; // Del módulo HR
  employeeName?: string;
  taskId?: string;
  phaseId?: string;
  
  // Aprobaciones
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  
  // Pago
  paymentMethod?: 'cash' | 'check' | 'transfer' | 'card' | 'other';
  paymentReference?: string;
  paidAt?: Date;
  paidBy?: string;
  
  // Documentos
  receipts: ExpenseAttachment[];
  invoices: ExpenseAttachment[];
  
  // Control
  budgetCategoryId: string;
  impactOnBudget: number;
  
  // Recurrente
  isRecurring: boolean;
  recurringSchedule?: RecurringSchedule;
  parentExpenseId?: string; // Si es parte de una serie recurrente
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  notes?: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // Cada cuántos períodos
  startDate: Date;
  endDate?: Date;
  occurrences?: number; // Número de veces
  dayOfWeek?: number; // Para weekly
  dayOfMonth?: number; // Para monthly
  monthOfYear?: number; // Para yearly
}

// Facturación
export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  
  // Cliente
  clientId?: string;
  clientName: string;
  clientAddress: string;
  clientTaxId?: string;
  
  // Fechas
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  
  // Montos
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  
  // Items
  items: InvoiceItem[];
  
  // Estado
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  
  // Facturación
  billingType: 'milestone' | 'time_and_materials' | 'fixed_price' | 'recurring';
  milestoneId?: string;
  
  // Pagos
  payments: InvoicePayment[];
  
  // Documentos
  pdfUrl?: string;
  attachments: string[];
  
  // Notas
  notes?: string;
  terms?: string;
  footer?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sentAt?: Date;
  sentTo?: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taskId?: string;
  phaseId?: string;
  tax?: number;
  discount?: number;
}

export interface InvoicePayment {
  id: string;
  date: Date;
  amount: number;
  method: 'cash' | 'check' | 'transfer' | 'card' | 'other';
  reference?: string;
  notes?: string;
  receivedBy: string;
}

// Reportes financieros
export interface FinancialSummary {
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  percentageSpent: number;
  percentageCommitted: number;
  
  totalInvoiced: number;
  totalReceived: number;
  totalOutstanding: number;
  
  profitMargin: number;
  roi: number;
  
  cashPosition: number;
  
  lastCalculated: Date;
}

