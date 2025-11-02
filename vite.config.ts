import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Passa a lista de chaves para a aplicação
    'process.env.API_KEYS': JSON.stringify(process.env.VITE_GEMINI_API_KEYS)
  }
})
