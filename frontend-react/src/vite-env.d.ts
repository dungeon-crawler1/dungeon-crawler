// =============================================================================
// DEFINICIÓN DE TIPOS GLOBAL PARA VITE Y TYPESCRIPT (0 any)
// =============================================================================
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}