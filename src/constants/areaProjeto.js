/**
 * Área construída de referência do projeto (memorial / planta baixa), em texto pt-BR para inputs.
 * Valor numérico ≈ parseFloat(AREA_CONSTRUIDA_REF_TEXTO.replace(',', '.'))
 */
export const AREA_CONSTRUIDA_REF_TEXTO = '41,16'

/** Valor numérico em m² (memorial / planta) — base para CUB × m² na aba Custos. */
export const AREA_CONSTRUIDA_REF_M2 = Number.parseFloat(AREA_CONSTRUIDA_REF_TEXTO.replace(',', '.'))

/** Nome curto do produto com a área da planta (cabeçalhos, placeholders). */
export const ROTULO_PROJETO_COM_AREA = `MCMV1 — ${AREA_CONSTRUIDA_REF_TEXTO} m²`

/** Linha de produto completa (viabilidade, textos de contexto). */
export const ROTULO_LINHA_PRODUTO = `${ROTULO_PROJETO_COM_AREA} · Steel frame (LSF)`
