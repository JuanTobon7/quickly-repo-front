/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OTHER_VAR?: string;
  // agrega aquí más variables si las usás
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
