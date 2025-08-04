# 📦 Stores

Esta carpeta contiene los **stores de Svelte** para el manejo del estado global de la aplicación.

## 📋 Propósito

Los stores se utilizan para:

- Estado global compartido entre componentes
- Datos de usuario autenticado
- Configuraciones de la aplicación
- Estado de UI (modales, notificaciones, etc.)

## 📁 Estructura Recomendada

```
stores/
├── auth.ts          # Estado de autenticación
├── user.ts          # Datos del usuario actual
├── notifications.ts # Sistema de notificaciones
├── ui.ts           # Estado de la interfaz
└── chat.ts         # Estado del chat en tiempo real
```

## 🔧 Convenciones

- Usar `writable` para estado mutable
- Usar `readable` para estado de solo lectura
- Usar `derived` para estado computado
- Prefijo `$` para stores reactivos en componentes
- TypeScript para todos los stores

## 📝 Ejemplo

```typescript
// auth.ts
import { writable } from 'svelte/store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const authStore = writable<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false
});
```
