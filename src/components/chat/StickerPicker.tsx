import React from 'react';

interface StickerPickerProps {
  onStickerSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

// Stickers predefinidos (en un proyecto real, estos vendrían del backend)
const STICKERS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
];

export const StickerPicker: React.FC<StickerPickerProps> = ({ onStickerSelect, onClose }) => {
  const handleStickerClick = (sticker: string) => {
    // En un proyecto real, aquí se enviaría la URL del sticker
    // Por ahora, usamos emojis como placeholders
    onStickerSelect(sticker);
    onClose();
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-3 max-w-64">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Stickers</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {STICKERS.map((sticker, index) => (
          <button
            key={index}
            onClick={() => handleStickerClick(sticker)}
            className="p-2 text-2xl hover:bg-gray-100 rounded transition-colors"
            title={`Sticker ${index + 1}`}
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
}; 