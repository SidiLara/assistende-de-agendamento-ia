// Fix: Add type definition for process.env.API_KEY to support @google/genai guidelines
// without causing TypeScript errors.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_KEY?: string;
    }
  }
}

// Este arquivo é mantido para futuras declarações de tipos globais, se necessário.
// A tipagem de variáveis de ambiente foi movida para vite-env.d.ts
export {};
