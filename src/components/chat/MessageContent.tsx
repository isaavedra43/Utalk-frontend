import React, { useState } from 'react';
import { Download, Play, Pause, Volume2 } from 'lucide-react';
import type { Message } from '../../types';
import { fileUploadService } from '../../services/fileUpload';

interface MessageContentProps {
  message: Message;
}

export const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleAudioPlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = message.content;
    link.download = message.metadata.fileName || 'archivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTextContent = () => (
    <p className="message-content whitespace-pre-wrap">{message.content}</p>
  );

  const renderImageContent = () => (
    <div className="relative group">
      <img 
        src={message.content} 
        alt="Imagen" 
        className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(message.content, '_blank')}
        onError={(e) => {
          // Fallback si la imagen no carga
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODguOTU0MyA2OC45NTQzIDgwIDgwIDgwQzgxLjA5NDUgODAgODIuMTY4OSA4MC4wMzQ3IDgzLjIyMjcgODAuMTA0MUM4NC4yNzY1IDgwLjE3MzUgODUuMzA5OSA4MC4yODc5IDg2LjMyMjMgODAuNDQ3M0M4Ny4zMzQ3IDgwLjYwNjcgODguMzI2MSA4MC44MTA5IDg5LjI5NjUgODEuMDU5OEM5MC4yNjY5IDgxLjMwODcgOTEuMjE2MyA4MS42MDE5IDkyLjE0NDcgODIuMDM5M0M5My4wNzMxIDgyLjQ3NjcgOTMuOTgwNSA4Mi45NTc5IDk0Ljg2NjkgODMuNDgyN0M5NS43NTMzIDg0LjAwNzUgOTYuNjE4NyA4NC41NzU5IDk3LjQ2MjEgODUuMTg3OEM5OC4zMDU1IDg1Ljc5OTcgOTkuMTI3OSA4Ni40NTQ5IDk5LjkyOTMgODcuMTUzNEMxMDAuNzMwNyA4Ny44NTE5IDEwMS41MTEyIDg4LjU5MzUgMTAyLjI2MDUgODkuMzY3OEMxMDMuMDA5OSA5MC4xNDIxIDEwMy43MzgzIDkwLjk1ODUgMTA0LjQ0NTcgOTEuODE2N0MxMDUuMTUzMSA5Mi42NzQ5IDEwNS44Mzk1IDkzLjU3NDUgMTA2LjUwNDkgOTQuNTE1NEMxMDcuMTcwMyA5NS40NTYzIDEwNy44MTQ3IDk2LjQzODIgMTA4LjQzODEgOTcuNDYwOEMxMDkuMDYxNSA5OC40ODM0IDEwOS42NjM5IDk5LjU0NjIgMTEwLjI0NTMgMTAwLjY0ODlDMTEwLjgyNjcgMTAxLjc1MTYgMTExLjM4NzEgMTAyLjg5NDEgMTExLjkyNjUgMTA0LjA3NjFDMTEyLjQ2NTkgMTA1LjI1ODEgMTEyLjk4NDMgMTA2LjQ3OTcgMTEzLjQ4MTcgMTA3Ljc0MDdDMTEzLjk3OTEgMTA5LjAwMTcgMTE0LjQ1NTUgMTEwLjMwMTEgMTE0LjkxMDkgMTExLjYzODdDMTE1LjM2NjMgMTEyLjk3NjMgMTE1Ljc5OTcgMTE0LjM1MTkgMTE2LjIxMjEgMTE1Ljc2NTNDMTE2LjYyNDUgMTE3LjE3ODcgMTE3LjAxNTkgMTE4LjYzMDEgMTE3LjM4NjMgMTIwLjEyMDNDMTE3Ljc1NjcgMTIxLjYxMDUgMTE4LjEwNjEgMTIzLjEzODcgMTE4LjQzNDUgMTI0LjcwNTdDMTE4Ljc2MjkgMTI2LjI3MjcgMTE5LjA3MDMgMTI3Ljg3ODUgMTE5LjM1NjcgMTI5LjUyM0MxMTkuNjQzMSAxMzEuMTY3NSAxMTkuOTA4NSAxMzIuODQwNyAxMjAuMTUyOSAxMzQuNTQyN0MxMjAuMzk3MyAxMzYuMjQ0NyAxMjAuNjIwNyAxMzcuOTc1NSAxMjAuODIzMSAxMzkuNzM1MUMxMjEuMDI1NSAxNDEuNDk0NyAxMjEuMjA2OSAxNDMuMjgzOSAxMjEuMzY3MyAxNDUuMTAzN0MxMjEuNTI3NyAxNDYuOTIzNSAxMjEuNjY3MSAxNDguNzcyOSAxMjEuNzg1NSAxNTAuNjQxOUMxMjEuOTAzOSAxNTIuNTExIDEyMi4wMDEzIDE1NC40MDg3IDEyMi4wNzc3IDE1Ni4zMzQ5QzEyMi4xNTQxIDE1OC4yNjExIDEyMi4yMDk1IDE2MC4yMTU5IDEyMi4yNDM5IDE2Mi4xOTgzQzEyMi4yNzgzIDE2NC4xODA3IDEyMi4yOTE3IDE2Ni4xODk3IDEyMi4yODQxIDE2OC4yMjUzQzEyMi4yNzY1IDE3MC4yNjA5IDEyMi4yNDc5IDE3Mi4zMjMxIDEyMi4xOTgzIDE3NC40MTE5QzEyMi4xNDg3IDE3Ni40OTk5IDEyMi4wNzgxIDE3OC42MTQ1IDEyMS45ODY1IDE4MC43NTU3QzEyMS44OTQ5IDE4Mi44OTY5IDEyMS43ODIzIDE4NS4wNjQ3IDEyMS42NDg3IDE4Ny4yNTkxQzEyMS41MTUxIDE4OS40NTM1IDEyMS4zNjA1IDE5MS42NzQ1IDEyMS4xODQ5IDE5My45MjExQzEyMS4wMDkzIDE5Ni4xNjc3IDEyMC44MTI3IDE5OC40MzA5IDEyMC41OTUxIDIwMC43MjA3QzEyMC4zNzc1IDIwMy4wMTA1IDEyMC4xMzg5IDIwNS4zMjY5IDExOS44NzkzIDIwNy42Njk5QzExOS42MTk3IDIwOS45OTk5IDExOS4zMzkxIDIxMi4zNTY1IDExOS4wMzc1IDIxNC43Mzk3QzExOC43MzU5IDIxNy4xMjI5IDExOC40MTMzIDIxOS41MzI3IDExOC4wNjk3IDIyMS45NjkxQzExOC43MjU5IDIyMS45NjkxIDExOS4zODIxIDIyMS45NjkxIDEyMC4wMzgzIDIyMS45NjkxQzEyMC42OTQ1IDIyMS45NjkxIDEyMS4zNTA3IDIyMS45NjkxIDEyMi4wMDY5IDIyMS45NjkxQzEyMi42NjMxIDIyMS45NjkxIDEyMy4zMTkzIDIyMS45NjkxIDEyMy45NzU1IDIyMS45NjkxQzEyNC42MzE3IDIyMS45NjkxIDEyNS4yODc5IDIyMS45NjkxIDEyNS45NDQxIDIyMS45NjkxQzEyNi42MDAzIDIyMS45NjkxIDEyNy4yNTY1IDIyMS45NjkxIDEyNy45MTI3IDIyMS45NjkxQzEyOC41Njg5IDIyMS45NjkxIDEyOS4yMjUxIDIyMS45NjkxIDEyOS44ODEzIDIyMS45NjkxQzEzMC41Mzc1IDIyMS45NjkxIDEzMS4xOTM3IDIyMS45NjkxIDEzMS44NDk5IDIyMS45NjkxQzEzMi41MDYxIDIyMS45NjkxIDEzMy4xNjIzIDIyMS45NjkxIDEzMy44MTg1IDIyMS45NjkxQzEzNC40NzQ3IDIyMS45NjkxIDEzNS4xMzA5IDIyMS45NjkxIDEzNS43ODcxIDIyMS45NjkxQzEzNi40NDMzIDIyMS45NjkxIDEzNy4wOTk1IDIyMS45NjkxIDEzNy43NTU3IDIyMS45NjkxQzEzOC40MTE5IDIyMS45NjkxIDEzOS4wNjgxIDIyMS45NjkxIDEzOS43MjQzIDIyMS45NjkxQzE0MC4zODA1IDIyMS45NjkxIDE0MS4wMzY3IDIyMS45NjkxIDE0MS42OTI5IDIyMS45NjkxQzE0Mi4zNDkxIDIyMS45NjkxIDE0My4wMDUzIDIyMS45NjkxIDE0My42NjE1IDIyMS45NjkxQzE0NC4zMTc3IDIyMS45NjkxIDE0NC45NzM5IDIyMS45NjkxIDE0NS42MzAxIDIyMS45NjkxQzE0Ni4yODYzIDIyMS45NjkxIDE0Ni45NDI1IDIyMS45NjkxIDE0Ny41OTg3IDIyMS45NjkxQzE0OC4yNTQ5IDIyMS45NjkxIDE0OC45MTExIDIyMS45NjkxIDE0OS41NjczIDIyMS45NjkxQzE1MC4yMjM1IDIyMS45NjkxIDE1MC44Nzk3IDIyMS45NjkxIDE1MS41MzU5IDIyMS45NjkxQzE1Mi4xOTIxIDIyMS45NjkxIDE1Mi44NDgzIDIyMS45NjkxIDE1My41MDQ1IDIyMS45NjkxQzE1NC4xNjA3IDIyMS45NjkxIDE1NC44MTY5IDIyMS45NjkxIDE1NS40NzMxIDIyMS45NjkxQzE1Ni4xMjkyIDIyMS45NjkxIDE1Ni43ODU0IDIyMS45NjkxIDE1Ny40NDE2IDIyMS45NjkxQzE1OC4wOTc4IDIyMS45NjkxIDE1OC43NTQgMjIxLjk2OTEgMTU5LjQxMDIgMjIxLjk2OTFDMTYwLjA2NjQgMjIxLjk2OTEgMTYwLjcyMjYgMjIxLjk2OTEgMTYxLjM3ODggMjIxLjk2OTFDMTYyLjAzNSAyMjEuOTY5MSAxNjIuNjkxMiAyMjEuOTY5MSAxNjMuMzQ3NCAyMjEuOTY5MUMxNjQuMDAzNiAyMjEuOTY5MSAxNjQuNjU5OCAyMjEuOTY5MSAxNjUuMzE2IDIyMS45NjkxQzE2NS45NzIyIDIyMS45NjkxIDE2Ni42Mjg0IDIyMS45NjkxIDE2Ny4yODQ2IDIyMS45NjkxQzE2Ny45NDA4IDIyMS45NjkxIDE2OC41OTcgMjIxLjk2OTEgMTY5LjI1MzIgMjIxLjk2OTFDMTY5LjkwOTQgMjIxLjk2OTEgMTcwLjU2NTYgMjIxLjk2OTEgMTcxLjIyMTggMjIxLjk2OTFDMTcxLjg3OCAyMjEuOTY5MSAxNzIuNTM0MiAyMjEuOTY5MSAxNzMuMTkwNCAyMjEuOTY5MUMxNzMuODQ2NiAyMjEuOTY5MSAxNzQuNTAyOCAyMjEuOTY5MSAxNzUuMTU5IDIyMS45NjkxQzE3NS44MTUyIDIyMS45NjkxIDE3Ni40NzE0IDIyMS45NjkxIDE3Ny4xMjc2IDIyMS45NjkxQzE3Ny43ODM4IDIyMS45NjkxIDE3OC40NCAyMjEuOTY5MSAxNzkuMDk2MiAyMjEuOTY5MUMxNzkuNzUyNCAyMjEuOTY5MSAxODAuNDA4NiAyMjEuOTY5MSAxODEuMDY0OCAyMjEuOTY5MUMxODEuNzIxIDIyMS45NjkxIDE4Mi4zNzcyIDIyMS45NjkxIDE4My4wMzM0IDIyMS45NjkxQzE4My42ODk2IDIyMS45NjkxIDE4NC4zNDU4IDIyMS45NjkxIDE4NS4wMDIgMjIxLjk2OTFDMTg1LjY1ODIgMjIxLjk2OTEgMTg2LjMxNDQgMjIxLjk2OTEgMTg2Ljk3MDYgMjIxLjk2OTFDMTg3LjYyNjggMjIxLjk2OTEgMTg4LjI4MyAyMjEuOTY5MSAxODguOTM5MiAyMjEuOTY5MUMxODkuNTk1NCAyMjEuOTY5MSAxOTAuMjUxNiAyMjEuOTY5MSAxOTAuOTA3OCAyMjEuOTY5MUMxOTEuNTY0IDIyMS45NjkxIDE5Mi4yMjAyIDIyMS45NjkxIDE5Mi44NzY0IDIyMS45NjkxQzE5My41MzI2IDIyMS45NjkxIDE5NC4xODg4IDIyMS45NjkxIDE5NC44NDUgMjIxLjk2OTFDMTk1LjUwMTIgMjIxLjk2OTEgMTk2LjE1NzQgMjIxLjk2OTEgMTk2LjgxMzYgMjIxLjk2OTFDMTk3LjQ2OTggMjIxLjk2OTEgMTk4LjEyNiAyMjEuOTY5MSAxOTguNzgyMiAyMjEuOTY5MUMxOTkuNDM4NCAyMjEuOTY5MSAyMDAuMDk0NiAyMjEuOTY5MSAyMDAuNzUwOCAyMjEuOTY5MUMyMDEuNDA3IDIyMS45NjkxIDIwMi4wNjMyIDIyMS45NjkxIDIwMi43MTk0IDIyMS45NjkxQzIwMy4zNzU2IDIyMS45NjkxIDIwNC4wMzE4IDIyMS45NjkxIDIwNC42ODggMjIxLjk2OTFDMjA1LjM0NDIgMjIxLjk2OTEgMjA2LjAwMDQgMjIxLjk2OTEgMjA2LjY1NjYgMjIxLjk2OTFDMjA3LjMxMjggMjIxLjk2OTEgMjA3Ljk2OSAyMjEuOTY5MSAyMDguNjI1MiAyMjEuOTY5MUMyMDkuMjgxNCAyMjEuOTY5MSAyMDkuOTM3NiAyMjEuOTY5MSAyMTAuNTkzOCAyMjEuOTY5MUMyMTEuMjUgMjIxLjk2OTEgMjExLjkwNjIgMjIxLjk2OTEgMjEyLjU2MjQgMjIxLjk2OTFDMjEzLjIxODYgMjIxLjk2OTEgMjEzLjg3NDggMjIxLjk2OTEgMjE0LjUzMSAyMjEuOTY5MUMyMTUuMTg3MiAyMjEuOTY5MSAyMTUuODQzNCAyMjEuOTY5MSAyMTYuNSAyMjEuOTY5MUMyMTcuMTU2MiAyMjEuOTY5MSAyMTcuODEyNCAyMjEuOTY5MSAyMTguNDY4NiAyMjEuOTY5MUMyMTkuMTI0OCAyMjEuOTY5MSAyMTkuNzgxIDIyMS45NjkxIDIyMC40MzcyIDIyMS45NjkxQzIyMS4wOTM0IDIyMS45NjkxIDIyMS43NDk2IDIyMS45NjkxIDIyMi40MDU4IDIyMS45NjkxQzIyMy4wNjIgMjIxLjk2OTEgMjIzLjcxODIgMjIxLjk2OTEgMjI0LjM3NDQgMjIxLjk2OTFDMjI1LjAzMDYgMjIxLjk2OTEgMjI1LjY4NjggMjIxLjk2OTEgMjI2LjM0MyAyMjEuOTY5MUMyMjYuOTk5MiAyMjEuOTY5MSAyMjcuNjU1NCAyMjEuOTY5MSAyMjguMzExNiAyMjEuOTY5MUMyMjguOTY3OCAyMjEuOTY5MSAyMjkuNjI0IDIyMS45NjkxIDIzMC4yODAyIDIyMS45NjkxQzIzMC45MzY0IDIyMS45NjkxIDIzMS41OTI2IDIyMS45NjkxIDIzMi4yNDg4IDIyMS45NjkxQzIzMi45MDUgMjIxLjk2OTEgMjMzLjU2MTIgMjIxLjk2OTEgMjM0LjIxNzQgMjIxLjk2OTFDMjM0Ljg3MzYgMjIxLjk2OTEgMjM1LjUyOTggMjIxLjk2OTEgMjM2LjE4NiAyMjEuOTY5MUMyMzYuODQyMiAyMjEuOTY5MSAyMzcuNDk4NCAyMjEuOTY5MSAyMzguMTU0NiAyMjEuOTY5MUMyMzguODExIDIyMS45NjkxIDIzOS40NjcyIDIyMS45NjkxIDI0MC4xMjM0IDIyMS45NjkxQzI0MC43Nzk2IDIyMS45NjkxIDI0MS40MzU4IDIyMS45NjkxIDI0Mi4wOTIgMjIxLjk2OTFDMjQyLjc0ODIgMjIxLjk2OTEgMjQzLjQwNDQgMjIxLjk2OTEgMjQ0LjA2MDYgMjIxLjk2OTFDMjQ0LjcxNjggMjIxLjk2OTEgMjQ1LjM3MyAyMjEuOTY5MSAyNDYuMDI5MiAyMjEuOTY5MUMyNDYuNjg1NCAyMjEuOTY5MSAyNDcuMzQxNiAyMjEuOTY5MSAyNDcuOTk3OCAyMjEuOTY5MUMyNDguNjU0IDIyMS45NjkxIDI0OS4zMTAyIDIyMS45NjkxIDI0OS45NjY0IDIyMS45NjkxQzI1MC42MjI2IDIyMS45NjkxIDI1MS4yNzg4IDIyMS45NjkxIDI1MS45MzUgMjIxLjk2OTFDMjUyLjU5MTIgMjIxLjk2OTEgMjUzLjI0NzQgMjIxLjk2OTEgMjUzLjkwMzYgMjIxLjk2OTFDMjU0LjU1OTggMjIxLjk2OTEgMjU1LjIxNiAyMjEuOTY5MSAyNTUuODcyMiAyMjEuOTY5MUMyNTYuNTI4NCAyMjEuOTY5MSAyNTcuMTg0NiAyMjEuOTY5MSAyNTcuODQwOCAyMjEuOTY5MUMyNTguNDk3IDIyMS45NjkxIDI1OS4xNTMyIDIyMS45NjkxIDI1OS44MDk0IDIyMS45NjkxQzI2MC40NjU2IDIyMS45NjkxIDI2MS4xMjE4IDIyMS45NjkxIDI2MS43NzggMjIxLjk2OTFDMjYyLjQzNDIgMjIxLjk2OTEgMjYzLjA5MDQgMjIxLjk2OTEgMjYzLjc0NjYgMjIxLjk2OTFDMjY0LjQwMjggMjIxLjk2OTEgMjY1LjA1OSAyMjEuOTY5MSAyNjUuNzE1MiAyMjEuOTY5MUMyNjYuMzcxNCAyMjEuOTY5MSAyNjcuMDI3NiAyMjEuOTY5MSAyNjcuNjgzOCAyMjEuOTY5MUMyNjguMzQgMjIxLjk2OTEgMjY4Ljk5NjIgMjIxLjk2OTEgMjY5LjY1MjQgMjIxLjk2OTFDMjcwLjMwODYgMjIxLjk2OTEgMjcwLjk2NDggMjIxLjk2OTEgMjcxLjYyMSAyMjEuOTY5MUMyNzIuMjc3MiAyMjEuOTY5MSAyNzIuOTMzNCAyMjEuOTY5MSAyNzMuNTg5NiAyMjEuOTY5MUMyNzQuMjQ1OCAyMjEuOTY5MSAyNzQuOTAyIDIyMS45NjkxIDI3NS41NTgyIDIyMS45NjkxQzI3Ni4yMTQ0IDIyMS45NjkxIDI3Ni44NzA2IDIyMS45NjkxIDI3Ny41MjY4IDIyMS45NjkxQzI3OC4xODMgMjIxLjk2OTEgMjc4LjgzOTIgMjIxLjk2OTEgMjc5LjQ5NTQgMjIxLjk2OTFDMjgwLjE1MTYgMjIxLjk2OTEgMjgwLjgwNzggMjIxLjk2OTEgMjgxLjQ2NCAyMjEuOTY5MUMyODIuMTIwMiAyMjEuOTY5MSAyODIuNzc2NCAyMjEuOTY5MSAyODMuNDMyNiAyMjEuOTY5MUMyODQuMDg4OCAyMjEuOTY5MSAyODQuNzQ1IDIyMS45NjkxIDI4NS40MDExIDIyMS45NjkxQzI4Ni4wNTczIDIyMS45NjkxIDI4Ni43MTM1IDIyMS45NjkxIDI4Ny4zNjk3IDIyMS45NjkxQzI4OC4wMjU5IDIyMS45NjkxIDI4OC42ODIxIDIyMS45NjkxIDI4OS4zMzgyIDIyMS45NjkxQzI4OS45OTQ0IDIyMS45NjkxIDI5MC42NTA2IDIyMS45NjkxIDI5MS4zMDY4IDIyMS45NjkxQzI5MS45NjMgMjIxLjk2OTEgMjkyLjYxOTIgMjIxLjk2OTEgMjkzLjI3NTQgMjIxLjk2OTFDMjkzLjkzMTYgMjIxLjk2OTEgMjk0LjU4NzggMjIxLjk2OTEgMjk1LjI0NCAyMjEuOTY5MUMyOTUuOTAwMiAyMjEuOTY5MSAyOTYuNTU2NCAyMjEuOTY5MSAyOTcuMjEyNiAyMjEuOTY5MUMyOTcuODY4OCAyMjEuOTY5MSAyOTguNTI1IDIyMS45NjkxIDI5OS4xODExIDIyMS45NjkxQzI5OS44MzczIDIyMS45NjkxIDMwMC40OTM1IDIyMS45NjkxIDMwMS4xNDk3IDIyMS45NjkxQzMwMS44MDU5IDIyMS45NjkxIDMwMi40NjIxIDIyMS45NjkxIDMwMy4xMTgzIDIyMS45NjkxQzMwMy43NzQ1IDIyMS45NjkxIDMwNC40MzA3IDIyMS45NjkxIDMwNS4wODY5IDIyMS45NjkxQzMwNS43NDMxIDIyMS45NjkxIDMwNi4zOTkzIDIyMS45NjkxIDMwNy4wNTU1IDIyMS45NjkxQzMwNy43MTE3IDIyMS45NjkxIDMwOC4zNjc5IDIyMS45NjkxIDMwOS4wMjQxIDIyMS45NjkxQzMwOS42ODAzIDIyMS45NjkxIDMxMC4zMzY1IDIyMS45NjkxIDMxMC45OTI3IDIyMS45NjkxQzMxMS42NDg5IDIyMS45NjkxIDMxMi4zMDUxIDIyMS45NjkxIDMxMi45NjEzIDIyMS45NjkxQzMxMy42MTc1IDIyMS45NjkxIDMxNC4yNzM3IDIyMS45NjkxIDMxNC45Mjk5IDIyMS45NjkxQzMxNS41ODYxIDIyMS45NjkxIDMxNi4yNDIzIDIyMS45NjkxIDMxNi44OTg1IDIyMS45NjkxQzMxNy41NTQ3IDIyMS45NjkxIDMxOC4yMTA5IDIyMS45NjkxIDMxOC44NjcxIDIyMS45NjkxQzMxOS41MjMzIDIyMS45NjkxIDMyMC4xNzk1IDIyMS45NjkxIDMyMC44MzU3IDIyMS45NjkxQzMyMS40OTE5IDIyMS45NjkxIDMyMi4xNDgxIDIyMS45NjkxIDMyMi44MDQzIDIyMS45NjkxQzMyMy40NjA1IDIyMS45NjkxIDMyNC4xMTY3IDIyMS45NjkxIDMyNC43NzI5IDIyMS45NjkxQzMyNS40MjkxIDIyMS45NjkxIDMyNi4wODUzIDIyMS45NjkxIDMyNi43NDE1IDIyMS45NjkxQzMyNy4zOTc3IDIyMS45NjkxIDMyOC4wNTM5IDIyMS45NjkxIDMyOC43MTAxIDIyMS45NjkxQzMyOS4zNjYzIDIyMS45NjkxIDMzMC4wMjI1IDIyMS45NjkxIDMzMC42Nzg3IDIyMS45NjkxQzMzMS4zMzQ5IDIyMS45NjkxIDMzMS45OTExIDIyMS45NjkxIDMzMi42NDczIDIyMS45NjkxQzMzMy4zMDM1IDIyMS45NjkxIDMzMy45NTk3IDIyMS45NjkxIDMzNC42MTU5IDIyMS45NjkxQzMzNS4yNzIxIDIyMS45NjkxIDMzNS45MjgzIDIyMS45NjkxIDMzNi41ODQ1IDIyMS45NjkxQzMzNy4yNDA3IDIyMS45NjkxIDMzNy44OTY5IDIyMS45NjkxIDMzOC41NTMxIDIyMS45NjkxQzMzOS4yMDkzIDIyMS45NjkxIDMzOS44NjU1IDIyMS45NjkxIDM0MC41MjE3IDIyMS45NjkxQzM0MS4xNzc5IDIyMS45NjkxIDM0MS44MzQxIDIyMS45NjkxIDM0Mi40OTAzIDIyMS45NjkxQzM0My4xNDY1IDIyMS45NjkxIDM0My44MDI3IDIyMS45NjkxIDM0NC40NTg5IDIyMS45NjkxQzM0NS4xMTUxIDIyMS45NjkxIDM0NS43NzEzIDIyMS45NjkxIDM0Ni40Mjc1IDIyMS45NjkxQzM0Ny4wODM3IDIyMS45NjkxIDM0Ny43Mzk5IDIyMS45NjkxIDM0OC4zOTYxIDIyMS45NjkxQzM0OS4wNTIzIDIyMS45NjkxIDM0OS43MDg1IDIyMS45NjkxIDM1MC4zNjQ3IDIyMS45NjkxQzM1MS4wMjA5IDIyMS45NjkxIDM1MS42NzcxIDIyMS45NjkxIDM1Mi4zMzMzIDIyMS45NjkxQzM1Mi45ODk1IDIyMS45NjkxIDM1My42NDU3IDIyMS45NjkxIDM1NC4zMDE5IDIyMS45NjkxQzM1NC45NTgxIDIyMS45NjkxIDM1NS42MTQzIDIyMS45NjkxIDM1Ni4yNzA1IDIyMS45NjkxQzM1Ni45MjY3IDIyMS45NjkxIDM1Ny41ODI5IDIyMS45NjkxIDM1OC4yMzkxIDIyMS45NjkxQzM1OC44OTUzIDIyMS45NjkxIDM1OS41NTE1IDIyMS45NjkxIDM2MC4yMDc3IDIyMS45NjkxQzM2MC44NjM5IDIyMS45NjkxIDM2MS41MjAxIDIyMS45NjkxIDM2Mi4xNzYzIDIyMS45NjkxQzM2Mi44MzI1IDIyMS45NjkxIDM2My40ODg3IDIyMS45NjkxIDM2NC4xNDQ5IDIyMS45NjkxQzM2NC44MDExIDIyMS45NjkxIDM2NS40NTczIDIyMS45NjkxIDM2Ni4xMTM1IDIyMS45NjkxQzM2Ni43Njk3IDIyMS45NjkxIDM2Ny40MjU5IDIyMS45NjkxIDM2OC4wODIxIDIyMS45NjkxQzM2OC43MzgzIDIyMS45NjkxIDM2OS4zOTQ1IDIyMS45NjkxIDM3MC4wNTA3IDIyMS45NjkxQzM3MC43MDY5IDIyMS45NjkxIDM3MS4zNjMxIDIyMS45NjkxIDM3Mi4wMTkzIDIyMS45NjkxQzM3Mi42NzU1IDIyMS45NjkxIDM3My4zMzE3IDIyMS45NjkxIDM3My45ODc5IDIyMS45NjkxQzM3NC42NDQxIDIyMS45NjkxIDM3NS4zMDAzIDIyMS45NjkxIDM3NS45NTY1IDIyMS45NjkxQzM3Ni42MTI3IDIyMS45NjkxIDM3Ny4yNjg5IDIyMS45NjkxIDM3Ny45MjUxIDIyMS45NjkxQzM3OC41ODEzIDIyMS45NjkxIDM3OS4yMzc1IDIyMS45NjkxIDM3OS44OTM3IDIyMS45NjkxQzM4MC41NDk5IDIyMS45NjkxIDM4MS4yMDYxIDIyMS45NjkxIDM4MS44NjIzIDIyMS45NjkxQzM4Mi41MTg1IDIyMS45NjkxIDM4My4xNzQ3IDIyMS45NjkxIDM4My44MzA5IDIyMS45NjkxQzM4NC40ODcxIDIyMS45NjkxIDM4NS4xNDMzIDIyMS45NjkxIDM4NS43OTk1IDIyMS45NjkxQzM4Ni40NTU3IDIyMS45NjkxIDM4Ny4xMTE5IDIyMS45NjkxIDM4Ny43NjgxIDIyMS45NjkxQzM4OC40MjQzIDIyMS45NjkxIDM4OS4wODA1IDIyMS45NjkxIDM4OS43MzY3IDIyMS45NjkxQzM5MC4zOTI5IDIyMS45NjkxIDM5MS4wNDkxIDIyMS45NjkxIDM5MS43MDUzIDIyMS45NjkxQzM5Mi4zNjE1IDIyMS45NjkxIDM5My4wMTc3IDIyMS45NjkxIDM5My42NzM5IDIyMS45NjkxQzM5NC4zMzAxIDIyMS45NjkxIDM5NC45ODYzIDIyMS45NjkxIDM5NS42NDI1IDIyMS45NjkxQzM5Ni4yOTg3IDIyMS45NjkxIDM5Ni45NTQ5IDIyMS45NjkxIDM5Ny42MTExIDIyMS45NjkxQzM5OC4yNjczIDIyMS45NjkxIDM5OC45MjM1IDIyMS45NjkxIDM5OS41Nzk3IDIyMS45NjkxQzQwMC4yMzU5IDIyMS45NjkxIDQwMC44OTIxIDIyMS45NjkxIDQwMS41NDgzIDIyMS45NjkxQzQwMi4yMDQ1IDIyMS45NjkxIDQwMi44NjA3IDIyMS45NjkxIDQwMy41MTY5IDIyMS45NjkxQzQwNC4xNzMxIDIyMS45NjkxIDQwNC44MjkyIDIyMS45NjkxIDQwNS40ODU0IDIyMS45NjkxQzQwNi4xNDE2IDIyMS45NjkxIDQwNi43OTc4IDIyMS45NjkxIDQwNy40NTQgMjIxLjk2OTFDNDA4LjExMDIgMjIxLjk2OTEgNDA4Ljc2NjQgMjIxLjk2OTEgNDA5LjQyMjYgMjIxLjk2OTFDNDEwLjA3ODggMjIxLjk2OTEgNDEwLjczNSAyMjEuOTY5MSA0MTEuMzkxMiAyMjEuOTY5MUM0MTIuMDQ3NCAyMjEuOTY5MSA0MTIuNzAzNiAyMjEuOTY5MSA0MTMuMzU5OCAyMjEuOTY5MUM0MTQuMDI2IDIyMS45NjkxIDQxNC42ODIyIDIyMS45NjkxIDQxNS4zMzg0IDIyMS45NjkxQzQxNS45OTQ2IDIyMS45NjkxIDQxNi42NTA4IDIyMS45NjkxIDQxNy4zMDcgMjIxLjk2OTFDNDE3Ljk2MzIgMjIxLjk2OTEgNDE4LjYxOTQgMjIxLjk2OTEgNDE5LjI3NTYgMjIxLjk2OTFDNDE5LjkzMTggMjIxLjk2OTEgNDIwLjU4OCAyMjEuOTY5MSA0MjEuMjQ0MiAyMjEuOTY5MUM0MjEuOTAwNCAyMjEuOTY5MSA0MjIuNTU2NiAyMjEuOTY5MSA0MjMuMjEyOCAyMjEuOTY5MUM0MjMuODY5IDIyMS45NjkxIDQyNC41MjUyIDIyMS45NjkxIDQyNS4xODE0IDIyMS45NjkxQzQyNS44Mzc2IDIyMS45NjkxIDQyNi40OTM4IDIyMS45NjkxIDQyNy4xNSAyMjEuOTY5MUM0MjcuODA2MiAyMjEuOTY5MSA0MjguNDYyNCAyMjEuOTY5MSA0MjkuMTE4NiAyMjEuOTY5MUM0MjkuNzc0OCAyMjEuOTY5MSA0MzAuNDMxIDIyMS45NjkxIDQzMS4wODcyIDIyMS45NjkxQzQzMS43NDM0IDIyMS45NjkxIDQzMi4zOTk2IDIyMS45NjkxIDQzMy4wNTU4IDIyMS45NjkxQzQzMy43MTIgMjIxLjk2OTEgNDM0LjM2ODIgMjIxLjk2OTEgNDM1LjAyNDQgMjIxLjk2OTFDNDM1LjY4MDYgMjIxLjk2OTEgNDM2LjMzNjggMjIxLjk2OTEgNDM2Ljk5MyAyMjEuOTY5MUM0MzcuNjQ5MiAyMjEuOTY5MSA0MzguMzA1NCAyMjEuOTY5MSA0MzguOTYxNiAyMjEuOTY5MUM0MzkuNjE3OCAyMjEuOTY5MSA0NDAuMjczOSAyMjEuOTY5MSA0NDAuOTMwMSAyMjEuOTY5MUM0NDEuNTg2MyAyMjEuOTY5MSA0NDIuMjQyNSAyMjEuOTY5MSA0NDIuODk4NyAyMjEuOTY5MUM0NDMuNTU0OSAyMjEuOTY5MSA0NDQuMjExMSAyMjEuOTY5MSA0NDQuODY3MyAyMjEuOTY5MUM0NDUuNTIzNSAyMjEuOTY5MSA0NDYuMTc5NyAyMjEuOTY5MSA0NDYuODM1OSAyMjEuOTY5MUw0NDYuODM1OSAyMjEuOTY5MVoiIGZpbGw9IiNEM0Q0RjYiLz4KPC9zdmc+';
          target.alt = 'Imagen no disponible';
        }}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
          title="Descargar imagen"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDocumentContent = () => {
    const fileName = message.metadata.fileName || 'Documento';
    const fileSize = message.metadata.fileSize ? fileUploadService.formatFileSize(message.metadata.fileSize) : '';
    const fileIcon = fileUploadService.getFileIcon(fileName);

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <div className="text-2xl">{fileIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="Descargar documento"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderAudioContent = () => {
    const fileName = message.metadata.fileName || 'Audio';
    const duration = message.metadata.duration || 0;
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <button
          onClick={handleAudioPlay}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{fileName}</p>
          <p className="text-xs text-gray-500">{formatDuration(duration)}</p>
        </div>
        <Volume2 className="w-4 h-4 text-gray-400" />
        <audio
          ref={(el) => setAudioElement(el)}
          src={message.content}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      </div>
    );
  };

  const renderVideoContent = () => {
    const fileName = message.metadata.fileName || 'Video';
    const duration = message.metadata.duration || 0;
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="relative group">
        <video 
          src={message.content}
          poster={message.metadata.thumbnail}
          className="max-w-full max-h-64 rounded-lg"
          controls
          preload="metadata"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
            title="Descargar video"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{fileName} • {formatDuration(duration)}</p>
      </div>
    );
  };

  const renderLocationContent = () => {
    try {
      const locationData = JSON.parse(message.content);
      return (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-900 mb-1">📍 Ubicación</p>
          {locationData.name && <p className="text-xs text-gray-600">{locationData.name}</p>}
          {locationData.address && <p className="text-xs text-gray-600">{locationData.address}</p>}
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`, '_blank')}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1"
          >
            Ver en Google Maps
          </button>
        </div>
      );
    } catch {
      return renderTextContent();
    }
  };

  const renderStickerContent = () => (
    <div className="flex justify-center">
      <img 
        src={message.content} 
        alt="Sticker" 
        className="max-w-32 max-h-32 rounded-lg"
      />
    </div>
  );

  // Renderizar contenido basado en el tipo
  switch (message.type) {
    case 'image':
      return renderImageContent();
    case 'document':
      return renderDocumentContent();
    case 'audio':
    case 'voice':
      return renderAudioContent();
    case 'video':
      return renderVideoContent();
    case 'location':
      return renderLocationContent();
    case 'sticker':
      return renderStickerContent();
    default:
      return renderTextContent();
  }
}; 