import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, '41M.glb')
const destDir = join(root, 'public', 'models')
const dest = join(destDir, '41M.glb')

if (!existsSync(src)) {
  console.error(
    'Não encontrado: 41M.glb na raiz do projeto.\n' +
      'Coloque o modelo exportado como 41M.glb na raiz e volte a correr: npm run sync:model',
  )
  process.exit(1)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log('OK: 41M.glb → public/models/41M.glb (aba 3D usa este ficheiro)')
