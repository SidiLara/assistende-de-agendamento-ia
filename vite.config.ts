import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        '@google/genai'
      ]
    }
  }
})
