import React, { useState, useRef } from 'react';
import { X, Download, Printer, FileText, Calendar, User, DollarSign, Minus, Plus } from 'lucide-react';
import { EmployeePayrollData, PayrollPeriod, PayrollVoucher } from '../../../types/payrollGeneral';

interface PayrollVoucherModalProps {
  employee: EmployeePayrollData;
  period: PayrollPeriod;
  onClose: () => void;
}

export const PayrollVoucherModal: React.FC<PayrollVoucherModalProps> = ({
  employee,
  period,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState('');
  const voucherRef = useRef<HTMLDivElement>(null);

  const voucher: PayrollVoucher = {
    employeeId: employee.employeeId,
    periodId: period.id,
    voucherNumber: `V-${period.id.slice(-4)}-${employee.employeeNumber}`,
    employee: {
      fullName: employee.fullName,
      employeeNumber: employee.employeeNumber,
      position: employee.position,
      department: employee.department
    },
    period: {
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate
    },
    perceptions: {
      basePay: employee.basePay,
      overtime: employee.overtimePay,
      bonuses: employee.bonuses,
      allowances: employee.allowances,
      total: employee.totalPerceptions
    },
    deductions: {
      taxes: employee.taxes,
      socialSecurity: employee.socialSecurity,
      loans: employee.loans,
      advances: employee.advances,
      absences: employee.absenceDeductions,
      other: employee.otherDeductions,
      total: employee.totalDeductions
    },
    netPay: employee.netPay,
    generatedAt: new Date().toISOString(),
    signedAt: signed ? new Date().toISOString() : undefined,
    signature: signed ? signature : undefined
  };

  const handlePrint = () => {
    const printContent = voucherRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vale de Nómina - ${voucher.employee.fullName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .voucher { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 20px; 
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px; 
            }
            .company-subtitle { 
              font-size: 14px; 
              color: #666; 
            }
            .voucher-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 20px; 
            }
            .employee-info, .period-info { 
              flex: 1; 
            }
            .info-title { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 10px; 
              border-bottom: 1px solid #eee; 
              padding-bottom: 5px; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
            }
            .info-label { 
              font-weight: 500; 
              color: #555; 
            }
            .info-value { 
              color: #333; 
            }
            .payroll-sections { 
              display: flex; 
              gap: 20px; 
              margin-bottom: 20px; 
            }
            .section { 
              flex: 1; 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 15px; 
            }
            .section-title { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 10px; 
              text-align: center; 
              padding-bottom: 10px; 
              border-bottom: 1px solid #eee; 
            }
            .perceptions { 
              border-color: #10b981; 
            }
            .perceptions .section-title { 
              color: #10b981; 
            }
            .deductions { 
              border-color: #ef4444; 
            }
            .deductions .section-title { 
              color: #ef4444; 
            }
            .amount-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
              padding: 5px 0; 
            }
            .amount-label { 
              color: #555; 
            }
            .amount-value { 
              font-weight: 500; 
              color: #333; 
            }
            .total-row { 
              border-top: 2px solid #333; 
              margin-top: 10px; 
              padding-top: 10px; 
              font-weight: bold; 
            }
            .net-pay { 
              background: #f0f9ff; 
              border: 2px solid #3b82f6; 
              border-radius: 8px; 
              padding: 20px; 
              text-align: center; 
              margin: 20px 0; 
            }
            .net-pay-label { 
              font-size: 18px; 
              color: #1e40af; 
              margin-bottom: 10px; 
            }
            .net-pay-amount { 
              font-size: 32px; 
              font-weight: bold; 
              color: #1e40af; 
            }
            .signatures { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 40px; 
              padding-top: 20px; 
            }
            .signature-box { 
              text-align: center; 
              width: 200px; 
            }
            .signature-line { 
              border-top: 1px solid #333; 
              margin-bottom: 10px; 
              height: 50px; 
            }
            .signature-label { 
              font-size: 12px; 
              color: #666; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
              font-size: 12px; 
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .voucher { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      // TODO: Implementar generación de PDF
      // const pdfBlob = await generateVoucherPDF(voucher);
      // const url = URL.createObjectURL(pdfBlob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `vale-nomina-${voucher.employee.employeeNumber}-${voucher.period.name}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // URL.revokeObjectURL(url);
      
      // Mock para demostrar funcionalidad
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('PDF generado exitosamente (funcionalidad en desarrollo)');
    } catch (error) {
      alert('Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = () => {
    if (!signature.trim()) {
      alert('Por favor ingresa tu nombre para firmar');
      return;
    }
    setSigned(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vale de Nómina</h3>
              <p className="text-sm text-gray-600">{voucher.voucherNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del Vale */}
        <div ref={voucherRef} className="voucher p-8">
          {/* Header de la Empresa */}
          <div className="header text-center mb-8">
            <div className="company-name text-2xl font-bold text-gray-900 mb-2">
              Tu Empresa S.A. de C.V.
            </div>
            <div className="company-subtitle text-gray-600">
              RFC: TUE123456789 • Dirección: Calle Principal #123, Ciudad, Estado
            </div>
            <div className="mt-4 text-xl font-semibold text-blue-600">
              COMPROBANTE DE PAGO DE NÓMINA
            </div>
          </div>

          {/* Información del Vale */}
          <div className="voucher-info grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Información del Empleado */}
            <div className="employee-info">
              <div className="info-title text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                <User className="w-5 h-5 inline-block mr-2" />
                Información del Empleado
              </div>
              <div className="space-y-2">
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Nombre:</span>
                  <span className="info-value text-gray-900">{voucher.employee.fullName}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Número:</span>
                  <span className="info-value text-gray-900">{voucher.employee.employeeNumber}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Puesto:</span>
                  <span className="info-value text-gray-900">{voucher.employee.position}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Departamento:</span>
                  <span className="info-value text-gray-900">{voucher.employee.department}</span>
                </div>
              </div>
            </div>

            {/* Información del Período */}
            <div className="period-info">
              <div className="info-title text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Información del Período
              </div>
              <div className="space-y-2">
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Período:</span>
                  <span className="info-value text-gray-900">{voucher.period.name}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Desde:</span>
                  <span className="info-value text-gray-900">{formatDate(voucher.period.startDate)}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Hasta:</span>
                  <span className="info-value text-gray-900">{formatDate(voucher.period.endDate)}</span>
                </div>
                <div className="info-row flex justify-between">
                  <span className="info-label font-medium text-gray-600">Días Trabajados:</span>
                  <span className="info-value text-gray-900">{employee.workedDays}/{employee.workDays}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secciones de Nómina */}
          <div className="payroll-sections grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Percepciones */}
            <div className="section perceptions border-2 border-green-200 rounded-lg p-6">
              <div className="section-title text-lg font-bold text-green-700 mb-4 text-center pb-3 border-b border-green-200">
                <Plus className="w-5 h-5 inline-block mr-2" />
                PERCEPCIONES
              </div>
              <div className="space-y-3">
                {voucher.perceptions.basePay > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Sueldo Base</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.perceptions.basePay)}</span>
                  </div>
                )}
                {voucher.perceptions.overtime > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Horas Extra</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.perceptions.overtime)}</span>
                  </div>
                )}
                {voucher.perceptions.bonuses > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Bonos</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.perceptions.bonuses)}</span>
                  </div>
                )}
                {voucher.perceptions.allowances > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Prestaciones</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.perceptions.allowances)}</span>
                  </div>
                )}
                <div className="total-row flex justify-between pt-3 mt-4 border-t-2 border-green-300 font-bold text-green-700">
                  <span>TOTAL PERCEPCIONES</span>
                  <span>{formatCurrency(voucher.perceptions.total)}</span>
                </div>
              </div>
            </div>

            {/* Deducciones */}
            <div className="section deductions border-2 border-red-200 rounded-lg p-6">
              <div className="section-title text-lg font-bold text-red-700 mb-4 text-center pb-3 border-b border-red-200">
                <Minus className="w-5 h-5 inline-block mr-2" />
                DEDUCCIONES
              </div>
              <div className="space-y-3">
                {voucher.deductions.taxes > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Impuestos</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.taxes)}</span>
                  </div>
                )}
                {voucher.deductions.socialSecurity > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Seguro Social</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.socialSecurity)}</span>
                  </div>
                )}
                {voucher.deductions.loans > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Préstamos</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.loans)}</span>
                  </div>
                )}
                {voucher.deductions.advances > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Adelantos</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.advances)}</span>
                  </div>
                )}
                {voucher.deductions.absences > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Faltas</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.absences)}</span>
                  </div>
                )}
                {voucher.deductions.other > 0 && (
                  <div className="amount-row flex justify-between py-2">
                    <span className="amount-label text-gray-600">Otras Deducciones</span>
                    <span className="amount-value font-medium text-gray-900">{formatCurrency(voucher.deductions.other)}</span>
                  </div>
                )}
                <div className="total-row flex justify-between pt-3 mt-4 border-t-2 border-red-300 font-bold text-red-700">
                  <span>TOTAL DEDUCCIONES</span>
                  <span>{formatCurrency(voucher.deductions.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Neto a Pagar */}
          <div className="net-pay bg-blue-50 border-2 border-blue-300 rounded-lg p-8 text-center mb-8">
            <div className="net-pay-label text-xl font-semibold text-blue-800 mb-4">
              <DollarSign className="w-6 h-6 inline-block mr-2" />
              NETO A PAGAR
            </div>
            <div className="net-pay-amount text-4xl font-bold text-blue-900">
              {formatCurrency(voucher.netPay)}
            </div>
          </div>

          {/* Firmas */}
          <div className="signatures grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8">
            <div className="signature-box text-center">
              <div className="signature-line h-16 border-b border-gray-400 mb-4 flex items-end justify-center pb-2">
                {signed && signature && (
                  <span className="text-lg italic text-gray-700">{signature}</span>
                )}
              </div>
              <div className="signature-label text-sm text-gray-600">
                <strong>Firma del Empleado</strong><br />
                {voucher.employee.fullName}
              </div>
            </div>
            <div className="signature-box text-center">
              <div className="signature-line h-16 border-b border-gray-400 mb-4"></div>
              <div className="signature-label text-sm text-gray-600">
                <strong>Firma del Responsable de RRHH</strong><br />
                Recursos Humanos
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Este comprobante de pago es válido y ha sido generado electrónicamente.<br />
              Fecha de generación: {formatDate(voucher.generatedAt)} | Folio: {voucher.voucherNumber}
            </p>
          </div>
        </div>

        {/* Sección de Firma Digital */}
        {!signed && (
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Firma Digital</h4>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Ingresa tu nombre completo para firmar"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSign}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Firmar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Al firmar, confirmas que has recibido y revisado tu comprobante de pago
            </p>
          </div>
        )}

        {signed && (
          <div className="bg-green-50 px-8 py-4 border-t border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium">Vale firmado exitosamente</p>
                <p className="text-sm">Firmado por: {signature} el {formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
