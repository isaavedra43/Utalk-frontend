import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MapPin, Smile } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { StickerPicker } from './StickerPicker';
import { FileUploadManager } from './FileUploadManager';
import { PendingFileUpload } from './PendingFileUpload';

interface PendingFile {
  id: string;
  file: File;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedFileId?: string;
}

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, metadata?: Record<string, unknown>) => void;
  sendMessageWithAttachments?: (content: string, attachments: Array<{ id: string; type: string }>) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending?: boolean;
  conversationId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sendMessageWithAttachments,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Escribe un mensaje...",
  value: externalValue,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  onKeyPress: externalOnKeyPress,
  isSending = false,
  conversationId
}) => {
  const [message, setMessage] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usar valor externo si se proporciona, sino usar estado interno
  const currentValue = externalValue !== undefined ? externalValue : message;

  const handleSend = useCallback(() => {
    if ((currentValue.trim() || pendingFiles.length > 0) && !disabled) {
      // Si hay archivos pendientes, se manejan en PendingFileUpload
      if (pendingFiles.length === 0) {
        // Solo enviar mensaje de texto
        onSendMessage(currentValue.trim());
        if (externalValue === undefined) {
          setMessage('');
        }
      }
      setIsTyping(false);
      onStopTyping?.();
    }
  }, [currentValue, pendingFiles.length, disabled, onSendMessage, onStopTyping, externalValue]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (externalOnKeyPress) {
      externalOnKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [externalOnKeyPress, handleSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (externalOnChange) {
      externalOnChange(e);
    } else {
      setMessage(e.target.value);
    }
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 3000);
  }, [isTyping, onTyping, onStopTyping, externalOnChange]);

  const handleBlur = useCallback(() => {
    if (externalOnBlur) {
      externalOnBlur();
    }
    setIsTyping(false);
    onStopTyping?.();
  }, [externalOnBlur, onStopTyping]);

  // Manejar archivos agregados
  const handleFilesAdded = useCallback((files: PendingFile[]) => {
    setPendingFiles(prev => {
      const newFiles = [...prev];
      
      files.forEach(newFile => {
        const existingIndex = newFiles.findIndex(f => f.id === newFile.id);
        if (existingIndex >= 0) {
          // Actualizar archivo existente
          newFiles[existingIndex] = newFile;
        } else {
          // Agregar nuevo archivo
          newFiles.push(newFile);
        }
      });
      
      return newFiles;
    });
  }, []);

  // Manejar archivo removido
  const handleFileRemoved = useCallback((fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Manejar envío de archivos
  const handleFilesSent = useCallback((_files: PendingFile[], message: string) => {
    // Limpiar archivos después del envío exitoso
    setPendingFiles([]);
    
    // SOLUCIONADO: No enviar mensaje de texto aquí porque ya se envió con los archivos
    // El mensaje de texto se envía automáticamente junto con los archivos en PendingFileUpload
    // Solo limpiar el input si hay mensaje
    if (message.trim() && externalValue === undefined) {
      setMessage('');
    }
  }, [externalValue]);

  // Auto-resize del textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [currentValue]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Archivos pendientes */}
      <PendingFileUpload
        files={pendingFiles}
        onRemoveFile={handleFileRemoved}
        onSendFiles={handleFilesSent}
        conversationId={conversationId}
        sendMessageWithAttachments={sendMessageWithAttachments}
      />

      {/* Input de mensaje */}
      <div className="flex items-end space-x-2">
        {/* Botón de adjuntar archivo */}
        <FileUploadManager
          onFilesAdded={handleFilesAdded}
          conversationId={conversationId}
        />

        {/* Botón de grabación de audio */}
        <button
          onClick={() => setShowAudioRecorder(!showAudioRecorder)}
          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-200"
          title="Grabar audio"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>

        {/* Botón de ubicación */}
        <button
          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-200"
          title="Enviar ubicación"
        >
          <MapPin className="w-3.5 h-3.5" />
        </button>

        {/* Input de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={currentValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            maxLength={1000}
          />
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-1 right-2 text-xs text-gray-400">
            {currentValue.length}/1000
          </div>
        </div>

        {/* Botón de emojis */}
        <button
          onClick={() => setShowStickerPicker(!showStickerPicker)}
          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-200"
          title="Emojis"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {/* Botón de enviar */}
        <button
          onClick={handleSend}
          disabled={disabled || isSending || (!currentValue.trim() && pendingFiles.length === 0)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Grabador de audio */}
      {showAudioRecorder && (
        <div className="mt-4">
          <AudioRecorder
            onRecordingComplete={(audioBlob) => {
              // Convertir blob a File y agregarlo como archivo pendiente
              const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, { type: 'audio/wav' });
              const pendingFile: PendingFile = {
                id: `audio-${Date.now()}-${Math.random()}`,
                file: audioFile,
                type: 'audio',
                status: 'pending',
                progress: 0
              };
              handleFilesAdded([pendingFile]);
              setShowAudioRecorder(false);
            }}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {/* Selector de stickers */}
      {showStickerPicker && (
                 <div className="mt-4">
           <StickerPicker
             onSelectSticker={(sticker: string) => {
               // Agregar emoji al mensaje
               const newValue = currentValue + sticker;
               if (externalValue === undefined) {
                 setMessage(newValue);
               }
               setShowStickerPicker(false);
             }}
             onClose={() => setShowStickerPicker(false)}
           />
         </div>
      )}
    </div>
  );
}; 