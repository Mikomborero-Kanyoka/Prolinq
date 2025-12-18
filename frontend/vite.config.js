import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8001',
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  },
  // Ensure production builds don't use proxy
  preview: {
    port: 3000,
  },
  // Define global constants for debugging
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  // Build optimization
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        }
      }
    }
  }
})
