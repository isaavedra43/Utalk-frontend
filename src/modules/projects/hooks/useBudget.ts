// Hook de gestión de presupuesto

import { useState, useCallback, useMemo } from 'react';
import { budgetService } from '../services/budgetService';
import type { 
  ProjectBudget,
  Expense,
  BudgetCategory,
  BudgetForecast,
  FinancialSummary 
} from '../types';

export const useBudget = (projectId: string) => {
  const [budget, setBudget] = useState<ProjectBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar presupuesto
  const loadBudget = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedBudget = await budgetService.getBudget(projectId);
      setBudget(fetchedBudget);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar presupuesto';
      setError(errorMessage);
      console.error('Error loading budget:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Cargar gastos
  const loadExpenses = useCallback(async (options?: {
    category?: string;
    status?: string[];
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedExpenses = await budgetService.getExpenses(projectId, options);
      setExpenses(fetchedExpenses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar gastos';
      setError(errorMessage);
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Crear gasto
  const createExpense = useCallback(async (expenseData: Partial<Expense>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newExpense = await budgetService.createExpense(projectId, expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      
      // Recargar presupuesto para actualizar totales
      await loadBudget();
      
      return newExpense;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear gasto';
      setError(errorMessage);
      console.error('Error creating expense:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, loadBudget]);

  // Aprobar gasto
  const approveExpense = useCallback(async (
    expenseId: string,
    comments?: string
  ) => {
    try {
      const approved = await budgetService.approveExpense(projectId, expenseId, comments);
      
      setExpenses(prev => prev.map(e => e.id === expenseId ? approved : e));
      
      return approved;
    } catch (err) {
      console.error('Error approving expense:', err);
      throw err;
    }
  }, [projectId]);

  // Obtener forecast
  const getForecast = useCallback(async (options?: {
    includeRisks?: boolean;
    includeContingency?: boolean;
  }) => {
    try {
      const forecast = await budgetService.getForecast(projectId, options);
      return forecast;
    } catch (err) {
      console.error('Error fetching forecast:', err);
      throw err;
    }
  }, [projectId]);

  // Resumen financiero
  const budgetSummary = useMemo(() => {
    if (!budget) return null;

    const totalSpent = expenses
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalPending = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      total: budget.total,
      spent: totalSpent,
      committed: totalPending,
      remaining: budget.total - totalSpent - totalPending,
      percentageSpent: (totalSpent / budget.total) * 100,
      percentageCommitted: ((totalSpent + totalPending) / budget.total) * 100,
      isOverBudget: (totalSpent + totalPending) > budget.total,
    };
  }, [budget, expenses]);

  return {
    // Estado
    budget,
    expenses,
    loading,
    error,
    budgetSummary,
    
    // Acciones
    loadBudget,
    loadExpenses,
    createExpense,
    approveExpense,
    getForecast,
  };
};

