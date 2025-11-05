// Servicio de presupuesto y control financiero

import api from '../../../services/api';
import type { 
  ProjectBudget,
  BudgetCategory,
  Expense,
  Invoice,
  BudgetForecast,
  BudgetVariance,
  CashFlowProjection,
  FinancialSummary,
  ApiResponse 
} from '../types';

class BudgetService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener presupuesto del proyecto
   * Endpoint: GET /api/projects/:id/budget
   */
  async getBudget(projectId: string): Promise<ProjectBudget> {
    try {
      const response = await api.get<ApiResponse<ProjectBudget>>(
        `${this.BASE_PATH}/${projectId}/budget`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  }

  /**
   * Actualizar presupuesto
   * Endpoint: PUT /api/projects/:id/budget
   */
  async updateBudget(
    projectId: string,
    budget: Partial<ProjectBudget>
  ): Promise<ProjectBudget> {
    try {
      const response = await api.put<ApiResponse<ProjectBudget>>(
        `${this.BASE_PATH}/${projectId}/budget`,
        budget
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  /**
   * Crear categoría de presupuesto
   * Endpoint: POST /api/projects/:id/budget/categories
   */
  async createCategory(
    projectId: string,
    category: Partial<BudgetCategory>
  ): Promise<BudgetCategory> {
    try {
      const response = await api.post<ApiResponse<BudgetCategory>>(
        `${this.BASE_PATH}/${projectId}/budget/categories`,
        category
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating budget category:', error);
      throw error;
    }
  }

  /**
   * Actualizar categoría de presupuesto
   * Endpoint: PUT /api/projects/:id/budget/categories/:categoryId
   */
  async updateCategory(
    projectId: string,
    categoryId: string,
    updates: Partial<BudgetCategory>
  ): Promise<BudgetCategory> {
    try {
      const response = await api.put<ApiResponse<BudgetCategory>>(
        `${this.BASE_PATH}/${projectId}/budget/categories/${categoryId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating budget category:', error);
      throw error;
    }
  }

  /**
   * Registrar gasto
   * Endpoint: POST /api/projects/:id/expenses
   */
  async createExpense(
    projectId: string,
    expense: Partial<Expense>
  ): Promise<Expense> {
    try {
      const response = await api.post<ApiResponse<Expense>>(
        `${this.BASE_PATH}/${projectId}/expenses`,
        expense
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos del proyecto
   * Endpoint: GET /api/projects/:id/expenses
   */
  async getExpenses(
    projectId: string,
    options?: {
      category?: string;
      status?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      minAmount?: number;
      maxAmount?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<Expense[]> {
    try {
      const response = await api.get<ApiResponse<Expense[]>>(
        `${this.BASE_PATH}/${projectId}/expenses`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  /**
   * Actualizar gasto
   * Endpoint: PUT /api/projects/:id/expenses/:expenseId
   */
  async updateExpense(
    projectId: string,
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<Expense> {
    try {
      const response = await api.put<ApiResponse<Expense>>(
        `${this.BASE_PATH}/${projectId}/expenses/${expenseId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  /**
   * Eliminar gasto
   * Endpoint: DELETE /api/projects/:id/expenses/:expenseId
   */
  async deleteExpense(projectId: string, expenseId: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${projectId}/expenses/${expenseId}`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  /**
   * Aprobar gasto
   * Endpoint: POST /api/projects/:id/expenses/:expenseId/approve
   */
  async approveExpense(
    projectId: string,
    expenseId: string,
    comments?: string
  ): Promise<Expense> {
    try {
      const response = await api.post<ApiResponse<Expense>>(
        `${this.BASE_PATH}/${projectId}/expenses/${expenseId}/approve`,
        { comments }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  }

  /**
   * Rechazar gasto
   * Endpoint: POST /api/projects/:id/expenses/:expenseId/reject
   */
  async rejectExpense(
    projectId: string,
    expenseId: string,
    reason: string
  ): Promise<Expense> {
    try {
      const response = await api.post<ApiResponse<Expense>>(
        `${this.BASE_PATH}/${projectId}/expenses/${expenseId}/reject`,
        { reason }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  }

  /**
   * Obtener proyección financiera
   * Endpoint: POST /api/projects/:id/budget/forecast
   */
  async getForecast(
    projectId: string,
    options?: {
      includeRisks?: boolean;
      includeContingency?: boolean;
      horizon?: number; // Días a proyectar
    }
  ): Promise<BudgetForecast> {
    try {
      const response = await api.post<ApiResponse<BudgetForecast>>(
        `${this.BASE_PATH}/${projectId}/budget/forecast`,
        options
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget forecast:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de varianza
   * Endpoint: GET /api/projects/:id/budget/variance
   */
  async getVariance(projectId: string): Promise<BudgetVariance> {
    try {
      const response = await api.get<ApiResponse<BudgetVariance>>(
        `${this.BASE_PATH}/${projectId}/budget/variance`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget variance:', error);
      throw error;
    }
  }

  /**
   * Obtener proyección de flujo de caja
   * Endpoint: GET /api/projects/:id/cashflow
   */
  async getCashFlow(
    projectId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      interval?: 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<CashFlowProjection[]> {
    try {
      const response = await api.get<ApiResponse<CashFlowProjection[]>>(
        `${this.BASE_PATH}/${projectId}/cashflow`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      throw error;
    }
  }

  /**
   * Crear factura
   * Endpoint: POST /api/projects/:id/invoices
   */
  async createInvoice(
    projectId: string,
    invoice: Partial<Invoice>
  ): Promise<Invoice> {
    try {
      const response = await api.post<ApiResponse<Invoice>>(
        `${this.BASE_PATH}/${projectId}/invoices`,
        invoice
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Obtener facturas del proyecto
   * Endpoint: GET /api/projects/:id/invoices
   */
  async getInvoices(
    projectId: string,
    options?: {
      status?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Invoice[]> {
    try {
      const response = await api.get<ApiResponse<Invoice[]>>(
        `${this.BASE_PATH}/${projectId}/invoices`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen financiero
   * Endpoint: GET /api/projects/:id/financial-summary
   */
  async getFinancialSummary(projectId: string): Promise<FinancialSummary> {
    try {
      const response = await api.get<ApiResponse<FinancialSummary>>(
        `${this.BASE_PATH}/${projectId}/financial-summary`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();
export default budgetService;

