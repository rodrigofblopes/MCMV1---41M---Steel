/** Distância em metros entre dois pontos (Haversine). */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** @returns {'dentro_500' | 'dentro_1000' | 'fora' | null} */
export function classificarAmostraPorDistancia(sujeito, amostra) {
  if (
    !sujeito ||
    !Number.isFinite(Number(sujeito.lat)) ||
    !Number.isFinite(Number(sujeito.lng))
  ) {
    return null
  }
  if (!Number.isFinite(Number(amostra?.lat)) || !Number.isFinite(Number(amostra?.lng))) {
    return 'fora'
  }
  const dist = calcularDistancia(
    Number(sujeito.lat),
    Number(sujeito.lng),
    Number(amostra.lat),
    Number(amostra.lng),
  )
  if (dist <= 500) return 'dentro_500'
  if (dist <= 1000) return 'dentro_1000'
  return 'fora'
}

/** @returns {'baixo' | 'medio' | 'alto'} */
export function faixaPrecoRelativaMedia(preco, precoMedio) {
  if (precoMedio == null || precoMedio <= 0) return 'medio'
  const limiteInferior = precoMedio * 0.85
  const limiteSuperior = precoMedio * 1.15
  if (preco < limiteInferior) return 'baixo'
  if (preco > limiteSuperior) return 'alto'
  return 'medio'
}

export function calcularEstatisticas(amostras) {
  const lista = (amostras || []).filter((a) => a.tipo !== 'servico')
  if (!lista.length) {
    return {
      precoMax: 0,
      precoMedio: 0,
      precoMin: 0,
      precoMedioM2: 0,
      areaMax: 0,
      areaMedia: 0,
      areaMin: 0,
    }
  }
  const precos = lista.map((a) => a.preco)
  const areas = lista.map((a) => a.area)
  let somaRm2 = 0
  let nRm2 = 0
  for (const a of lista) {
    const ar = Number(a.area)
    const pr = Number(a.preco)
    if (ar > 0 && Number.isFinite(pr)) {
      somaRm2 += pr / ar
      nRm2 += 1
    }
  }
  return {
    precoMax: Math.max(...precos),
    precoMedio: precos.reduce((a, b) => a + b, 0) / precos.length,
    precoMin: Math.min(...precos),
    precoMedioM2: nRm2 > 0 ? somaRm2 / nRm2 : 0,
    areaMax: Math.max(...areas),
    areaMedia: areas.reduce((a, b) => a + b, 0) / areas.length,
    areaMin: Math.min(...areas),
  }
}

/**
 * Mesma lógica do painel Pesquisa: média R$/m² das amostras × área da unidade × (1 + correção %).
 * @param {number} areaUnidadeM2 Área em m²
 * @param {number} pctCorrecaoPercent Percentual (ex.: 1 → +1%)
 */
export function valorUnidadeComCorrecaoNumerico(amostras, areaUnidadeM2, pctCorrecaoPercent) {
  const stats = calcularEstatisticas(amostras)
  if (areaUnidadeM2 <= 0 || stats.precoMedioM2 <= 0) return 0
  const bruto = Math.round(stats.precoMedioM2 * areaUnidadeM2 * 100) / 100
  const pct = Number.isFinite(pctCorrecaoPercent) ? pctCorrecaoPercent : 0
  return Math.round(bruto * (1 + pct / 100) * 100) / 100
}
