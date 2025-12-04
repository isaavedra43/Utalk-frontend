// Hook de gestión de materiales

import { useState, useCallback, useMemo } from 'react';
import { materialsService } from '../services/materialsService';
import type { 
  ProjectMaterial, 
  MaterialRequest, 
  PurchaseOrder,
  Delivery,
  MaterialsSummary 
} from '../types';

export const useMaterials = (projectId: string) => {
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar materiales
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedMaterials = await materialsService.getMaterials(projectId);
      setMaterials(fetchedMaterials);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar materiales';
      setError(errorMessage);
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Agregar material
  const addMaterial = useCallback(async (materialData: Partial<ProjectMaterial>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newMaterial = await materialsService.addMaterial(projectId, materialData);
      setMaterials(prev => [...prev, newMaterial]);
      
      return newMaterial;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar material';
      setError(errorMessage);
      console.error('Error adding material:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar material
  const updateMaterial = useCallback(async (
    materialId: string,
    updates: Partial<ProjectMaterial>
  ) => {
    try {
      const updated = await materialsService.updateMaterial(projectId, materialId, updates);
      
      setMaterials(prev => prev.map(m => m.id === materialId ? updated : m));
      
      return updated;
    } catch (err) {
      console.error('Error updating material:', err);
      throw err;
    }
  }, [projectId]);

  // Crear solicitud de material
  const createMaterialRequest = useCallback(async (requestData: Partial<MaterialRequest>) => {
    try {
      const newRequest = await materialsService.createMaterialRequest(projectId, requestData);
      setRequests(prev => [newRequest, ...prev]);
      
      return newRequest;
    } catch (err) {
      console.error('Error creating material request:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar solicitudes
  const loadRequests = useCallback(async () => {
    try {
      const fetchedRequests = await materialsService.getMaterialRequests(projectId);
      setRequests(fetchedRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
      throw err;
    }
  }, [projectId]);

  // Aprobar solicitud
  const approveRequest = useCallback(async (
    requestId: string,
    approvedCost?: number
  ) => {
    try {
      const approved = await materialsService.approveMaterialRequest(projectId, requestId, approvedCost);
      
      setRequests(prev => prev.map(r => r.id === requestId ? approved : r));
      
      return approved;
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  }, [projectId]);

  // Crear orden de compra
  const createPurchaseOrder = useCallback(async (poData: Partial<PurchaseOrder>) => {
    try {
      const newPO = await materialsService.createPurchaseOrder(projectId, poData);
      setPurchaseOrders(prev => [newPO, ...prev]);
      
      return newPO;
    } catch (err) {
      console.error('Error creating purchase order:', err);
      throw err;
    }
  }, [projectId]);

  // Registrar recepción de entrega
  const receiveDelivery = useCallback(async (
    deliveryId: string,
    receiptData: any
  ) => {
    try {
      const received = await materialsService.receiveDelivery(projectId, deliveryId, receiptData);
      
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? received : d));
      
      // Recargar materiales para actualizar cantidades
      await loadMaterials();
      
      return received;
    } catch (err) {
      console.error('Error receiving delivery:', err);
      throw err;
    }
  }, [projectId, loadMaterials]);

  // Estadísticas de materiales
  const materialsStats = useMemo(() => {
    const totalBudgeted = materials.reduce((sum, m) => sum + m.budgetedCost, 0);
    const totalSpent = materials.reduce((sum, m) => sum + m.actualCost, 0);
    const totalPlanned = materials.reduce((sum, m) => sum + m.quantityPlanned, 0);
    const totalUsed = materials.reduce((sum, m) => sum + m.quantityUsed, 0);

    return {
      totalMaterials: materials.length,
      totalBudgeted,
      totalSpent,
      variance: totalSpent - totalBudgeted,
      variancePercentage: totalBudgeted > 0 ? ((totalSpent - totalBudgeted) / totalBudgeted) * 100 : 0,
      utilizationPercentage: totalPlanned > 0 ? (totalUsed / totalPlanned) * 100 : 0,
      lowStockItems: materials.filter(m => 
        m.quantityRemaining < m.minStock && m.status !== 'depleted'
      ).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      pendingOrders: purchaseOrders.filter(po => 
        po.status === 'sent' || po.status === 'confirmed'
      ).length,
    };
  }, [materials, requests, purchaseOrders]);

  return {
    // Estado
    materials,
    requests,
    purchaseOrders,
    deliveries,
    loading,
    error,
    materialsStats,
    
    // Acciones
    loadMaterials,
    addMaterial,
    updateMaterial,
    createMaterialRequest,
    loadRequests,
    approveRequest,
    createPurchaseOrder,
    receiveDelivery,
  };
};

