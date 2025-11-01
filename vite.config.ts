import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Expose process.env.API_KEY to client-side code to align with Gemini API guidelines.
  // This makes the environment variable available for initializing the GoogleGenAI client.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
