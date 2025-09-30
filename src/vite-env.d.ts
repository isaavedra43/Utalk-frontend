/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Extensión de Window para variables globales de permisos
declare global {
  interface Window {
    __permissionsFallbackLogged?: boolean;
    __noModulesAccessibleLogged?: boolean;
    __invalidPermissionStructureLogged?: boolean;
    exportLogs?: (format: string) => void;
  }
}
