import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: true },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three-vendor'
          if (/node_modules\/(gsap|lenis)\//.test(id)) return 'animation-vendor'
          if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) return 'react-vendor'
        },
      },
    },
  },
})
