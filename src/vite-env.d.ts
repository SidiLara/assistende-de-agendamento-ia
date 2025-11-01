// FIX: The reference to vite/client was causing a build error and has been removed.
// Per coding guidelines, we are switching to process.env.API_KEY,
// so vite client types for import.meta.env are no longer needed.
// We will define types for process.env instead to provide type safety for the API key.

// FIX: `declare var process` caused a redeclaration error with existing Node.js types.
// The correct way to augment the `process.env` type is to extend the `NodeJS.ProcessEnv` interface.
// This merges our custom environment variable types with the global process types.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

// FIX: Add declaration for Facebook Pixel function to avoid TypeScript errors.
interface Window {
  fbq?(...args: any[]): void;
}
