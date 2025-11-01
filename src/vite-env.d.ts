/// <reference types="vite/client" />

interface ImportMetaEnv {
  // FIX: Removed VITE_GEMINI_API_KEY as it is no longer used.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  fbq?(...args: any[]): void;
}