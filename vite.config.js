import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Em dev: `/` (igual ao servidor local). Em build: `./` para o mesmo pacote servir na raiz (Vercel) ou em subpasta (GitHub Pages). */
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : './',
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
  publicDir: 'public',
}))
