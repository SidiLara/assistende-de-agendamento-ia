// FIX: Removed the vite/client type reference to resolve the "Cannot find type definition file" error.
// The necessary types for import.meta.env are defined below.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEYS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  fbq?(...args: any[]): void;
}