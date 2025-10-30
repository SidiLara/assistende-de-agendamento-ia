// This file defines global types available in the AI Studio environment.
// It prevents TypeScript errors for environment-provided variables like `process`.

// By declaring `process` on the `Window` interface, we avoid conflicts
// with Node.js global types and accurately model how environment variables
// are exposed in the browser-based AI Studio context.
declare global {
  interface Window {
    // The `process` object is provided by the AI Studio environment.
    process: {
      env: {
        // The API_KEY is injected by the environment for Gemini API access.
        API_KEY: string;
      };
    };
  }
}

// This export statement is necessary to make this file a module,
// which allows `declare global` to work correctly.
export {};
