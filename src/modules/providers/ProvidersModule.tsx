import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Menu, AlertCircle } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { useProviders } from './hooks/useProviders';
import { useErrorHandler } from './hooks/useErrorHandler';
import { ProvidersService } from './services/providersService';
import { ProvidersTable } from './components/ProvidersTable';
import { ProvidersStats } from './components/ProvidersStats';
import { ProviderDetailView } from './components/ProviderDetailView';
import { ErrorToast } from './components/ErrorToast';
import { exportProvidersToCSV } from './utils/exportUtils';
import type { Provider, ProviderMaterial, PurchaseOrder, Payment, ProviderActivity, ProviderDocument, ProviderRating } from './types';

const ProvidersModule: React.FC = () => {
  const { openMenu } = useMobileMenuContext();
  const { providers, loading, error, createProvider, updateProvider, deleteProvider } = useProviders();
  const { error: operationError, handleError, clearError } = useErrorHandler();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loadingProviderData, setLoadingProviderData] = useState(false);
  const [savingOperations, setSavingOperations] = useState<Record<string, boolean>>({});

  // Datos del proveedor seleccionado
  const [providerMaterials, setProviderMaterials] = useState<Record<string, ProviderMaterial[]>>({});
  const [providerOrders, setProviderOrders] = useState<Record<string, PurchaseOrder[]>>({});
  const [providerPayments, setProviderPayments] = useState<Record<string, Payment[]>>({});
  const [providerActivities, setProviderActivities] = useState<Record<string, ProviderActivity[]>>({});
  const [providerDocuments, setProviderDocuments] = useState<Record<string, ProviderDocument[]>>({});
  const [providerRatings, setProviderRatings] = useState<Record<string, ProviderRating>>({});

  // Cargar todos los datos del proveedor cuando se selecciona
  const loadProviderData = useCallback(async (providerId: string) => {
    setLoadingProviderData(true);
    try {
      // Cargar en paralelo todos los datos
      const [materials, orders, payments, activitiesData, documents, rating] = await Promise.all([
        ProvidersService.getProviderMaterials(providerId).catch(() => []),
        ProvidersService.getPurchaseOrders(providerId).catch(() => []),
        ProvidersService.getPayments(providerId).catch(() => []),
        ProvidersService.getActivities(providerId).catch(() => ({ activities: [], total: 0 })),
        ProvidersService.getDocuments(providerId).catch(() => []),
        ProvidersService.getRating(providerId).catch(() => null),
      ]);

      setProviderMaterials(prev => ({ ...prev, [providerId]: materials }));
      setProviderOrders(prev => ({ ...prev, [providerId]: orders }));
      setProviderPayments(prev => ({ ...prev, [providerId]: payments }));
      setProviderActivities(prev => ({ ...prev, [providerId]: activitiesData.activities || [] }));
      setProviderDocuments(prev => ({ ...prev, [providerId]: documents }));
      if (rating) {
        setProviderRatings(prev => ({ ...prev, [providerId]: rating }));
      }
    } catch (err) {
      console.error('Error loading provider data:', err);
    } finally {
      setLoadingProviderData(false);
    }
  }, []);

  // Cargar datos cuando se selecciona un proveedor
  useEffect(() => {
    if (selectedProvider) {
      loadProviderData(selectedProvider.id);
    }
  }, [selectedProvider, loadProviderData]);

  const handleExport = () => {
    exportProvidersToCSV(providers);
  };

  const handleCreate = async (provider: Omit<Provider, 'id'>) => {
    await createProvider(provider);
  };

  const handleUpdate = async (id: string, updates: Partial<Provider>) => {
    await updateProvider(id, updates);
    // Si es el proveedor seleccionado, recargar datos
    if (selectedProvider && selectedProvider.id === id) {
      await loadProviderData(id);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProvider(id);
    if (selectedProvider && selectedProvider.id === id) {
      setSelectedProvider(null);
    }
  };

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  // Material handlers con actualización optimista
  const handleAddMaterial = async (material: Omit<ProviderMaterial, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProvider) return;
    
    const operationId = `material-${Date.now()}`;
    setSavingOperations(prev => ({ ...prev, [operationId]: true }));
    
    try {
      // Optimistic update
      const tempMaterial: ProviderMaterial = {
        ...material,
        id: `temp-${Date.now()}`,
        providerId: selectedProvider.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setProviderMaterials(prev => ({
        ...prev,
        [selectedProvider.id]: [tempMaterial, ...(prev[selectedProvider.id] || [])]
      }));

      // Real update
      const newMaterial = await ProvidersService.createMaterial(selectedProvider.id, material);
      
      // Replace temp with real
      setProviderMaterials(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).map(m => 
          m.id === tempMaterial.id ? newMaterial : m
        )
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      // Rollback on error
      setProviderMaterials(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(m => !m.id.startsWith('temp-'))
      }));
      handleError(err, 'Error al crear el material');
      throw err;
    } finally {
      setSavingOperations(prev => {
        const next = { ...prev };
        delete next[operationId];
        return next;
      });
    }
  };

  const handleUpdateMaterial = async (id: string, updates: Partial<ProviderMaterial>) => {
    if (!selectedProvider) return;
    
    try {
      const updatedMaterial = await ProvidersService.updateMaterial(selectedProvider.id, id, updates);
      setProviderMaterials(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).map(m =>
          m.id === id ? updatedMaterial : m
        )
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error updating material:', err);
      throw err;
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!selectedProvider) return;
    
    try {
      await ProvidersService.deleteMaterial(selectedProvider.id, id);
      setProviderMaterials(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(m => m.id !== id)
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error deleting material:', err);
      throw err;
    }
  };

  // Purchase Order handlers
  const handleCreateOrder = async (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'createdBy' | 'createdByName' | 'providerName'>) => {
    if (!selectedProvider) return;
    
    try {
      const newOrder = await ProvidersService.createPurchaseOrder(selectedProvider.id, order);
      setProviderOrders(prev => ({
        ...prev,
        [selectedProvider.id]: [newOrder, ...(prev[selectedProvider.id] || [])]
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error creating purchase order:', err);
      throw err;
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    if (!selectedProvider) return;
    
    try {
      let updatedOrder: PurchaseOrder;
      
      // Si solo cambia el estado, usar el endpoint específico de cambio de estado
      if (updates.status && Object.keys(updates).length === 1 || 
          (updates.status && Object.keys(updates).filter(k => k !== 'status').length === 0)) {
        updatedOrder = await ProvidersService.updatePurchaseOrderStatus(
          selectedProvider.id,
          id,
          updates.status,
          {
            acceptedDeliveryDate: updates.acceptedDeliveryDate,
            reason: updates.rejectionReason || updates.cancellationReason
          }
        );
      } else {
        // Para otros cambios, usar el endpoint de actualización general
        updatedOrder = await ProvidersService.updatePurchaseOrder(selectedProvider.id, id, updates);
      }
      
      setProviderOrders(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).map(o =>
          o.id === id ? updatedOrder : o
        )
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error updating purchase order:', err);
      throw err;
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!selectedProvider) return;
    
    try {
      await ProvidersService.deletePurchaseOrder(selectedProvider.id, id);
      setProviderOrders(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(o => o.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting purchase order:', err);
      throw err;
    }
  };

  // Payment handlers
  const handleCreatePayment = async (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'createdBy' | 'createdByName' | 'providerName'>) => {
    if (!selectedProvider) return;
    
    try {
      const newPayment = await ProvidersService.createPayment(selectedProvider.id, payment);
      setProviderPayments(prev => ({
        ...prev,
        [selectedProvider.id]: [newPayment, ...(prev[selectedProvider.id] || [])]
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  };

  const handleUpdatePayment = async (id: string, updates: Partial<Payment>) => {
    if (!selectedProvider) return;
    
    try {
      const updatedPayment = await ProvidersService.updatePayment(selectedProvider.id, id, updates);
      setProviderPayments(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).map(p =>
          p.id === id ? updatedPayment : p
        )
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error updating payment:', err);
      throw err;
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!selectedProvider) return;
    
    try {
      await ProvidersService.deletePayment(selectedProvider.id, id);
      setProviderPayments(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(p => p.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  // Document handlers
  const handleUploadDocument = async (document: Omit<ProviderDocument, 'id' | 'providerId' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => {
    if (!selectedProvider) return;
    
    try {
      const newDocument = await ProvidersService.createDocument(selectedProvider.id, document);
      setProviderDocuments(prev => ({
        ...prev,
        [selectedProvider.id]: [...(prev[selectedProvider.id] || []), newDocument]
      }));
      
      // Recargar actividades
      const activitiesData = await ProvidersService.getActivities(selectedProvider.id);
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: activitiesData.activities || []
      }));
    } catch (err) {
      console.error('Error uploading document:', err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!selectedProvider) return;
    
    try {
      await ProvidersService.deleteDocument(selectedProvider.id, id);
      setProviderDocuments(prev => ({
        ...prev,
        [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(d => d.id !== id)
      }));
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  // Rating handler
  const handleUpdateRating = async (rating: { overall: number; quality: number; delivery: number; price: number; communication: number; comments?: string }) => {
    if (!selectedProvider) return;
    
    try {
      // El backend espera un formato diferente, necesitamos adaptar
      const updatedRating = await ProvidersService.updateRating(selectedProvider.id, {
        rating: rating.overall,
        comments: rating.comments
      });
      
      // El backend puede retornar el rating completo o necesitamos calcularlo
      // Por ahora actualizamos con lo que recibimos del usuario
      setProviderRatings(prev => ({
        ...prev,
        [selectedProvider.id]: {
          ...rating,
          totalReviews: (prev[selectedProvider.id]?.totalReviews || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error updating rating:', err);
      throw err;
    }
  };

  // Si hay un proveedor seleccionado, mostrar la vista de detalle
  if (selectedProvider) {
    return (
      <ProviderDetailView
        provider={selectedProvider}
        materials={providerMaterials[selectedProvider.id] || []}
        purchaseOrders={providerOrders[selectedProvider.id] || []}
        payments={providerPayments[selectedProvider.id] || []}
        activities={providerActivities[selectedProvider.id] || []}
        documents={providerDocuments[selectedProvider.id] || []}
        rating={providerRatings[selectedProvider.id]}
        onClose={() => setSelectedProvider(null)}
        onEdit={() => {
          // Open edit modal for the provider
          setSelectedProvider(null);
          // TODO: Trigger edit in ProvidersTable
        }}
        onAddMaterial={handleAddMaterial}
        onUpdateMaterial={handleUpdateMaterial}
        onDeleteMaterial={handleDeleteMaterial}
        onCreateOrder={handleCreateOrder}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        onCreatePayment={handleCreatePayment}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onUpdateRating={handleUpdateRating}
        loading={loadingProviderData || Object.keys(savingOperations).length > 0}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil con menú */}
      <div className="absolute top-0 left-0 right-0 z-10 lg:hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={openMenu}
                className="flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                title="Abrir menú de módulos"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Proveedores</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
              <p className="text-gray-600 mt-1">
                Administra y gestiona todos tus proveedores de manera eficiente
              </p>
            </div>
          </div>
        </div>

        {/* Error messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {/* Global error toast */}
        <ErrorToast error={operationError} onClose={clearError} />

        {/* Estadísticas */}
        <div className="mb-6">
          <ProvidersStats providers={providers} />
        </div>

        {/* Tabla de proveedores */}
        <ProvidersTable
          providers={providers}
          loading={loading}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onExport={handleExport}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
};

export default ProvidersModule;
