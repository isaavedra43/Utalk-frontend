/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_AUTH_DOMAIN: string
  readonly VITE_AUTH_AUDIENCE: string
  readonly VITE_NODE_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}