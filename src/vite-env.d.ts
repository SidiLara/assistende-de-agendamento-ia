/// <reference types="vite/client" />

// FIX: The reference to vite/client was causing a build error.
// Per coding guidelines, we are switching to process.env.API_KEY,
// so vite client types for import.meta.env are no longer needed.
// We will define types for process.env instead to provide type safety for the API key.
declare var process: {
  env: {
    API_KEY: string;
  }
};
