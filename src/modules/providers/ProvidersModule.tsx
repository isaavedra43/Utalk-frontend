import React, { useState } from 'react';
import { Building2, Menu, AlertCircle } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { useProviders } from './hooks/useProviders';
import { ProvidersTable } from './components/ProvidersTable';
import { ProvidersStats } from './components/ProvidersStats';
import { ProviderDetailView } from './components/ProviderDetailView';
import { exportProvidersToCSV } from './utils/exportUtils';
import type { Provider, ProviderMaterial, PurchaseOrder, Payment, ProviderActivity, ProviderDocument, ProviderRating } from './types';

const ProvidersModule: React.FC = () => {
  const { openMenu } = useMobileMenuContext();
  const { providers, loading, error, createProvider, updateProvider, deleteProvider } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Mock data for demo - En producción esto vendría del backend
  const [providerMaterials, setProviderMaterials] = useState<Record<string, ProviderMaterial[]>>({});
  const [providerOrders, setProviderOrders] = useState<Record<string, PurchaseOrder[]>>({});
  const [providerPayments, setProviderPayments] = useState<Record<string, Payment[]>>({});
  const [providerActivities, setProviderActivities] = useState<Record<string, ProviderActivity[]>>({});
  const [providerDocuments, setProviderDocuments] = useState<Record<string, ProviderDocument[]>>({});
  const [providerRatings, setProviderRatings] = useState<Record<string, ProviderRating>>({});

  const handleExport = () => {
    exportProvidersToCSV(providers);
  };

  const handleCreate = async (provider: Omit<Provider, 'id'>) => {
    await createProvider(provider);
  };

  const handleUpdate = async (id: string, updates: Partial<Provider>) => {
    await updateProvider(id, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteProvider(id);
  };

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  // Material handlers
  const handleAddMaterial = async (material: Omit<ProviderMaterial, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    const newMaterial: ProviderMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProviderMaterials(prev => ({
      ...prev,
      [selectedProvider.id]: [...(prev[selectedProvider.id] || []), newMaterial]
    }));

    // Log activity
    const activity: ProviderActivity = {
      id: `act-${Date.now()}`,
      providerId: selectedProvider.id,
      type: 'material_added',
      description: `Material "${newMaterial.name}" agregado`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
    };
    
    setProviderActivities(prev => ({
      ...prev,
      [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
    }));
  };

  const handleUpdateMaterial = async (id: string, updates: Partial<ProviderMaterial>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    setProviderMaterials(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).map(m =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    }));

    // Log activity
    const activity: ProviderActivity = {
      id: `act-${Date.now()}`,
      providerId: selectedProvider.id,
      type: 'material_updated',
      description: `Material actualizado`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
    };
    
    setProviderActivities(prev => ({
      ...prev,
      [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
    }));
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    const material = providerMaterials[selectedProvider.id]?.find(m => m.id === id);
    
    setProviderMaterials(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(m => m.id !== id)
    }));

    // Log activity
    if (material) {
      const activity: ProviderActivity = {
        id: `act-${Date.now()}`,
        providerId: selectedProvider.id,
        type: 'material_deleted',
        description: `Material "${material.name}" eliminado`,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user-id',
        createdByName: 'Usuario Actual',
      };
      
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
      }));
    }
  };

  // Purchase Order handlers
  const handleCreateOrder = async (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    const orderNumber = `OC-${String(Date.now()).slice(-6)}`;
    const newOrder: PurchaseOrder = {
      ...order,
      id: `order-${Date.now()}`,
      orderNumber,
      providerName: selectedProvider.name,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
    };
    
    setProviderOrders(prev => ({
      ...prev,
      [selectedProvider.id]: [newOrder, ...(prev[selectedProvider.id] || [])]
    }));

    // Log activity
    const activity: ProviderActivity = {
      id: `act-${Date.now()}`,
      providerId: selectedProvider.id,
      type: 'order_created',
      description: `Orden de compra #${orderNumber} creada por ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(newOrder.total)}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
      entityType: 'order',
      entityId: newOrder.id,
    };
    
    setProviderActivities(prev => ({
      ...prev,
      [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
    }));
  };

  const handleUpdateOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    const currentOrder = providerOrders[selectedProvider.id]?.find(o => o.id === id);
    
    setProviderOrders(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).map(o =>
        o.id === id ? { ...o, ...updates } : o
      )
    }));

    // Log activity based on status change
    if (updates.status && currentOrder && updates.status !== currentOrder.status) {
      let activityType: ProviderActivity['type'] = 'order_updated';
      let description = 'Orden actualizada';

      if (updates.status === 'accepted') {
        activityType = 'order_accepted';
        description = `Orden #${currentOrder.orderNumber} aceptada`;
      } else if (updates.status === 'rejected') {
        activityType = 'order_rejected';
        description = `Orden #${currentOrder.orderNumber} rechazada`;
      } else if (updates.status === 'delivered') {
        activityType = 'order_delivered';
        description = `Orden #${currentOrder.orderNumber} entregada`;
      }

      const activity: ProviderActivity = {
        id: `act-${Date.now()}`,
        providerId: selectedProvider.id,
        type: activityType,
        description,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user-id',
        createdByName: 'Usuario Actual',
        entityType: 'order',
        entityId: id,
      };
      
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
      }));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    setProviderOrders(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(o => o.id !== id)
    }));
  };

  // Payment handlers
  const handleCreatePayment = async (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    const paymentNumber = `PAG-${String(Date.now()).slice(-6)}`;
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
      paymentNumber,
      providerName: selectedProvider.name,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
    };
    
    setProviderPayments(prev => ({
      ...prev,
      [selectedProvider.id]: [newPayment, ...(prev[selectedProvider.id] || [])]
    }));

    // Log activity
    const activity: ProviderActivity = {
      id: `act-${Date.now()}`,
      providerId: selectedProvider.id,
      type: 'payment_created',
      description: `Pago #${paymentNumber} registrado por ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(newPayment.amount)}`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
      entityType: 'payment',
      entityId: newPayment.id,
    };
    
    setProviderActivities(prev => ({
      ...prev,
      [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
    }));
  };

  const handleUpdatePayment = async (id: string, updates: Partial<Payment>) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    setProviderPayments(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }));

    // Log activity if completed
    if (updates.status === 'completed') {
      const activity: ProviderActivity = {
        id: `act-${Date.now()}`,
        providerId: selectedProvider.id,
        type: 'payment_completed',
        description: `Pago completado`,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user-id',
        createdByName: 'Usuario Actual',
        entityType: 'payment',
        entityId: id,
      };
      
      setProviderActivities(prev => ({
        ...prev,
        [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
      }));
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!selectedProvider) return;
    
    // TODO: Call backend API
    setProviderPayments(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(p => p.id !== id)
    }));
  };

  // Document handlers
  const handleUploadDocument = async (document: Omit<ProviderDocument, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => {
    if (!selectedProvider) return;
    
    const newDocument: ProviderDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user-id',
      uploadedByName: 'Usuario Actual',
    };
    
    setProviderDocuments(prev => ({
      ...prev,
      [selectedProvider.id]: [...(prev[selectedProvider.id] || []), newDocument]
    }));

    const activity: ProviderActivity = {
      id: `act-${Date.now()}`,
      providerId: selectedProvider.id,
      type: 'document_uploaded',
      description: `Documento "${newDocument.name}" subido`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id',
      createdByName: 'Usuario Actual',
    };
    
    setProviderActivities(prev => ({
      ...prev,
      [selectedProvider.id]: [activity, ...(prev[selectedProvider.id] || [])]
    }));
  };

  const handleDeleteDocument = async (id: string) => {
    if (!selectedProvider) return;
    
    setProviderDocuments(prev => ({
      ...prev,
      [selectedProvider.id]: (prev[selectedProvider.id] || []).filter(d => d.id !== id)
    }));
  };

  // Rating handler
  const handleUpdateRating = async (rating: Omit<ProviderRating, 'totalReviews'>) => {
    if (!selectedProvider) return;
    
    const currentRating = providerRatings[selectedProvider.id];
    const totalReviews = (currentRating?.totalReviews || 0) + 1;
    
    setProviderRatings(prev => ({
      ...prev,
      [selectedProvider.id]: {
        ...rating,
        totalReviews,
      }
    }));
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

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

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
