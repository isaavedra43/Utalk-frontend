import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FileText, Clock } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface ProviderNotesSectionProps {
  notes?: string;
  onNotesChange: (notes: string) => void;
}

export const ProviderNotesSection: React.FC<ProviderNotesSectionProps> = ({
  notes,
  onNotesChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes || '');

  const handleSave = () => {
    onNotesChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(notes || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Notas y Observaciones</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit3 className="h-4 w-4" />
            {notes ? 'Editar' : 'Agregar'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Escribe notas adicionales sobre el proveedor, acuerdos, observaciones importantes, etc."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar Notas
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notes ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                Última actualización: {new Date().toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No hay notas registradas</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Agregar notas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
