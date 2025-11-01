declare namespace NodeJS {
  interface ProcessEnv {
    GEMINI_API_KEY: string;
  }
}

interface Window {
  fbq?(...args: any[]): void;
}