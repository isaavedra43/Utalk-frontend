/// <reference types="vite/client" />

// Extensión de Window para variables globales de permisos
declare global {
  interface Window {
    __permissionsFallbackLogged?: boolean;
    __noModulesAccessibleLogged?: boolean;
    __invalidPermissionStructureLogged?: boolean;
    exportLogs?: (format: string) => void;
  }
}
