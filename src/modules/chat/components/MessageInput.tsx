// Componente de entrada de mensajes con soporte multimedia
import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Mic, X } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { AudioRecorder } from './AudioRecorder'
import type { SendMessageData } from '../types'

interface MessageInputProps {
  onSendMessage: (data: SendMessageData) => void
  conversationId?: string
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSendMessage,
  conversationId,
  disabled = false,
  placeholder = "Escribe un mensaje..."
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ✅ Enviar mensaje de texto
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !conversationId || disabled || isSending) return

    try {
      setIsSending(true)
      
      await onSendMessage({
        conversationId,
        content: message.trim(),
        senderEmail: '', // Se llenará en el hook
        recipientEmail: '', // Se llenará en el hook
        type: 'text'
      })
      
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
    } catch (error) {
      console.error('[MESSAGE-INPUT] Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }, [message, conversationId, disabled, isSending, onSendMessage])

  // ✅ Manejar archivos subidos
  const handleFilesUploaded = useCallback(async (uploadedFiles: any[]) => {
    if (!conversationId || uploadedFiles.length === 0) return

    try {
      setIsSending(true)

      // Crear mensaje con archivos
      const attachments = uploadedFiles.map(file => ({
        id: file.fileId,
        filename: file.originalName,
        url: file.mediaUrl,
        mimeType: file.metadata?.format || 'application/octet-stream',
        size: file.sizeBytes,
        category: file.category,
        metadata: file.metadata
      }))

      await onSendMessage({
        conversationId,
        content: message.trim() || 'Archivo adjunto',
        senderEmail: '', // Se llenará en el hook
        recipientEmail: '', // Se llenará en el hook
        type: 'media',
        attachments
      })

      setMessage('')
      setShowFileUpload(false)
      
    } catch (error) {
      console.error('[MESSAGE-INPUT] Error sending files:', error)
    } finally {
      setIsSending(false)
    }
  }, [conversationId, message, onSendMessage])

  // ✅ Manejar audio grabado
  const handleAudioUploaded = useCallback(async (uploadedAudio: any) => {
    if (!conversationId) return

    try {
      setIsSending(true)

      const audioAttachment = {
        id: uploadedAudio.fileId,
        filename: uploadedAudio.originalName,
        url: uploadedAudio.mediaUrl,
        mimeType: uploadedAudio.metadata?.format || 'audio/webm',
        size: uploadedAudio.sizeBytes,
        category: 'audio' as const,
        metadata: uploadedAudio.metadata
      }

      await onSendMessage({
        conversationId,
        content: 'Mensaje de audio',
        senderEmail: '', // Se llenará en el hook
        recipientEmail: '', // Se llenará en el hook
        type: 'media',
        attachments: [audioAttachment]
      })

      setShowAudioRecorder(false)
      
    } catch (error) {
      console.error('[MESSAGE-INPUT] Error sending audio:', error)
    } finally {
      setIsSending(false)
    }
  }, [conversationId, onSendMessage])

  // ✅ Manejar teclas
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // ✅ Auto-resize textarea
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }, [])

  // ✅ Toggle file upload
  const toggleFileUpload = useCallback(() => {
    setShowFileUpload(!showFileUpload)
    setShowAudioRecorder(false) // Cerrar audio recorder si está abierto
  }, [showFileUpload])

  // ✅ Toggle audio recorder
  const toggleAudioRecorder = useCallback(() => {
    setShowAudioRecorder(!showAudioRecorder)
    setShowFileUpload(false) // Cerrar file upload si está abierto
  }, [showAudioRecorder])

  const canSend = message.trim().length > 0 && !disabled && !isSending

  return (
    <div className="border-t bg-white p-4 space-y-3">
      {/* File Upload Modal */}
      {showFileUpload && conversationId && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Adjuntar Archivos</h3>
            <Button
              onClick={() => setShowFileUpload(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            conversationId={conversationId}
            maxFiles={3}
            disabled={isSending}
          />
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showAudioRecorder && conversationId && (
        <AudioRecorder
          onUpload={handleAudioUploaded}
          onCancel={() => setShowAudioRecorder(false)}
          conversationId={conversationId}
        />
      )}

      {/* Input Principal */}
      <div className="flex items-end gap-2">
        {/* Botones de acciones */}
        <div className="flex gap-1">
          <Button
            onClick={toggleFileUpload}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            disabled={disabled || isSending}
            title="Adjuntar archivo"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={toggleAudioRecorder}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            disabled={disabled || isSending}
            title="Grabar audio"
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none pr-12 py-2"
            rows={1}
          />
        </div>

        {/* Botón enviar */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="sm"
          className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Estado de envío */}
      {isSending && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Enviando mensaje...</span>
        </div>
      )}
    </div>
  )
} 