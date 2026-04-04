import { copyFileSync } from 'node:fs'

/** GitHub Pages devolve 404 em rotas diretas; copiar index.html permite o React Router tratar a rota. */
copyFileSync('dist/index.html', 'dist/404.html')
