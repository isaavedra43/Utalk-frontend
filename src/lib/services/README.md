# 🔌 Services

Esta carpeta contiene los **servicios** para comunicación con APIs, WebSocket y integraciones externas.

## 📋 Propósito

Los servicios manejan:

- Comunicación HTTP con el backend (REST)
- Conexiones WebSocket para tiempo real
- Integración con APIs externas
- Manejo de errores y reintentos
- Transformación de datos

## 📁 Estructura Recomendada

```
services/
├── api/
│   ├── auth.ts         # Servicios de autenticación
│   ├── messages.ts     # Servicios de mensajería
│   ├── users.ts        # Servicios de usuarios
│   └── conversations.ts # Servicios de conversaciones
├── websocket/
│   ├── socket.ts       # Cliente WebSocket
│   └── events.ts       # Eventos en tiempo real
├── external/
│   ├── twilio.ts       # Integración Twilio
│   └── firebase.ts     # Integración Firebase
└── index.ts           # Exports principales
```

## 🔧 Convenciones

- Usar Axios para peticiones HTTP
- Usar TanStack Query para cache y estado
- Usar Socket.IO client para WebSocket
- TypeScript para todas las interfaces
- Manejo consistente de errores

## 📝 Ejemplo

```typescript
// api/auth.ts
import axios from 'axios';
import { API_BASE_URL } from '$lib/constants';

interface LoginRequest {
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequest) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    return response.data;
  }
};
```
