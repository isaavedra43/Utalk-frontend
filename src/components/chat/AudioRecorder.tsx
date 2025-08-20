import React, { useState, useRef, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { Play, Pause, Square, Mic, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  onCancel 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      infoLog('🎤 Iniciando grabación de audio...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          infoLog('✅ Audio grabado exitosamente, duración:', duration, 'segundos');
          onRecordingComplete(audioBlob);
        } else {
          infoLog('❌ No se pudo grabar audio: no hay datos');
          alert('No se pudo grabar el audio. Intenta de nuevo.');
        }
      };

      mediaRecorder.onerror = (event) => {
        infoLog('❌ Error en la grabación:', event);
        alert('Error durante la grabación. Intenta de nuevo.');
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Capturar datos cada segundo
      setIsRecording(true);
      setDuration(0);

      // Actualizar duración cada segundo
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      infoLog('🎤 Grabación iniciada');

    } catch (error) {
      infoLog('❌ Error accediendo al micrófono:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Permiso denegado para acceder al micrófono. Verifica los permisos del navegador.');
        } else if (error.name === 'NotFoundError') {
          alert('No se encontró ningún micrófono. Verifica que tengas un micrófono conectado.');
        } else {
          alert(`Error accediendo al micrófono: ${error.message}`);
        }
      } else {
        alert('Error desconocido accediendo al micrófono.');
      }
    }
  }, [onRecordingComplete, duration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Detener el stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const pauseRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setDuration(0);
      setIsPlaying(false);
    }
    onCancel?.();
  }, [audioUrl, onCancel]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {!isRecording && !audioUrl ? (
        <button
          onClick={startRecording}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Mic className="w-4 h-4" />
          <span>Grabar</span>
        </button>
      ) : isRecording ? (
        <div className="flex items-center space-x-2">
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>Detener</span>
          </button>
          <span className="text-sm text-gray-600">
            {formatDuration(duration)}
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {isPlaying ? (
            <button
              onClick={pauseRecording}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </button>
          ) : (
            <button
              onClick={playRecording}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Reproducir</span>
            </button>
          )}
          
          <button
            onClick={deleteRecording}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
          
          <span className="text-sm text-gray-600">
            {formatDuration(duration)}
          </span>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}; 