import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    assetsInlineLimit: 0, // Não fazer inline de assets grandes
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Manter nome original para GLB
          if (assetInfo.name?.endsWith('.glb')) {
            return 'models/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  publicDir: 'public'
})
