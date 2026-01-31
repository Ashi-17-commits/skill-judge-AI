import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // No proxy needed - API calls use VITE_API_BASE_URL environment variable
    // For development: VITE_API_BASE_URL=http://localhost:8000
    // For production: VITE_API_BASE_URL=https://skill-judge-ai-tm61.onrender.com
  },
})
