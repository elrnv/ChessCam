/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LICHESS_CLIENT_ID?: string;
  readonly VITE_LICHESS_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
