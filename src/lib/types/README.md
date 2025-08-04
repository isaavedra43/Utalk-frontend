# 🏷️ Types

Esta carpeta contiene las **definiciones de tipos TypeScript** compartidas en la aplicación.

## 📋 Propósito

Los tipos definen:

- Interfaces para datos del backend
- Tipos para componentes y props
- Tipos para eventos y callbacks
- Enums y constantes tipadas
- Utilitarios de tipos

## 📁 Estructura Recomendada

```
types/
├── api.ts          # Tipos de respuestas del API
├── auth.ts         # Tipos de autenticación
├── chat.ts         # Tipos de chat y mensajería
├── user.ts         # Tipos de usuario
├── ui.ts           # Tipos de UI y componentes
├── events.ts       # Tipos de eventos WebSocket
└── index.ts        # Exports principales
```

## 🔧 Convenciones

- Interfaces para objetos complejos
- Types para uniones y literales
- Enums para constantes agrupadas
- Prefijo `I` para interfaces cuando sea necesario
- Sufijo `Type` para types de unión

## 📝 Ejemplo

```typescript
// chat.ts
export interface Message {
  id: string;
  content: string;
  authorId: string;
  conversationId: string;
  timestamp: Date;
  type: MessageType;
  status: MessageStatus;
}

export type MessageType = 'text' | 'image' | 'file' | 'audio';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Conversation {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```
