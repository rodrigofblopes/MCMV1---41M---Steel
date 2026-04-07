import { filtrarAmostrasTerrenoParaPainel } from '../constants/amostrasTerrenoMercado.js'

/** Média do preço total das amostras de terreno de mercado (ids 14–17), para legenda / faixas no mapa. */
export function precoMedioTotalTerrenoMercado(amostras) {
  const precos = filtrarAmostrasTerrenoParaPainel(amostras)
    .map((a) => Number(a.preco))
    .filter((p) => Number.isFinite(p))
  if (!precos.length) return null
  return precos.reduce((s, p) => s + p, 0) / precos.length
}

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

/**
 * @param {'unidade' | 'terreno' | undefined} [filtroTipo] — só essas amostras; omitido = todas exceto serviço (mapa / legado).
 */
export function calcularEstatisticas(amostras, filtroTipo) {
  let lista = (amostras || []).filter((a) => a.tipo !== 'servico')
  if (filtroTipo === 'unidade' || filtroTipo === 'terreno') {
    lista = lista.filter((a) => a.tipo === filtroTipo)
  }
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

/** Totais para o cabeçalho da Pesquisa (ex.: 31 amostras · 22 unidades · 9 terrenos). */
export function contagemAmostrasMercado(amostras) {
  const lista = amostras || []
  const unidades = lista.filter((a) => a.tipo === 'unidade').length
  const terrenos = filtrarAmostrasTerrenoParaPainel(lista).length
  const total = lista.filter((a) => a.tipo !== 'servico').length
  return { total, unidades, terrenos }
}

/**
 * Mesma lógica do painel Pesquisa: média R$/m² das amostras de **unidade** × área × (1 + correção %).
 * Se não houver amostras de unidade, usa todas as amostras não-serviço (compatibilidade).
 */
export function valorUnidadeComCorrecaoNumerico(amostras, areaUnidadeM2, pctCorrecaoPercent) {
  let stats = calcularEstatisticas(amostras, 'unidade')
  if (stats.precoMedioM2 <= 0) stats = calcularEstatisticas(amostras)
  if (areaUnidadeM2 <= 0 || stats.precoMedioM2 <= 0) return 0
  const bruto = Math.round(stats.precoMedioM2 * areaUnidadeM2 * 100) / 100
  const pct = Number.isFinite(pctCorrecaoPercent) ? pctCorrecaoPercent : 0
  return Math.round(bruto * (1 + pct / 100) * 100) / 100
}

/**
 * Cada terreno do painel (ids 14–17 se existirem; senão todo `tipo: 'terreno'`): (preço÷área)×área do lote ref.
 */
export function projecaoPrecosLoteTerreno(amostras, areaLoteM2, pctCorrecaoPercent) {
  const lista = filtrarAmostrasTerrenoParaPainel(amostras)
  const projetados = []
  for (const a of lista) {
    const ar = Number(a.area)
    const pr = Number(a.preco)
    if (ar > 0 && Number.isFinite(pr)) projetados.push((pr / ar) * areaLoteM2)
  }
  if (!projetados.length || areaLoteM2 <= 0) {
    return { precoMax: null, precoMedio: null, precoMin: null }
  }
  const pct = Number.isFinite(pctCorrecaoPercent) ? pctCorrecaoPercent : 0
  const k = 1 + pct / 100
  const aplicar = (v) => Math.round(v * k * 100) / 100
  return {
    precoMax: aplicar(Math.max(...projetados)),
    precoMedio: aplicar(projetados.reduce((s, x) => s + x, 0) / projetados.length),
    precoMin: aplicar(Math.min(...projetados)),
  }
}

/**
 * Média R$/m² das amostras de **terreno** × área do lote × (1 + correção %) — igual a {@link projecaoPrecosLoteTerreno}.precoMedio.
 * @returns {number | null} null se não houver base de cálculo.
 */
export function valorLoteComCorrecaoNumerico(amostras, areaTerrenoM2, pctCorrecaoPercent) {
  const p = projecaoPrecosLoteTerreno(amostras, areaTerrenoM2, pctCorrecaoPercent)
  return p.precoMedio
}
