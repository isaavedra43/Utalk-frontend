import React, { useState } from 'react';
import { X, Building2, Phone, Mail, MapPin, Globe, CreditCard, Calendar, Edit3, ArrowLeft } from 'lucide-react';
import type { Provider, ProviderMaterial, PurchaseOrder, Payment, ProviderActivity } from '../types';
import { MaterialsSection } from './MaterialsSection';
import { PurchaseOrdersSection } from './PurchaseOrdersSection';
import { PaymentsSection } from './PaymentsSection';
import { AccountStatementSection } from './AccountStatementSection';
import { ActivityHistorySection } from './ActivityHistorySection';

interface ProviderDetailViewProps {
  provider: Provider;
  materials: ProviderMaterial[];
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  activities: ProviderActivity[];
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
}

type Tab = 'info' | 'materials' | 'orders' | 'payments' | 'statement' | 'activity';

export const ProviderDetailView: React.FC<ProviderDetailViewProps> = ({
  provider,
  materials,
  purchaseOrders,
  payments,
  activities,
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
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'info', label: 'Información' },
    { id: 'materials', label: 'Materiales', count: materials.length },
    { id: 'orders', label: 'Órdenes', count: purchaseOrders.length },
    { id: 'payments', label: 'Pagos', count: payments.length },
    { id: 'statement', label: 'Estado de Cuenta' },
    { id: 'activity', label: 'Historial', count: activities.length },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-7xl my-8 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6 rounded-t-lg flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="p-3 bg-white/20 rounded-lg flex-shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-2 truncate">{provider.name}</h2>
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

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Editar proveedor"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
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
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID del Proveedor</p>
                    <p className="font-mono text-gray-900 mt-1">{provider.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha de Creación</p>
                    <p className="font-medium text-gray-900 mt-1">{formatDate(provider.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Última Actualización</p>
                    <p className="font-medium text-gray-900 mt-1">{formatDate(provider.updatedAt)}</p>
                  </div>
                </div>
              </div>
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

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <ActivityHistorySection activities={activities} />
          )}
        </div>

        {/* Footer - Mobile Back Button */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0 lg:hidden">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

