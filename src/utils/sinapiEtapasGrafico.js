/**
 * Etapas (raiz do item na sintética) tratadas como “despesas / preliminares” no filtro.
 * Padrão: etapa 1 — Serviços preliminares.
 */
export const IDS_ETAPA_DESPESAS_SINAPI = new Set(['1'])

/** Paleta distinta para pizza / legenda (ordem visual). */
const PALETA_ETAPAS = [
  '#1e3a8a',
  '#b91c1c',
  '#0f766e',
  '#7c3aed',
  '#d97706',
  '#2563eb',
  '#0891b2',
  '#ca8a04',
  '#db2777',
  '#475569',
  '#059669',
  '#9333ea',
]

export function corEtapaSinapi(id) {
  const n = Number(id)
  if (Number.isFinite(n) && n >= 1) {
    return PALETA_ETAPAS[(n - 1) % PALETA_ETAPAS.length]
  }
  return '#64748b'
}

/** Legenda curta: primeiras palavras do título da etapa. */
export function rotuloCurtoEtapaSinapi(nomeCompleto) {
  const t = (nomeCompleto || '').trim()
  if (!t) return '—'
  const palavras = t.split(/\s+/).slice(0, 4).join(' ')
  return palavras.length > 36 ? `${palavras.slice(0, 34)}…` : palavras
}

/**
 * @param {Array<{ id: string, nome: string, valor: number, mo: number, mat: number }>} rows
 * @param {'todos' | 'orcado' | 'despesas'} filtro
 */
export function filtrarEtapasSinapiParaGrafico(rows, filtro) {
  let list = rows
  if (filtro === 'orcado') {
    list = rows.filter((r) => !IDS_ETAPA_DESPESAS_SINAPI.has(r.id))
  } else if (filtro === 'despesas') {
    list = rows.filter((r) => IDS_ETAPA_DESPESAS_SINAPI.has(r.id))
  }
  const sumValor = list.reduce((s, r) => s + r.valor, 0)
  const withPct = list.map((r) => ({
    ...r,
    pctVisual: sumValor > 0 ? (r.valor / sumValor) * 100 : 0,
    cor: corEtapaSinapi(r.id),
    rotuloCurto: rotuloCurtoEtapaSinapi(r.nome),
  }))
  const totalMO = list.reduce((s, r) => s + r.mo, 0)
  const totalMAT = list.reduce((s, r) => s + r.mat, 0)
  return {
    rows: withPct,
    totalValor: sumValor,
    totalMO,
    totalMAT,
  }
}

/** Arco de pizza: ângulos em rad, início no topo (-π/2). */
export function pathsPizzaEtapas(items, cx, cy, r) {
  let a0 = -Math.PI / 2
  const paths = []
  for (const row of items) {
    if (row.pctVisual <= 0) continue
    const sweep = (row.pctVisual / 100) * 2 * Math.PI
    const a1 = a0 + sweep
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = sweep > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
    paths.push({ d, cor: row.cor, id: row.id })
    a0 = a1
  }
  return paths
}

/** Série Pareto: ordenado por valor, com % acumulado. */
export function serieParetoEtapas(rowsComPct) {
  const sorted = [...rowsComPct].sort((a, b) => b.valor - a.valor)
  let acc = 0
  return sorted.map((r) => {
    acc += r.pctVisual
    return { ...r, pctAcumulado: acc }
  })
}
