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
        <div class="doc-icon">📄</div>
        <div class="doc-info">
          <span class="filename">{filename}</span>
          <span class="filesize">{formatFileSize(fileSize)}</span>
          <button class="download" on:click={handleDownload} aria-label="Descargar"
            >Descargar</button
          >
        </div>
      </div>
    {:else}
      <div class="attachment-generic">
        <div class="generic-icon">📎</div>
        <div class="generic-info">
          <span class="filename">{filename}</span>
          <span class="filesize">{formatFileSize(fileSize)}</span>
          <button class="download" on:click={handleDownload} aria-label="Descargar"
            >Descargar</button
          >
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .attachment-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .attachment-loading,
  .attachment-error {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .image-preview {
    max-width: 240px;
    max-height: 240px;
    object-fit: cover;
    border-radius: 8px;
  }
  .attachment-image .image-info,
  .attachment-video .video-info,
  .attachment-audio .audio-info,
  .attachment-document .doc-info,
  .attachment-generic .generic-info {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .download {
    background: #007bff;
    color: #fff;
    border: none;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
