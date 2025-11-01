// FIX: Removed 'vite/client' type reference to resolve "Cannot find type definition file" error. This is not needed as the application does not use `import.meta.env`.

interface ImportMetaEnv {
  // FIX: Removed VITE_GEMINI_API_KEY as it is no longer used.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  fbq?(...args: any[]): void;
}