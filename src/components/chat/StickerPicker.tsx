import React from 'react';
import { X } from 'lucide-react';

interface StickerPickerProps {
  onSelectSticker: (stickerUrl: string) => void;
  onClose: () => void;
}

const STICKERS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥'
];

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelectSticker, onClose }) => {
  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Emojis</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto no-scrollbar">
        {STICKERS.map((sticker, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectSticker(sticker);
              onClose();
            }}
            className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`Emoji ${index + 1}`}
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
}; 