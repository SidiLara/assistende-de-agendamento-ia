// This file provides TypeScript definitions for environment variables and other globals.

// This declaration makes TypeScript aware of `process.env.API_KEY`.
// For local development, this variable is injected by Vite's `define` config (`vite.config.ts`)
// using the value from `VITE_GEMINI_API_KEY` in the `.env` file.
// In the AI Studio deployment environment, `process.env.API_KEY` is provided at runtime.
// FIX: Replaced `declare var process` with namespace augmentation to avoid redeclaration errors
// and added VITE_GEMINI_API_KEY to fix type errors in vite.config.ts.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    VITE_GEMINI_API_KEY: string;
  }
}


interface Window {
  fbq?(...args: any[]): void;
}
