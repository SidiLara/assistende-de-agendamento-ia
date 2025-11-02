// This file provides TypeScript definitions for environment variables and other globals.

// This declaration makes TypeScript aware of `process.env.API_KEYS`.
// For local development, this variable is injected by Vite's `define` config (`vite.config.ts`)
// using the value from `VITE_GEMINI_API_KEYS` in the `.env` file.
// In the AI Studio deployment environment, `process.env.API_KEYS` is provided at runtime.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEYS: string;
    VITE_GEMINI_API_KEYS: string;
  }
}


interface Window {
  fbq?(...args: any[]): void;
}
