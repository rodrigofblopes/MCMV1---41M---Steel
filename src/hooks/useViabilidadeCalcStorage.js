import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO,
  VALOR_MERCADO_TERRENO_PADRAO,
  VALOR_REMUNERACAO_INCORPORADOR_PADRAO,
  VGV_REFERENCIA_POR_UNIDADE,
} from '../constants/viabilidadeProjeto.js'
import { precoParaCampoTexto } from '../utils/formatadores.js'
import { parseMoedaBR } from '../utils/parseValoresBR.js'

const STORAGE_KEY = 'mcmv1-43m2-viabilidade-v4'
const STORAGE_KEY_V3 = 'mcmv1-43m2-viabilidade-v3'
const STORAGE_KEY_LEGACY = 'mcmv1-43m2-viabilidade-v2'

/** Disparado após gravar viabilidade no localStorage fora do ciclo do hook (ex.: Calculadora CUB). */
export const VIABILIDADE_STORAGE_SYNC_EVENT = 'mcmv1-43m2-viabilidade-sync'

function fmtBrl(n) {
  return precoParaCampoTexto(n)
}

function defaultState() {
  return {
    projeto: {
      unidades: '1',
      /** Custo total de construção (CUB ou soma das etapas). Obra + Suporte = este valor + terreno (sem × unidades). */
      custoTotalConstrucao: precoParaCampoTexto(CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO),
      /** Preenchido pela pesquisa (valor da unidade com correção); pode ficar vazio até haver amostras. */
      precoMercadoUnidade: '',
      duracaoMeses: '3',
    },
    investidores: {
      taxaDesconto: '3',
      numInvestidores: '1',
      valorInvestidor: precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE),
    },
    rentabilidade: {
      /** Fluxo mensal é calculado na UI (Obra + Suporte ÷ meses); campo legado mantido vazio. */
      fluxoCaixaMensal: '',
      taxaImposto: '4',
      taxaCorretagem: '5',
    },
    eficiencia: {
      retornoLiquido: '',
      roi: '',
      lucroLiquido: '',
      tir: '',
    },
    terreno: {
      /** Fração ou quantidade de unidades na permuta do terreno (ex.: 0,455). */
      unidadesPagamentoTerreno: '0,455',
      valorMercadoTerreno: precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO),
    },
    remuneracao: {
      /** Legado; antes da remuneração em R$ fixo. */
      unidadeIncorporador: '',
      valorIncorporador: precoParaCampoTexto(VALOR_REMUNERACAO_INCORPORADOR_PADRAO),
      percentUnidadesIncorporador: '',
    },
    updatedAt: null,
  }
}

function migrarProjetoParaCustoTotal(projetoMerged) {
  const U = Math.max(0, parseInt(String(projetoMerged.unidades).replace(/\D/g, '') || '0', 10) || 0)
  let total = parseMoedaBR(projetoMerged.custoTotalConstrucao)
  if (total <= 0) {
    const obraLegado = parseMoedaBR(projetoMerged.custoObraSuporte)
    if (obraLegado > 0) total = obraLegado
  }
  if (total > 0) projetoMerged.custoTotalConstrucao = fmtBrl(total)
  else if (!projetoMerged.custoTotalConstrucao) projetoMerged.custoTotalConstrucao = ''
  delete projetoMerged.custoObraSuporte
}

/** Garante valores mínimos para os campos calculados (ex.: Obra + Suporte) não ficarem em "—". */
function preencherProjetoPadraoSeIncompleto(projeto) {
  const nUnid = Math.max(0, parseInt(String(projeto.unidades).replace(/\D/g, '') || '0', 10) || 0)
  if (nUnid <= 0) projeto.unidades = '1'

  const custoTxt = String(projeto.custoTotalConstrucao ?? '').trim()
  if (custoTxt === '') {
    projeto.custoTotalConstrucao = precoParaCampoTexto(CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO)
  }

  const meses = Math.max(0, parseInt(String(projeto.duracaoMeses).replace(/\D/g, '') || '0', 10) || 0)
  if (meses <= 0) projeto.duracaoMeses = '3'

}

function preencherInvestidoresPadraoSeIncompleto(inv) {
  if (!String(inv.taxaDesconto ?? '').trim()) inv.taxaDesconto = '3'
  const nInv = Math.max(0, parseInt(String(inv.numInvestidores).replace(/\D/g, '') || '0', 10) || 0)
  if (nInv <= 0) inv.numInvestidores = '1'
  /** Fixo R$ 220.000,00 por unidade (referência MCMV). */
  inv.valorInvestidor = precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)
}

function preencherRentabilidadePadraoSeIncompleto(rent) {
  if (!String(rent.taxaImposto ?? '').trim()) rent.taxaImposto = '4'
  if (!String(rent.taxaCorretagem ?? '').trim()) rent.taxaCorretagem = '5'
}

