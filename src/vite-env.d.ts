declare namespace NodeJS {
  interface ProcessEnv {
    // FIX: Use API_KEY to align with coding guidelines.
    API_KEY: string;
  }
}

interface Window {
  fbq?(...args: any[]): void;
}