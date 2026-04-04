/** Último custo total (CUB × m² memorial) aplicado em Custos por Etapa CUB → Viabilidade. */

export const CUB_APLICADO_VIABILIDADE_KEY = 'mcmv1-43m2-cub-viabilidade-v1'

function totalDoSnapshot(o) {
  if (!o || typeof o !== 'object') return ''
  if (o.custoTotalConstrucao) return String(o.custoTotalConstrucao)
  if (o.custoObraSuporte) return String(o.custoObraSuporte)
  return ''
}

export function lerCubAplicadoViabilidade() {
  try {
    const raw = localStorage.getItem(CUB_APLICADO_VIABILIDADE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    const custoTotalConstrucao = totalDoSnapshot(o)
    if (!custoTotalConstrucao) return null
    return { ...o, custoTotalConstrucao }
  } catch {
    return null
  }
}

export function salvarCubAplicadoViabilidade(payload) {
  try {
    localStorage.setItem(
      CUB_APLICADO_VIABILIDADE_KEY,
      JSON.stringify({ ...payload, updatedAt: Date.now() }),
    )
  } catch {
    /* quota / modo privado */
  }
}

export function limparCubAplicadoViabilidade() {
  localStorage.removeItem(CUB_APLICADO_VIABILIDADE_KEY)
}
