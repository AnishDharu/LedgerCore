import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Spring Boot backend has CORS disabled, so in dev we proxy /api to it.
// Override the target with: VITE_API_TARGET=http://host:port npm run dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
