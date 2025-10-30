// Removed reference to "vite/client" to address the build error.
// The app now uses process.env.API_KEY as per @google/genai guidelines, so VITE_GEMINI_API_KEY is no longer needed here.

interface ImportMetaEnv {
  // adicione outras variáveis de ambiente aqui, se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
