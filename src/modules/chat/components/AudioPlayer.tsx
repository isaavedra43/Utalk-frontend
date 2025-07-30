// Componente de reproductor de audio con metadatos
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Download, FileAudio } from 'lucide-react'
import type { CanonicalFileAttachment } from '@/types/canonical'

interface AudioPlayerProps {
  file: CanonicalFileAttachment
  metadata?: {
    duration?: string
    durationSeconds?: number
    transcription?: string
  }
}

export function AudioPlayer({ file, metadata }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showTranscription, setShowTranscription] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.filename || 'audio.mp3'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <FileAudio className="w-5 h-5 text-blue-500" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{file.filename}</h4>
          <p className="text-xs text-muted-foreground">
            {metadata?.duration || formatTime(duration)}
          </p>
        </div>
        <Button onClick={handleDownload} variant="ghost" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handlePlayPause} variant="ghost" size="sm">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <div className="flex-1 space-y-1">
          <Progress value={progress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {metadata?.transcription && (
        <div className="space-y-2">
          <Button
            onClick={() => setShowTranscription(!showTranscription)}
            variant="ghost"
            size="sm"
            className="text-blue-600"
          >
            {showTranscription ? 'Ocultar' : 'Ver'} transcripción
          </Button>
          
          {showTranscription && (
            <div className="p-3 bg-gray-50 rounded text-sm">
              {metadata.transcription}
            </div>
          )}
        </div>
      )}

      <audio ref={audioRef} src={file.url} preload="metadata" />
    </div>
  )
} 