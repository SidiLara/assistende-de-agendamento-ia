// This file is used to provide a type definition for the 'process' object,
// which is available in the AI Studio environment but not declared in a default
// browser-targeted TypeScript project. This resolves the TS2580 build error.

// FIX: The `declare var process` block was removed from this file to resolve a
// "Cannot redeclare block-scoped variable" error. The `process` global is
// already defined in the environment, so only the `NodeJS.ProcessEnv` interface
// needs to be augmented to add type support for `process.env.API_KEY`.

// Declares the NodeJS namespace which is used by the process declaration.
declare namespace NodeJS {
  // Extends the ProcessEnv interface to include our specific API_KEY.
  interface ProcessEnv {
    API_KEY: string;
  }
}
