/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_NODE_ENV?: string;
  readonly VITE_ENABLE_DEMO_CREDENTIALS?: string;
  readonly VITE_ENABLE_POLLING?: string;
  readonly VITE_ENABLE_NOTIFICATIONS?: string;
  readonly VITE_POLLING_INTERVAL?: string;
  readonly VITE_MESSAGE_POLLING_INTERVAL?: string;
  readonly VITE_DASHBOARD_POLLING_INTERVAL?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_THEME?: string;
  readonly VITE_LANGUAGE?: string;
  readonly VITE_TIMEZONE?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly VITE_USE_RELATIVE_URLS?: string;
  // Vite built-in
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
