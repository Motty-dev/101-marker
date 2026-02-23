import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Use repo-name base only when building in GitHub Actions for GitHub Pages
  base: process.env.GITHUB_ACTIONS === 'true' ? '/101-marker/' : '/',
  server: {
    port: 9999,
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
