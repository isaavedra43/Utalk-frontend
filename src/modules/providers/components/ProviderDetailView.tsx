import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Globe, CreditCard, Calendar, Edit3, ArrowLeft, FileText } from 'lucide-react';
import type { Provider, ProviderMaterial, PurchaseOrder, Payment, ProviderActivity, ProviderDocument, ProviderRating } from '../types';
import { MaterialsSection } from './MaterialsSection';
import { PurchaseOrdersSection } from './PurchaseOrdersSection';
import { PaymentsSection } from './PaymentsSection';
import { AccountStatementSection } from './AccountStatementSection';
import { ActivityHistorySection } from './ActivityHistorySection';
import { DocumentsSection } from './DocumentsSection';
import { ProviderRating as ProviderRatingComponent } from './ProviderRating';
import { AlertsSection } from './AlertsSection';
import { ProviderKPIs } from './ProviderKPIs';

interface ProviderDetailViewProps {
  provider: Provider;
  materials: ProviderMaterial[];
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  activities: ProviderActivity[];
  documents: ProviderDocument[];
  rating?: ProviderRating;
  onClose: () => void;
  onEdit: () => void;
  onAddMaterial: (material: Omit<ProviderMaterial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateMaterial: (id: string, updates: Partial<ProviderMaterial>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onCreateOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  onCreatePayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'createdBy' | 'createdByName'>) => Promise<void>;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  onDeletePayment: (id: string) => Promise<void>;
  onUploadDocument: (document: Omit<ProviderDocument, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onUpdateRating?: (rating: Omit<ProviderRating, 'totalReviews'>) => Promise<void>;
}

type Tab = 'overview' | 'materials' | 'orders' | 'payments' | 'statement' | 'documents' | 'activity';

export const ProviderDetailView: React.FC<ProviderDetailViewProps> = ({
  provider,
  materials,
  purchaseOrders,
  payments,
  activities,
  documents,
  rating,
  onClose,
  onEdit,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
  onUploadDocument,
  onDeleteDocument,
  onUpdateRating,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Resumen' },
    { id: 'materials', label: 'Materiales', count: materials.length },
    { id: 'orders', label: 'Órdenes', count: purchaseOrders.length },
    { id: 'payments', label: 'Pagos', count: payments.length },
    { id: 'statement', label: 'Estado de Cuenta' },
    { id: 'documents', label: 'Documentos', count: documents.length },
    { id: 'activity', label: 'Historial', count: activities.length },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                title="Volver a la lista"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold mb-2 truncate">{provider.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                  {provider.contact && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Contacto:</span>
                      <span>{provider.contact}</span>
                    </div>
                  )}
                  {provider.taxId && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">RFC:</span>
                      <span>{provider.taxId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      provider.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {provider.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
              title="Editar proveedor"
            >
              <Edit3 className="w-5 h-5" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab (Unified with Info) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="text-base font-medium text-gray-900">{provider.phone}</p>
                      </div>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-medium text-gray-900">{provider.email}</p>
                      </div>
                    </div>
                  )}
                  {provider.address && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="text-base font-medium text-gray-900">{provider.address}</p>
                      </div>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sitio Web</p>
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-blue-600 hover:underline"
                        >
                          {provider.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.paymentTerms && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Términos de Pago</p>
                        <p className="text-base font-medium text-gray-900">{provider.paymentTerms}</p>
                      </div>
                    </div>
                  )}
                  {provider.creditLimit !== undefined && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Límite de Crédito</p>
                        <p className="text-base font-medium text-gray-900">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(provider.creditLimit)}
                        </p>
                      </div>
                    </div>
                  )}
                  {provider.bankAccount && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cuenta Bancaria</p>
                        <p className="text-base font-medium text-gray-900">{provider.bankAccount}</p>
                      </div>
                    </div>
                  )}
                  {provider.currency && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Moneda</p>
                        <p className="text-base font-medium text-gray-900">{provider.currency}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {provider.notes && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{provider.notes}</p>
                </div>
              )}

              {/* System Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID del Proveedor</p>
                      <p className="text-base font-medium text-gray-900 font-mono text-sm">{provider.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Creación</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(provider.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última Actualización</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(provider.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs Dashboard */}
              <ProviderKPIs
                purchaseOrders={purchaseOrders}
                payments={payments}
                materials={materials}
              />

              {/* Rating */}
              <ProviderRatingComponent
                providerId={provider.id}
                rating={rating}
                onUpdateRating={onUpdateRating}
              />

              {/* Alerts */}
              <AlertsSection
                provider={provider}
                purchaseOrders={purchaseOrders}
                payments={payments}
              />
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <MaterialsSection
              providerId={provider.id}
              materials={materials}
              onAddMaterial={onAddMaterial}
              onUpdateMaterial={onUpdateMaterial}
              onDeleteMaterial={onDeleteMaterial}
            />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <PurchaseOrdersSection
              providerId={provider.id}
              orders={purchaseOrders}
              materials={materials}
              onCreateOrder={onCreateOrder}
              onUpdateOrder={onUpdateOrder}
              onDeleteOrder={onDeleteOrder}
            />
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <PaymentsSection
              providerId={provider.id}
              payments={payments}
              purchaseOrders={purchaseOrders}
              onCreatePayment={onCreatePayment}
              onUpdatePayment={onUpdatePayment}
              onDeletePayment={onDeletePayment}
            />
          )}

          {/* Statement Tab */}
          {activeTab === 'statement' && (
            <AccountStatementSection
              providerName={provider.name}
              purchaseOrders={purchaseOrders}
              payments={payments}
            />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentsSection
              providerId={provider.id}
              documents={documents}
              onUploadDocument={onUploadDocument}
              onDeleteDocument={onDeleteDocument}
            />
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <ActivityHistorySection activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
};

