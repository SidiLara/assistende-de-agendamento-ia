// This file is used to provide a type definition for the 'process' object,
// which is available in the AI Studio environment but not declared in a default
// browser-targeted TypeScript project. This resolves the TS2580 build error.

// Fix: Augment the existing NodeJS namespace to add the API_KEY property to ProcessEnv.
// This avoids redeclaring the 'process' variable, which can conflict with
// global types provided by the build environment (e.g., Vite).
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
