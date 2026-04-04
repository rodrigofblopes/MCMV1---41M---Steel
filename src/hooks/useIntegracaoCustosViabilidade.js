import { useEffect, useMemo } from 'react'
import { useAmostras } from '../contexts/AmostrasContext.jsx'
import { useCustosProjetoStorage } from './useCustosProjetoStorage.js'
import { usePesquisaMercadoConfig } from './usePesquisaMercadoConfig.js'
import { useViabilidadeCalcStorage } from './useViabilidadeCalcStorage.js'
import { lerCubAplicadoViabilidade } from './cubAplicadoViabilidade.js'
import { valorUnidadeComCorrecaoNumerico } from '../utils/calculos.js'
import { precoParaCampoTexto } from '../utils/formatadores.js'
import { parseMoedaBR, parsePercentBR } from '../utils/parseValoresBR.js'

function parseUnidades(str) {
  return Math.max(0, parseInt(String(str).replace(/\D/g, '') || '0', 10) || 0)
}

function fmtBrl(n) {
  return precoParaCampoTexto(n)
}

/** Margem sugerida sobre o custo total de construção no botão de sugestão de preço na aba Projeto (%). */
export const MARGEM_PRECO_SUGERIDO_PCT = 80
const FATOR_PRECO_SUGERIDO = 1 + MARGEM_PRECO_SUGERIDO_PCT / 100

/**
 * Integra Custos do Projeto e/ou CUB com a Viabilidade.
 * - "Custo Total de Construção" = referência por unidade (CUB ou soma dos custos de 1 unidade).
 * - "Custo da Obra + Suporte" na UI = custo total de construção + valor do terreno (sem multiplicar por unidades).
 * - Preço de mercado: quando a pesquisa tiver valor, mantém-se alinhado ao valor da unidade com correção (sobrescreve divergências).
 * - VGV de referência (impostos / campo VGV): fixo em R$ 220 mil por unidade na calculadora — ver VGV_REFERENCIA_POR_UNIDADE.
 */
export function useIntegracaoCustosViabilidade() {
  const { amostras } = useAmostras()
  const { config: pesquisaConfig } = usePesquisaMercadoConfig()
  const { items: custosItems } = useCustosProjetoStorage()
  const { state: viabilidadeState, setSecao } = useViabilidadeCalcStorage()

  const precoMercadoDaPesquisaNum = useMemo(() => {
    const area = parseMoedaBR(pesquisaConfig.areaUnidadeM2)
    const pct = parsePercentBR(pesquisaConfig.fatorCorrecaoPercent)
    return valorUnidadeComCorrecaoNumerico(amostras, area, pct)
  }, [amostras, pesquisaConfig.areaUnidadeM2, pesquisaConfig.fatorCorrecaoPercent])

  const custoTotalProjetos = custosItems.reduce((total, item) => total + (item.valor || 0), 0)
  const nUnidades = parseUnidades(viabilidadeState.projeto.unidades)

  const cubMeta = lerCubAplicadoViabilidade()
  const cubTotalNum = cubMeta?.custoTotalConstrucao ? parseMoedaBR(cubMeta.custoTotalConstrucao) : 0
  const obraOrigemCub = cubTotalNum > 0
  const cubChave = cubMeta ? `${cubMeta.custoTotalConstrucao}-${cubMeta.updatedAt ?? ''}` : ''

  /** Pesquisa com valor válido: preço de mercado por unidade = valor da unidade com correção (aba Pesquisa). */
  useEffect(() => {
    if (precoMercadoDaPesquisaNum <= 0) return
    const fmtP = fmtBrl(precoMercadoDaPesquisaNum)
    if (viabilidadeState.projeto.precoMercadoUnidade === fmtP) return
    setSecao('projeto', { precoMercadoUnidade: fmtP })
  }, [precoMercadoDaPesquisaNum, setSecao, viabilidadeState.projeto.precoMercadoUnidade])

  useEffect(() => {
    const cub = lerCubAplicadoViabilidade()
    const totalCub = cub?.custoTotalConstrucao ? parseMoedaBR(cub.custoTotalConstrucao) : 0

    /** Total estimado (CUB × m² memorial) da aba Custos tem prioridade sobre a soma manual das etapas (pode ficar defasada). */
    if (totalCub > 0) {
      const totalFmt = cub.custoTotalConstrucao
      const totalDiferente = viabilidadeState.projeto.custoTotalConstrucao !== totalFmt
      if (totalDiferente) {
        setSecao('projeto', { custoTotalConstrucao: totalFmt })
      }
      return
    }

    if (custoTotalProjetos > 0) {
      const totalFmt = fmtBrl(custoTotalProjetos)
      const totalDiferente = viabilidadeState.projeto.custoTotalConstrucao !== totalFmt
      if (totalDiferente) {
        setSecao('projeto', { custoTotalConstrucao: totalFmt })
      }
      return
    }
  }, [
    custoTotalProjetos,
    nUnidades,
    cubChave,
    viabilidadeState.projeto.custoTotalConstrucao,
    viabilidadeState.projeto.unidades,
    setSecao,
    precoMercadoDaPesquisaNum,
  ])

  const totalViabilNum = parseMoedaBR(viabilidadeState.projeto.custoTotalConstrucao)
  const nUnidPreco = parseUnidades(viabilidadeState.projeto.unidades)
  /** Custo total da obra ÷ unidades × margem — preço de mercado é por unidade. */
  const custoMedioPorUnidadeNum =
    totalViabilNum > 0 ? (nUnidPreco > 0 ? totalViabilNum / nUnidPreco : totalViabilNum) : 0

  const precoSugeridoFormatado =
    custoMedioPorUnidadeNum > 0 ? fmtBrl(custoMedioPorUnidadeNum * FATOR_PRECO_SUGERIDO) : '0,00'

  const custoTotalConstrucaoFormatado =
    obraOrigemCub && cubMeta?.custoTotalConstrucao
      ? cubMeta.custoTotalConstrucao
      : custoTotalProjetos > 0
        ? fmtBrl(custoTotalProjetos)
        : '0,00'

  const fmtPrecoPesquisa =
    precoMercadoDaPesquisaNum > 0 ? fmtBrl(precoMercadoDaPesquisaNum) : ''

  return {
    custoTotalProjetos,
    custoTotalViabilidade: custoTotalConstrucaoFormatado,
    precoMercadoViabilidade: viabilidadeState.projeto.precoMercadoUnidade,
    precoSugerido: precoSugeridoFormatado,
    integracaoAtiva: obraOrigemCub || custoTotalProjetos > 0,
    obraOrigemCub,
    margemAplicada: MARGEM_PRECO_SUGERIDO_PCT,
    precoMercadoSincronizaComPesquisa:
      fmtPrecoPesquisa !== '' && viabilidadeState.projeto.precoMercadoUnidade === fmtPrecoPesquisa,
  }
}
