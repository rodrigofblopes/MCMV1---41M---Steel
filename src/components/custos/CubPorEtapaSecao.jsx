import { useEffect, useMemo, useRef, useState } from 'react'
import { formatarMoeda, precoParaCampoTexto } from '../../utils/formatadores.js'
import {
  TIPOS_CONSTRUCAO,
  PERCENTUAIS_ETAPAS,
  CATEGORIAS_CUB,
  PADROES,
  REFERENCIA_CUB,
  CUB_UNIFAMILIAR_POR_PADRAO,
} from '../../data/dadosCUB.js'
import { useCustosProjetoStorage } from '../../hooks/useCustosProjetoStorage.js'
import { patchViabilidadeProjeto } from '../../hooks/useViabilidadeCalcStorage.js'
import { salvarCubAplicadoViabilidade } from '../../hooks/cubAplicadoViabilidade.js'
import { AREA_CONSTRUIDA_REF_M2 } from '../../constants/areaProjeto.js'

/** Padrão CUB fixo: unifamiliar padrão baixo (R1B). */
const PADRAO_CUB_FIXO = 'baixo'

/**
 * Referência CUB (m² memorial × padrão) + distribuição por etapa; “Aplicar” preenche a lista abaixo.
 */
export default function CubPorEtapaSecao() {
  const padraoSelecionado = PADRAO_CUB_FIXO
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)
  const { substituirTodos } = useCustosProjetoStorage()
  const ultimaChaveReferenciaCubRef = useRef('')

  const areaRefCubM2 = AREA_CONSTRUIDA_REF_M2
  const areaRefCubTexto = areaRefCubM2.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const tipoSelecionado = CUB_UNIFAMILIAR_POR_PADRAO[padraoSelecionado] || 'R1B'
  const tipoAtual = TIPOS_CONSTRUCAO[tipoSelecionado]
  const catSelecionada = tipoAtual?.categoria ? CATEGORIAS_CUB[tipoAtual.categoria] : null
  const padraoInfo = PADROES[padraoSelecionado] || PADROES.normal

  const custoPorM2 = tipoAtual?.valor || 0
  const custoTotal = areaRefCubM2 * custoPorM2

  const etapasCalculadas = useMemo(() => {
    return Object.entries(PERCENTUAIS_ETAPAS).map(([id, etapa]) => ({
      id,
      nome: etapa.nome,
      percentual: etapa.percentual,
      valor: (custoTotal * etapa.percentual) / 100,
    }))
  }, [custoTotal])

  function gravarReferenciaCubNaViabilidade() {
    if (custoTotal <= 0) return
    const totalFmt = precoParaCampoTexto(custoTotal)
    salvarCubAplicadoViabilidade({
      custoTotalConstrucao: totalFmt,
      area: String(areaRefCubM2),
      areaEquivalente: false,
      tipoCodigo: tipoSelecionado,
      tipoNome: tipoAtual?.nome || '',
      padraoConstrucao: padraoSelecionado,
    })
    patchViabilidadeProjeto({ custoTotalConstrucao: totalFmt })
  }

  /** Total estimado (área memorial × CUB/m²) = referência da aba Custos para Viabilidade, mesmo antes de “Aplicar às etapas”. */
  useEffect(() => {
    if (custoTotal <= 0) return
    const chave = `${custoTotal}|${tipoSelecionado}|${padraoSelecionado}|${areaRefCubM2}`
    if (ultimaChaveReferenciaCubRef.current === chave) return
    ultimaChaveReferenciaCubRef.current = chave
    gravarReferenciaCubNaViabilidade()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sincronizar quando o total da calculadora mudar
  }, [custoTotal, tipoSelecionado, padraoSelecionado, areaRefCubM2])

  const aplicarAosCustos = () => {
    const linhas = etapasCalculadas
      .filter((etapa) => etapa.valor > 0)
      .map((etapa) => ({
        id: etapa.id,
        nome: etapa.nome,
        tipo: 'orcado',
        valor: etapa.valor,
        percentual: `${etapa.percentual.toFixed(1)}%`,
      }))

    const somaLinhas = linhas.reduce((s, l) => s + l.valor, 0)
    const diferenca = custoTotal - somaLinhas
    const novosCustos =
      linhas.length > 0 && Math.abs(diferenca) > 1e-6
        ? (() => {
            const copia = linhas.map((l) => ({ ...l }))
            const ult = copia[copia.length - 1]
            ult.valor = Math.max(0, ult.valor + diferenca)
            return copia
          })()
        : linhas

    substituirTodos(novosCustos)
    gravarReferenciaCubNaViabilidade()

    alert(
      `✅ Custos aplicados com sucesso!\n\nTotal: ${formatarMoeda(custoTotal)}\n${novosCustos.length} etapas substituídas.\n\nViabilidade → Projeto: "Custo Total de Construção" = total da obra; "Custo da Obra + Suporte" = esse total + valor do terreno (aba Terreno).`,
    )
  }

  return (
    <section
      id="cub-por-etapa"
      className="scroll-mt-24"
      aria-labelledby="titulo-cub-etapas"
    >
      <div className="mb-4 sm:mb-5">
        <p className="text-sm font-medium text-slate-500">Referência CUB</p>
        <h2
          id="titulo-cub-etapas"
          className="mt-1 text-xl font-bold tracking-tight text-[#1e293b] sm:text-2xl"
        >
          CUB {REFERENCIA_CUB.mes}/{REFERENCIA_CUB.ano} — custo por etapa
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {REFERENCIA_CUB.estado} ({REFERENCIA_CUB.fonte}). Área = construída de referência do memorial (
          {areaRefCubTexto} m²). Coeficientes por ambiente (NBR 12721) em <strong>Projeto → Planta baixa</strong>.
          Referência fixa <strong>R1B — padrão baixo</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="text-lg font-bold text-[#1e293b]">Padrão da construção</h3>
              <p className="text-sm text-slate-600">
                Tipologia unifamiliar <strong className="text-slate-800">R1B (padrão baixo)</strong>, fixa neste
                empreendimento. Ambientes e coeficientes vêm da planta baixa.
              </p>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 sm:px-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Área construída (referência CUB)
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{areaRefCubTexto} m²</p>
                <p className="mt-1 text-xs text-slate-600">
                  Memorial / planta. ΣSe por ambiente (NBR 12721) na <strong>Planta baixa</strong>.
                </p>
              </div>

              {tipoAtual ? (
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                    {catSelecionada ? (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <span aria-hidden>{catSelecionada.icon}</span>
                        <span className="font-medium text-slate-700">{catSelecionada.nome}</span>
                      </span>
                    ) : null}
                    <span className="font-mono text-sm font-bold text-slate-900">{tipoAtual.codigo}</span>
                    <span
                      className={[
                        'inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold',
                        padraoInfo.cor,
                      ].join(' ')}
                    >
                      {padraoInfo.nome}
                    </span>
                    <span className="font-semibold text-slate-900">{formatarMoeda(custoPorM2)}/m²</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug text-slate-800">{tipoAtual.nome}</p>
                  <details className="mt-2 border-t border-slate-200/80 pt-2">
                    <summary className="cursor-pointer text-xs font-medium text-blue-700 hover:text-blue-900">
                      Descrição do tipo CUB
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{tipoAtual.descricao}</p>
                  </details>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Total estimado (CUB × m² memorial)</p>
                <p className="text-2xl font-bold text-slate-900">{formatarMoeda(custoTotal)}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <p>Área: {areaRefCubTexto} m²</p>
                  <p>CUB/m²: {formatarMoeda(custoPorM2)}</p>
                  <p>
                    {tipoAtual?.codigo} — {padraoInfo.nome}
                  </p>
                </div>
              </div>
            </div>

            {custoTotal > 0 && (
              <div className="space-y-3 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  <span>Pré-visualizar distribuição por etapa</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${mostrarDetalhes ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mostrarDetalhes && (
                  <div className="space-y-2 text-xs">
                    {etapasCalculadas.slice(0, 8).map((etapa) => (
                      <div key={etapa.id} className="flex items-center justify-between">
                        <span className="text-slate-600">{etapa.nome}</span>
                        <div className="text-right">
                          <span className="font-medium text-slate-900">{formatarMoeda(etapa.valor)}</span>
                          <span className="ml-1 text-slate-500">({etapa.percentual.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                    {etapasCalculadas.length > 8 && (
                      <p className="text-center text-slate-500">+ {etapasCalculadas.length - 8} etapas…</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={aplicarAosCustos}
                    disabled={custoTotal === 0}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Aplicar às etapas
                  </button>
                  <a
                    href="#lista-etapas"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Ver lista de etapas
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
            <p className="leading-relaxed">
              <strong>Área memorial × CUB/m²</strong> gera o total; os percentuais técnicos repartem por centro de custo. Ao
              aplicar, a
              tabela abaixo é substituída e a Viabilidade recebe o custo total de construção.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
