import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Em dev: `/` (igual ao servidor local). Em build: `./` para o mesmo pacote servir na raiz (Vercel) ou em subpasta (GitHub Pages). */
export default defineConfig(({ command }) => {
  const define = {}
  if (command === 'build') {
    /** Novo URL a cada build → browser não reutiliza GLB antigo em cache (mesmo nome de ficheiro). */
    define['import.meta.env.VITE_MODEL_ASSET_BUST'] = JSON.stringify(String(Date.now()))
  }

  return {
  base: command === 'serve' ? '/' : './',
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  define,
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
  }
})
