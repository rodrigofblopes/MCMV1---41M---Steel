/**
 * Amostras de terreno usadas na pesquisa de mercado (lotes comparáveis) e nos cards de projeção.
 * Ver `amostrasExemplo.js` — ids 14 a 17.
 */
export const IDS_AMOSTRAS_TERRENO_MERCADO = Object.freeze([14, 15, 16, 17])

export function isAmostraTerrenoMercado(a) {
  if (!a || a.tipo !== 'terreno') return false
  return IDS_AMOSTRAS_TERRENO_MERCADO.includes(Number(a.id))
}

export function filtrarAmostrasTerrenoMercado(amostras) {
  return (amostras || []).filter(isAmostraTerrenoMercado)
}

/**
 * Cards e mapa: prioriza ids 14–17; se não houver nenhum no portfólio, usa **todas** as amostras `tipo: 'terreno'`
 * (ex.: ids 23–26 após novos cadastros), para os valores nunca ficarem em branco quando existir terreno.
 */
export function filtrarAmostrasTerrenoParaPainel(amostras) {
  const mercado = filtrarAmostrasTerrenoMercado(amostras)
  if (mercado.length > 0) return mercado
  return (amostras || []).filter((a) => a?.tipo === 'terreno')
}
