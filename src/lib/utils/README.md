# 🛠️ Utils

Esta carpeta contiene **utilidades y helpers** reutilizables en toda la aplicación.

## 📋 Propósito

Las utilidades incluyen:

- Funciones de formateo y validación
- Helpers para fechas y números
- Utilidades de manipulación de strings
- Helpers de UI (clases CSS, etc.)
- Constantes y configuraciones locales

## 📁 Estructura Recomendada

```
utils/
├── date.ts         # Utilidades de fechas
├── format.ts       # Formateo de datos
├── validation.ts   # Validaciones del frontend
├── string.ts       # Manipulación de strings
├── css.ts          # Utilidades CSS/UI
├── file.ts         # Manejo de archivos
└── index.ts        # Exports principales
```

## 🔧 Convenciones

- Funciones puras sin efectos secundarios
- TypeScript estricto para todas las funciones
- JSDoc para documentación de funciones complejas
- Tests unitarios para todas las utilidades
- Nombres descriptivos y consistentes

## 📝 Ejemplo

```typescript
// date.ts
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Ahora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
```
