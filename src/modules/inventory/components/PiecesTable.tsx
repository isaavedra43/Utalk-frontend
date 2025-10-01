import React, { useState } from 'react';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import type { Piece } from '../types';
import { formatNumber } from '../utils/calculations';

interface PiecesTableProps {
  pieces: Piece[];
  standardWidth: number;
  onDeletePiece: (pieceId: string) => void;
  onUpdatePiece: (pieceId: string, length: number) => void;
}

export const PiecesTable: React.FC<PiecesTableProps> = ({
  pieces,
  standardWidth,
  onDeletePiece,
  onUpdatePiece
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (piece: Piece) => {
    setEditingId(piece.id);
    setEditValue(piece.length.toString());
  };

  const handleSaveEdit = (pieceId: string) => {
    const newLength = parseFloat(editValue);
    if (!isNaN(newLength) && newLength > 0) {
      onUpdatePiece(pieceId, newLength);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Calcular totales
  const totals = {
    totalLength: pieces.reduce((sum, p) => sum + p.length, 0),
    totalMeters: pieces.reduce((sum, p) => sum + p.linearMeters, 0)
  };

  if (pieces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center border border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
            Sin piezas registradas
          </h3>
          <p className="text-gray-600 text-sm">
            Comienza a agregar las longitudes de las piezas usando el panel de captura rápida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-white">Detalle de Piezas</h3>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">{pieces.length} pieza(s) registrada(s)</p>
      </div>

      {/* Table - SCROLLEABLE EN MÓVIL */}
      <div className="overflow-x-auto -mx-px">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                No.
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Longitud (m)
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ancho (m)
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Metros Lineales
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pieces.map((piece, index) => (
              <tr key={piece.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {piece.number}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === piece.id ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(piece.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      step="0.01"
                      className="w-20 sm:w-24 px-2 py-1.5 text-base sm:text-sm border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono">{formatNumber(piece.length, 2)}</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                  {formatNumber(piece.standardWidth, 2)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-bold text-green-600 font-mono">
                  {formatNumber(piece.linearMeters, 3)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === piece.id ? (
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleSaveEdit(piece.id)}
                        className="text-green-600 hover:text-green-900 p-1.5 sm:p-1 hover:bg-green-50 rounded transition-colors active:scale-95"
                        title="Guardar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 p-1.5 sm:p-1 hover:bg-gray-50 rounded transition-colors active:scale-95"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleStartEdit(piece)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-1 hover:bg-blue-50 rounded transition-colors active:scale-95"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeletePiece(piece.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 sm:p-1 hover:bg-red-50 rounded transition-colors active:scale-95"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="bg-blue-600 text-white font-bold">
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                TOTAL
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-mono">
                {formatNumber(totals.totalLength, 2)}
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-mono">
                {formatNumber(standardWidth, 2)}
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg font-mono">
                {formatNumber(totals.totalMeters, 3)}
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center sm:text-left">
          <strong>Nota:</strong> Haz clic en <Edit3 className="inline h-3 w-3" /> para editar o en <Trash2 className="inline h-3 w-3" /> para eliminar
        </p>
        <p className="text-xs text-gray-500 text-center mt-1 sm:hidden">
          Desliza la tabla horizontalmente →
        </p>
      </div>
    </div>
  );
};

