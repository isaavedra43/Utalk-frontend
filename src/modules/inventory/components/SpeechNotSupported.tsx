import React from 'react';
import { MicOff, AlertCircle } from 'lucide-react';

export const SpeechNotSupported: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <AlertCircle className="w-4 h-4 text-yellow-600" />
      <span className="text-sm text-yellow-800">
        El reconocimiento de voz no está disponible en este navegador o dispositivo.
      </span>
      <MicOff className="w-4 h-4 text-yellow-600 ml-auto" />
    </div>
  );
};
