import React, { useState } from 'react';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import type { Piece } from '../types';
import { formatNumber, hasMaterialsSpecified } from '../utils/calculations';

interface PiecesTableProps {
  pieces: Piece[];
  standardWidth: number;
  onDeletePiece: (pieceId: string) => void;
  onUpdatePiece: (pieceId: string, updates: { length?: number; material?: string; standardWidth?: number }) => void;
}

export const PiecesTable: React.FC<PiecesTableProps> = ({
  pieces,
  standardWidth,
  onDeletePiece,
  onUpdatePiece
}: PiecesTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editWidth, setEditWidth] = useState('');

  const handleStartEdit = (piece: Piece) => {
    setEditingId(piece.id);
    setEditValue(piece.length.toString());
    setEditMaterial(piece.material);
    setEditWidth(piece.standardWidth.toString());
  };

  const handleSaveEdit = (pieceId: string) => {
    const newLength = parseFloat(editValue);
    const newWidth = parseFloat(editWidth);
    
    if (!isNaN(newLength) && newLength > 0 && 
        !isNaN(newWidth) && newWidth > 0 && 
        editMaterial.trim()) {
      onUpdatePiece(pieceId, { 
        length: newLength, 
        material: editMaterial, 
        standardWidth: newWidth 
      });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditMaterial('');
    setEditWidth('');
  };

  // Calcular totales
  const totals = {
    totalLength: pieces.reduce((sum: number, p: Piece) => sum + p.length, 0),
    totalMeters: pieces.reduce((sum: number, p: Piece) => sum + p.linearMeters, 0)
  };

  // Verificar si hay materiales registrados (excluyendo "Sin especificar")
  const hasMaterials = hasMaterialsSpecified(pieces);

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

      {/* Table - SCROLLEABLE HORIZONTAL */}
      <div className="overflow-x-auto -mx-px border border-gray-200 rounded-lg">
        <table className={`w-full ${hasMaterials ? 'min-w-[1000px]' : 'min-w-[600px]'}`}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-16 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                No.
              </th>
              {hasMaterials && (
                <th className="w-48 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Material
                </th>
              )}
              <th className="w-24 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Longitud (m)
              </th>
              <th className="w-20 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ancho (m)
              </th>
              <th className="w-28 px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Metros Lineales
              </th>
              <th className="w-24 px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pieces.map((piece: Piece, index: number) => (
              <tr key={piece.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="w-16 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  {piece.number}
                </td>
                {hasMaterials && (
                  <td className="w-48 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === piece.id ? (
                      <input
                        type="text"
                        value={editMaterial}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditMaterial(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-700 truncate block">
                        {piece.material && piece.material.trim() !== '' ? piece.material : 'Sin especificar'}
                      </span>
                    )}
                  </td>
                )}
                <td className="w-24 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === piece.id ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSaveEdit(piece.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      step="0.01"
                      className="w-full px-2 py-1.5 text-sm border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono text-center block">{formatNumber(piece.length, 2)}</span>
                  )}
                </td>
                <td className="w-20 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-700 font-mono text-center">
                  {editingId === piece.id ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editWidth}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditWidth(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSaveEdit(piece.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      step="0.01"
                      min="0.01"
                      max="5"
                      className="w-full px-2 py-1.5 text-sm border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="font-mono text-center block">{formatNumber(piece.standardWidth, 2)}</span>
                  )}
                </td>
                <td className="w-28 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-bold text-green-600 font-mono text-center">
                  {formatNumber(piece.linearMeters, 3)}
                </td>
                <td className="w-24 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === piece.id ? (
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleSaveEdit(piece.id)}
                        className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded transition-colors active:scale-95"
                        title="Guardar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-50 rounded transition-colors active:scale-95"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleStartEdit(piece)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors active:scale-95"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeletePiece(piece.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors active:scale-95"
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
              <td className="w-16 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-center">
                TOTAL
              </td>
              {hasMaterials && (
                <td className="w-48 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-center">
                  —
                </td>
              )}
              <td className="w-24 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-mono text-center">
                {formatNumber(totals.totalLength, 2)}
              </td>
              <td className="w-20 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-mono text-center">
                {formatNumber(standardWidth, 2)}
              </td>
              <td className="w-28 px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-base sm:text-lg font-mono text-center">
                {formatNumber(totals.totalMeters, 3)}
              </td>
              <td className="w-24 px-3 sm:px-4 py-3 sm:py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-600">
            <strong>Nota:</strong> Haz clic en <Edit3 className="inline h-3 w-3 mx-1" /> para editar o en <Trash2 className="inline h-3 w-3 mx-1" /> para eliminar
          </p>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <span className="hidden sm:inline">← Desliza horizontalmente para ver más columnas</span>
            <span className="sm:hidden">← Desliza horizontalmente</span>
          </p>
        </div>
      </div>
    </div>
  );
};

