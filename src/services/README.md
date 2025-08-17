# ClientProfileService - Documentación

## Descripción
Servicio para obtener información completa del cliente desde el backend de Utalk.

## Endpoints Utilizados

### 1. Obtener Conversación (incluye datos básicos del cliente)
```
GET /api/conversations/:conversationId
```

### 2. Buscar Contacto por Teléfono
```
GET /api/contacts/search?phone=+5214773790184
```

### 3. Obtener Contacto por ID
```
GET /api/contacts/:contactId
```

### 4. Listar Contactos
```
GET /api/contacts?page=1&limit=20&tags=VIP&q=search
```

### 5. Estadísticas de Contactos
```
GET /api/contacts/stats?period=30d
```

## Métodos Disponibles

### getCompleteClientProfile(conversationId: string)
Obtiene el perfil completo del cliente basado en una conversación.

**Estrategia de obtención:**
1. Obtiene información de la conversación (incluye datos básicos del cliente)
2. Intenta obtener información detallada del contacto por teléfono
3. Si falla, intenta obtener por ID del contacto
4. Si todo falla, usa datos de la conversación como fallback

**Ejemplo de uso:**
```typescript
import { clientProfileService } from './clientProfile';

const profile = await clientProfileService.getCompleteClientProfile('conv_+5214775211021_+5214793176502');
```

### getContactById(contactId: string)
Obtiene un contacto específico por su ID.

### searchContactByPhone(phone: string)
Busca un contacto por número de teléfono.

### getContactsList(filters)
Lista todos los contactos con filtros opcionales.

### getContactStats(period)
Obtiene estadísticas de contactos para un período específico.

## Estructura de Respuesta

### ClientProfile
```typescript
interface ClientProfile {
  // Información básica
  name: string;
  phone: string;
  status: string;
  channel: string;
  
  // Información de contacto
  lastContact: string;
  clientSince: string;
  whatsappId: string;
  
  // Etiquetas
  tags: string[];
  
  // Información de conversación
  conversation: {
    status: string;
    priority: string;
    unreadMessages: number;
    assignedTo: string;
  };
  
  // Información adicional del contacto
  contactDetails?: ContactData;
}
```

## Manejo de Errores

El servicio maneja automáticamente:
- Errores de red
- Respuestas 404 (conversación no encontrada)
- Respuestas 500 (error del servidor)
- Datos faltantes

En caso de error, devuelve `null` o datos mock para desarrollo.

## Ejemplo Completo

```typescript
import { clientProfileService } from './clientProfile';

// Obtener perfil completo del cliente
const loadClientProfile = async (conversationId: string) => {
  try {
    const profile = await clientProfileService.getCompleteClientProfile(conversationId);
    
    if (profile) {
      console.log('Perfil del cliente:', profile);
      return profile;
    } else {
      console.log('No se pudo obtener el perfil del cliente');
      return null;
    }
  } catch (error) {
    console.error('Error cargando perfil del cliente:', error);
    return null;
  }
};
``` 