declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

interface Window {
  fbq?(...args: any[]): void;
}
