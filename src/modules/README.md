# 📁 ESTRUCTURA DE MÓDULOS - UTALK

## 🎯 Propósito
Esta carpeta contiene todos los módulos de la aplicación organizados de forma modular y escalable.

## 📂 Estructura Planificada

```
src/modules/
├── chat/                    # ✅ IMPLEMENTADO
│   ├── components/          # Componentes del chat
│   ├── hooks/              # Hooks específicos del chat
│   ├── services/           # Servicios del chat
│   └── types/              # Tipos específicos del chat
├── contacts/               # 🔄 PENDIENTE
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── analytics/              # 🔄 PENDIENTE
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── settings/               # 🔄 PENDIENTE
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── dashboard/              # 🔄 PENDIENTE
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

## 🚀 Convenciones

### Nomenclatura
- **Carpetas**: minúsculas con guiones (`kebab-case`)
- **Archivos**: PascalCase para componentes, camelCase para otros
- **Componentes**: Sufijo `Module` para el componente principal

### Estructura de Módulo
Cada módulo debe seguir esta estructura:

```typescript
// Módulo principal
export const ContactsModule = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">Contactos</h1>
      </div>
      <div className="flex-1 p-6">
        {/* Contenido del módulo */}
      </div>
    </div>
  );
};
```

### Integración con Store
Cada módulo debe:
1. Usar el store global para estado compartido
2. Tener su propio estado local si es necesario
3. Exportar hooks específicos del módulo

## 📝 Notas de Implementación

- **NO crear módulos nuevos** hasta que se solicite
- **Mantener compatibilidad** con el sistema actual
- **Usar lazy loading** para módulos grandes
- **Documentar** cada módulo implementado

## 🔗 Integración con MainLayout

Los módulos se renderizan condicionalmente en `MainLayout.tsx`:

```typescript
{currentModule === 'contacts' && <ContactsModule />}
{currentModule === 'analytics' && <AnalyticsModule />}
// etc...
``` 