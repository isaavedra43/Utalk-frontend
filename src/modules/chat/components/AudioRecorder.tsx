// Componente de grabación de audio usando MediaRecorder API
import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, Play, Pause, RotateCcw, Send, X } from 'lucide-react'
import { uploadService } from '../services/uploadService'

interface AudioRecorderProps {
  onUpload: (uploadedFile: any) => void
  onCancel: () => void
  conversationId: string
}

export function AudioRecorder({ onUpload, onCancel, conversationId }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ Iniciar grabación
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Solicitar permiso para micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        
        // Limpiar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100) // Capturar datos cada 100ms
      setIsRecording(true)
      setRecordingTime(0)
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      console.log('[AUDIO-RECORDER] Recording started')
      
    } catch (err) {
      console.error('[AUDIO-RECORDER] Error starting recording:', err)
      setError('Error al acceder al micrófono. Verifica los permisos.')
    }
  }, [])

  // ✅ Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      console.log('[AUDIO-RECORDER] Recording stopped')
    }
  }, [isRecording])

  // ✅ Reproducir audio grabado
  const playRecording = useCallback(() => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [audioBlob])

  // ✅ Pausar reproducción
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // ✅ Reiniciar grabación
  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)
    
    if (audioRef.current) {
      audioRef.current.src = ''
    }
  }, [])

  // ✅ Enviar audio grabado
  const sendRecording = useCallback(async () => {
    if (!audioBlob) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)

      // Crear File a partir del Blob
      const audioFile = new File(
        [audioBlob], 
        `audio_${Date.now()}.webm`, 
        { type: 'audio/webm' }
      )

      console.log('[AUDIO-RECORDER] Uploading audio:', {
        size: audioFile.size,
        type: audioFile.type,
        name: audioFile.name
      })

      // Subir archivo
      const uploadedData = await uploadService.uploadFile(
        audioFile,
        (progress) => {
          setUploadProgress(progress)
          console.log('[AUDIO-RECORDER] Upload progress:', progress + '%')
        }
      )

      console.log('[AUDIO-RECORDER] Audio uploaded successfully:', uploadedData)
      
      // Llamar callback con archivo subido
      onUpload(uploadedData)
      
    } catch (err) {
      console.error('[AUDIO-RECORDER] Error uploading audio:', err)
      setError('Error al subir el audio. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [audioBlob, conversationId, onUpload])

  // ✅ Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // ✅ Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // ✅ Event listeners para audio
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Grabar Audio</h3>
        <Button onClick={onCancel} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Estado de grabación */}
      <div className="text-center space-y-2">
        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {audioBlob && !isRecording && (
          <div className="text-gray-600">
            <span className="font-mono">{formatTime(recordingTime)}</span>
            <span className="text-sm ml-2">grabado</span>
          </div>
        )}
      </div>

      {/* Controles principales */}
      <div className="flex justify-center space-x-3">
        {!audioBlob ? (
          // Grabación
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="h-12 w-12 rounded-full"
            disabled={isUploading}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        ) : (
          // Controles de reproducción y envío
          <>
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={resetRecording}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={sendRecording}
              variant="default"
              size="sm"
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* Barra de progreso de subida */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            Subiendo audio... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Audio element oculto para reproducción */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}

export default AudioRecorder 