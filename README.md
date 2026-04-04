# MCMV1---41M---Steel

Aplicação web **Avalia Imóveis** — Vite, React, mapas e viabilidade de empreendimentos.

Repositório: [github.com/rodrigofblopes/MCMV1---41M---Steel](https://github.com/rodrigofblopes/MCMV1---41M---Steel).

**Deploy (GitHub Pages e Vercel)** usam o **mesmo** `npm run build`: `base` relativo (`./`) e **HashRouter**, para assets e rotas funcionarem igual ao ambiente local, na raiz do domínio ou em subpasta (`/MCMV1---41M---Steel/`). As URLs ficam no formato `/#/rota` (ex.: `/#/apresentacao-investidor`).

- **GitHub Pages:** workflow em `.github/workflows/deploy-github-pages.yml`
- **Vercel:** `vercel.json` (rewrites SPA + headers para `/models/`)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Gera `dist/` (e copia `404.html` para GitHub Pages). Na Vercel, use **Build Command** `npm run build` e **Output** `dist`.