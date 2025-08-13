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
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Stickers</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {STICKERS.map((sticker, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectSticker(sticker);
              onClose();
            }}
            className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
}; 