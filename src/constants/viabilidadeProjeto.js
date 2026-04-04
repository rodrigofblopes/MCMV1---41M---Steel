/** % sobre o subtotal de construção no "Custo da Obra + Suporte" (0 = sem acréscimo). */
export const PCT_ACRESCIMO_OBRA_SUPORTE = 0

export const FATOR_OBRA_SUPORTE = 1 + PCT_ACRESCIMO_OBRA_SUPORTE / 100

/** Custo total de construção de referência do empreendimento (aba Projeto). Obra + Suporte = este valor × fator + terreno. */
export const CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO = 107_882.74

/**
 * VGV de referência do empreendimento (MCMV): R$ 220 mil por unidade.
 * Usado no campo VGV e em tributos/% sobre VGV, independente do preço de mercado vindo da pesquisa.
 */
export const VGV_REFERENCIA_POR_UNIDADE = 220_000

/** Valor de mercado do terreno padrão (aba Terreno da viabilidade). */
export const VALOR_MERCADO_TERRENO_PADRAO = 100_000

/** Remuneração do incorporador em R$; a % exibida é este valor ÷ VGV de referência. */
export const VALOR_REMUNERACAO_INCORPORADOR_PADRAO = 5_000
