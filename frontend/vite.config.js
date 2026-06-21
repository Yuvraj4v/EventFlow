import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Only include packages you actually have
          ui: ['framer-motion', 'lucide-react'],
          forms: ['react-hook-form', 'react-hot-toast'],
          payments: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          charts: ['recharts']
        }
      }
    }
  },
  // Optimize dependencies for better build
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand']
  }
})