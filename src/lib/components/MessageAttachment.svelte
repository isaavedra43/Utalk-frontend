<!-- 
 * Componente de Archivo Adjunto para Mensajes
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "📎 Validación de Archivos"
 * 
 * Características:
 * - Previsualización de imágenes, PDFs, audio, video
 * - Link de descarga para documentos
 * - Manejo de errores de archivo
 * - Estados de carga y error
 -->

<script lang="ts">
  import { getFileTypeFromExtension } from '$lib/utils/validation';
  import { onMount } from 'svelte';

  export let mediaUrl: string;
  export let filename: string;
  export let fileType: string;
  export let fileSize: number;

  let loading = true;
  let error = '';
  let isImage = false;
  let isVideo = false;
  let isAudio = false;
  let isDocument = false;

  onMount(() => {
    // Determinar tipo de archivo para renderizado
    const detectedType = getFileTypeFromExtension(filename);

    isImage = detectedType === 'image' || fileType.startsWith('image/');
    isVideo = detectedType === 'video' || fileType.startsWith('video/');
    isAudio = detectedType === 'audio' || fileType.startsWith('audio/');
    isDocument = detectedType === 'document' || fileType === 'application/pdf';

    loading = false;
  });

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function handleDownload() {
    // Crear link de descarga temporal
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleImageError() {
    error = 'Error al cargar la imagen';
  }

  function handleVideoError() {
    error = 'Error al cargar el video';
  }

  function handleAudioError() {
    error = 'Error al cargar el audio';
  }
</script>

<div class="attachment-container">
  {#if loading}
    <div class="attachment-loading">
      <span class="loading-spinner">⏳</span>
      <span>Cargando archivo...</span>
    </div>
  {:else if error}
    <div class="attachment-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{error}</span>
    </div>
  {:else}
    <!-- Imagen -->
    {#if isImage}
      <div class="attachment-image">
        <img src={mediaUrl} alt={filename} on:error={handleImageError} class="image-preview" />
        <div class="image-info">
          <span class="filename">{filename}</span>
          <span class="filesize">{formatFileSize(fileSize)}</span>
        </div>
      </div>

      <!-- Video -->
    {:else if isVideo}
      <div class="attachment-video">
        <video controls preload="metadata" on:error={handleVideoError} class="video-preview">
          <source src={mediaUrl} type={fileType} />
          <track kind="captions" src="" label="Subtítulos no disponibles" />
          Tu navegador no soporta el elemento video.
        </video>
        <div class="video-info">
          <span class="filename">{filename}</span>
          <span class="filesize">{formatFileSize(fileSize)}</span>
        </div>
      </div>

      <!-- Audio -->
    {:else if isAudio}
      <div class="attachment-audio">
        <audio controls preload="metadata" on:error={handleAudioError} class="audio-player">
          <source src={mediaUrl} type={fileType} />
          Tu navegador no soporta el elemento audio.
        </audio>
        <div class="audio-info">
          <span class="filename">{filename}</span>
          <span class="filesize">{formatFileSize(fileSize)}</span>
        </div>
      </div>

      <!-- Documento -->
    {:else if isDocument}
      <div class="attachment-document">
        <div class="document-preview">
          <span class="document-icon">📄</span>
          <div class="document-info">
            <span class="filename">{filename}</span>
            <span class="filesize">{formatFileSize(fileSize)}</span>
          </div>
        </div>
        <button
          type="button"
          class="download-button"
          on:click={handleDownload}
          title="Descargar archivo"
        >
          📥 Descargar
        </button>
      </div>

      <!-- Archivo genérico -->
    {:else}
      <div class="attachment-generic">
        <div class="generic-preview">
          <span class="generic-icon">📎</span>
          <div class="generic-info">
            <span class="filename">{filename}</span>
            <span class="filesize">{formatFileSize(fileSize)}</span>
          </div>
        </div>
        <button
          type="button"
          class="download-button"
          on:click={handleDownload}
          title="Descargar archivo"
        >
          📥 Descargar
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .attachment-container {
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
  }

  .attachment-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    color: #6c757d;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .attachment-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
  }

  .error-icon {
    font-size: 1.2rem;
  }

  .error-text {
    font-size: 0.9rem;
  }

  /* Imagen */
  .attachment-image {
    display: flex;
    flex-direction: column;
  }

  .image-preview {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .image-info {
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-top: 1px solid #e9ecef;
  }

  /* Video */
  .attachment-video {
    display: flex;
    flex-direction: column;
  }

  .video-preview {
    max-width: 100%;
    max-height: 300px;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .video-info {
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-top: 1px solid #e9ecef;
  }

  /* Audio */
  .attachment-audio {
    padding: 1rem;
    background: #fff;
  }

  .audio-player {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .audio-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #6c757d;
  }

  /* Documento */
  .attachment-document {
    padding: 1rem;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .document-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .document-icon {
    font-size: 2rem;
  }

  .document-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Genérico */
  .attachment-generic {
    padding: 1rem;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .generic-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .generic-icon {
    font-size: 2rem;
  }

  .generic-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Común */
  .filename {
    font-weight: 500;
    color: #212529;
    word-break: break-all;
  }

  .filesize {
    font-size: 0.8rem;
    color: #6c757d;
  }

  .download-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .download-button:hover {
    background: #0056b3;
  }

  .download-button:active {
    background: #004085;
  }
</style>