function preencherTerrenoPadraoSeIncompleto(terr) {
  if (!String(terr.unidadesPagamentoTerreno ?? '').trim()) {
    terr.unidadesPagamentoTerreno = '0,455'
  }
  if (!String(terr.valorMercadoTerreno ?? '').trim()) {
    terr.valorMercadoTerreno = precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO)
  }
}

function preencherRemuneracaoPadraoSeIncompleto(rem) {
  if (!String(rem.valorIncorporador ?? '').trim()) {
    rem.valorIncorporador = precoParaCampoTexto(VALOR_REMUNERACAO_INCORPORADOR_PADRAO)
  }
}

export function carregarViabilidadeDoStorage() {
  const base = defaultState()
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) raw = localStorage.getItem(STORAGE_KEY_V3)
    if (!raw) raw = localStorage.getItem(STORAGE_KEY_LEGACY)
    if (!raw) {
      const projeto0 = { ...base.projeto }
      preencherProjetoPadraoSeIncompleto(projeto0)
      const inv0 = { ...base.investidores }
      preencherInvestidoresPadraoSeIncompleto(inv0)
      const rem0 = { ...base.remuneracao }
      preencherRemuneracaoPadraoSeIncompleto(rem0)
      return { ...base, projeto: projeto0, investidores: inv0, remuneracao: rem0 }
    }
    const p = JSON.parse(raw)
    if (!p || typeof p !== 'object') return base
    const projetoMerged = { ...base.projeto, ...(p.projeto || {}) }
    migrarProjetoParaCustoTotal(projetoMerged)
    preencherProjetoPadraoSeIncompleto(projetoMerged)

    const investidoresMerged = { ...base.investidores, ...(p.investidores || {}) }
    preencherInvestidoresPadraoSeIncompleto(investidoresMerged)

    const rentabilidadeMerged = { ...base.rentabilidade, ...(p.rentabilidade || {}) }
    preencherRentabilidadePadraoSeIncompleto(rentabilidadeMerged)

    const terrenoMerged = { ...base.terreno, ...(p.terreno || {}) }
    preencherTerrenoPadraoSeIncompleto(terrenoMerged)

    const remuneracaoMerged = { ...base.remuneracao, ...(p.remuneracao || {}) }
    preencherRemuneracaoPadraoSeIncompleto(remuneracaoMerged)

    return {
      ...base,
      ...p,
      projeto: projetoMerged,
      investidores: investidoresMerged,
      rentabilidade: rentabilidadeMerged,
      eficiencia: { ...base.eficiencia, ...(p.eficiencia || {}) },
      terreno: terrenoMerged,
      remuneracao: remuneracaoMerged,
    }
  } catch {
    return base
  }
}

/**
 * Mescla campos em projeto na viabilidade persistida e notifica o Provider para reler o storage.
 * @param {Record<string, string>} projetoPatch
 * @param {{ precoMercadoSeVazio?: string }} [options]
 */
export function patchViabilidadeProjeto(projetoPatch, options = {}) {
  const current = carregarViabilidadeDoStorage()
  const mergedProjeto = { ...current.projeto, ...projetoPatch }
  if (options.precoMercadoSeVazio) {
    const pr = mergedProjeto.precoMercadoUnidade
    if (!pr || pr === '' || pr === '0,00') {
      mergedProjeto.precoMercadoUnidade = options.precoMercadoSeVazio
    }
  }
  const next = { ...current, projeto: mergedProjeto }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* quota */
  }
  window.dispatchEvent(new CustomEvent(VIABILIDADE_STORAGE_SYNC_EVENT))
}

const ViabilidadeCalcContext = createContext(null)

/** Um único estado de viabilidade para toda a aplicação (evita múltiplos useState em hooks diferentes). */
export function ViabilidadeCalcProvider({ children }) {
  const [state, setState] = useState(() => carregarViabilidadeDoStorage())

  useEffect(() => {
    const onExternalSync = () => setState(carregarViabilidadeDoStorage())
    window.addEventListener(VIABILIDADE_STORAGE_SYNC_EVENT, onExternalSync)
    return () => window.removeEventListener(VIABILIDADE_STORAGE_SYNC_EVENT, onExternalSync)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota */
    }
  }, [state])

  const setSecao = useCallback((secao, patch) => {
    setState((prev) => ({
      ...prev,
      [secao]: { ...prev[secao], ...patch },
    }))
  }, [])

  const salvarAgora = useCallback(() => {
    setState((prev) => ({ ...prev, updatedAt: Date.now() }))
  }, [])

  const resetar = useCallback(() => {
    setState(defaultState())
  }, [])

  const value = useMemo(
    () => ({
      state,
      setSecao,
      salvarAgora,
      resetar,
    }),
    [state, setSecao, salvarAgora, resetar],
  )

  return createElement(ViabilidadeCalcContext.Provider, { value }, children)
}

export function useViabilidadeCalcStorage() {
  const ctx = useContext(ViabilidadeCalcContext)
  if (!ctx) {
    throw new Error(
      'useViabilidadeCalcStorage deve ser usado dentro de <ViabilidadeCalcProvider> (veja App.jsx).',
    )
  }
  return ctx
}
