import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env com base no modo (development, production)
  // FIX: Replaced `process.cwd()` with `''` to resolve a TypeScript error. `loadEnv` correctly resolves an empty string to the current working directory.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    define: {
      // Disponibiliza a variável API_KEY para o código do lado do cliente
      // como process.env.API_KEY. O Vite substitui isso pelo valor real durante o build.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})