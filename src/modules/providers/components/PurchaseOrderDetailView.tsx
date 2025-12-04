import React, { useRef, useState } from 'react';
import { X, Edit, Mail, FileText, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PurchaseOrder } from '../types';

interface PurchaseOrderDetailViewProps {
  order: PurchaseOrder;
  onClose: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: PurchaseOrder['status']) => Promise<void>;
}

export const PurchaseOrderDetailView: React.FC<PurchaseOrderDetailViewProps> = ({
  order,
  onClose,
  onEdit,
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };



  const handleExportPDF = async () => {
    if (!pdfContentRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = 0;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      pdf.save(`Orden_${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar el PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (!pdfContentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orden ${order.orderNumber}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          ${pdfContentRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      // TODO: Implementar llamada al backend para enviar email
      // Por ahora, usamos mailto como fallback
      const subject = encodeURIComponent(`Orden de Compra ${order.orderNumber}`);
      const body = encodeURIComponent(
        `Estimado proveedor,\n\nAdjunto encontrará la orden de compra ${order.orderNumber}.\n\nSaludos cordiales.`
      );
      window.location.href = `mailto:${order.providerName}@example.com?subject=${subject}&body=${body}`;
    } catch (error) {
      console.error('Error al enviar email:', error);
      alert('Error al enviar el email');
    } finally {
      setSendingEmail(false);
    }
  };

  const showClosedRibbon = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header con acciones */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            )}
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              Enviar correo electrónico
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <FileText className="w-4 h-4" />
                PDF/Imprimir
                <span className="text-xs">▼</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {/* Documento PDF-like */}
          <div
            ref={pdfContentRef}
            className="bg-white mx-auto max-w-4xl shadow-lg"
            style={{
              padding: '60px',
              fontFamily: 'Arial, sans-serif',
              position: 'relative',
            }}
          >
            {/* Ribbon "Cerrado" */}
            {showClosedRibbon && (
              <div
                className="absolute top-0 left-0 bg-green-600 text-white px-8 py-2 transform -rotate-45 origin-left"
                style={{
                  transform: 'rotate(-45deg)',
                  transformOrigin: '0 0',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <span className="font-bold text-sm">Cerrado</span>
              </div>
            )}

            {/* Header del documento */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#1f2937' }}>
                    UNIK
                  </div>
                  <div className="text-sm" style={{ color: '#6b7280', lineHeight: '1.6' }}>
                    <div>Blvd. Juan Alonso de Torres Pte. 3625 Vista Hermosa León</div>
                    <div>Guanajuato 37330 Mexico</div>
                    <div>477 792 3896</div>
                    <div>ventas@grupounik.com.mx</div>
                    <div>www.grupounik.com.mx</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#1f2937' }}>
                    Orden de compra
                  </div>
                  <div className="text-lg" style={{ color: '#6b7280' }}>
                    Folio {order.orderNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del proveedor y fechas */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#6b7280' }}>
                  Proveedor
                </div>
                <div className="text-lg font-semibold" style={{ color: '#2563eb' }}>
                  {order.providerName}
                </div>
              </div>
              <div className="text-right" style={{ color: '#374151' }}>
                <div className="mb-2">
                  <span className="text-sm">Fecha : </span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.expectedDeliveryDate && (
                  <div className="mb-2">
                    <span className="text-sm">Fecha de entrega : </span>
                    <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm">Folio Ticket de Venta : </span>
                  <span className="font-medium">OV-</span>
                </div>
              </div>
            </div>

            {/* Tabla de artículos */}
            <div className="mb-8">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4b5563', color: '#ffffff' }}>
                    <th className="text-left py-3 px-4 font-bold text-sm" style={{ border: '1px solid #6b7280' }}>
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-sm" style={{ border: '1px solid #6b7280' }}>
                      Artículo & Descripción
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-sm" style={{ border: '1px solid #6b7280' }}>
                      Cant.
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-sm" style={{ border: '1px solid #6b7280' }}>
                      Precio
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-sm" style={{ border: '1px solid #6b7280' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td className="py-3 px-4 text-sm" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                        {item.materialName}
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-sm text-right" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mb-8 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-sm" style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-300">
                    <span className="text-sm" style={{ color: '#6b7280' }}>IVA:</span>
                    <span className="text-sm font-medium" style={{ color: '#374151' }}>
                      {formatCurrency(order.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3 mt-2">
                  <span className="text-lg font-bold" style={{ color: '#1f2937' }}>Total:</span>
                  <span className="text-lg font-bold" style={{ color: '#1f2937' }}>
                    MXN{formatCurrency(order.total).replace('MX$', '').trim()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm" style={{ color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              www.grupounik.com.mx
            </div>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Patio Unik</span>
              <span className="text-sm text-gray-600">|</span>
              <span className="text-sm font-medium text-gray-900">CAMPOS PERSONALIZADOS</span>
              <span className="text-sm text-gray-600">Folio Ticket de Venta : OV-</span>
            </div>
            <div className="text-sm text-gray-600">
              Plantilla de PDF : 'Orden de compra Unik' <span className="text-blue-600 cursor-pointer hover:underline">Cambiar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
