import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useEmpreendimento } from '../../contexts/EmpreendimentoContext.jsx'
import { useCustosProjetoStorage } from '../../hooks/useCustosProjetoStorage.js'
import { lerCubAplicadoViabilidade } from '../../hooks/cubAplicadoViabilidade.js'
import ResumoEquivalenciaPlantaCustos from './ResumoEquivalenciaPlantaCustos.jsx'
import CubPorEtapaSecao from './CubPorEtapaSecao.jsx'
import { custosNovo, apresentacaoInvestidor } from '../../routes/paths.js'
import { LABEL_TIPO } from '../../data/centrosCustoIniciais.js'
import { TIPOS_CONSTRUCAO } from '../../data/dadosCUB.js'
import { AREA_CONSTRUIDA_REF_M2 } from '../../constants/areaProjeto.js'
import { formatarMoeda } from '../../utils/formatadores.js'

function tempoRelativoSalvo(ts) {
  if (!ts) return 'Nunca salvo'
  const d = Date.now() - ts
  const dia = 86400000
  if (d < 60000) return 'Agora há pouco'
  if (d < dia) return 'Hoje'
  if (d < 2 * dia) return '1 dia atrás'
  return `${Math.floor(d / dia)} dias atrás`
}

function IconeOrdenar() {
  return (
    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeArrastar() {
  return (
    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="8" r="1.2" />
      <circle cx="15" cy="8" r="1.2" />
      <circle cx="9" cy="12" r="1.2" />
      <circle cx="15" cy="12" r="1.2" />
      <circle cx="9" cy="16" r="1.2" />
      <circle cx="15" cy="16" r="1.2" />
    </svg>
  )
}

function Segmentado({ opcoes, valor, onChange, className = '' }) {
  return (
    <div
      className={[
        'inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm',
        className,
      ].join(' ')}
      role="group"
    >
      {opcoes.map((op) => {
        const ativo = valor === op.id
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => onChange(op.id)}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
              ativo ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            {op.label}
          </button>
        )
      })}
    </div>
  )
}

function GraficoPizzaFuncional({ itens }) {
  // Filtrar apenas itens com valor > 0 e pegar os 8 maiores
  const itensValidos = itens.filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8)
  
  if (itensValidos.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center py-6">
        <div className="text-center text-slate-500">
          <div className="h-44 w-44 rounded-full border-[14px] border-slate-200 bg-transparent mx-auto mb-4" />
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  const total = itensValidos.reduce((sum, item) => sum + item.valor, 0)
  
  // Cores para as fatias
  const cores = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500  
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
  ]

  // Calcular ângulos para cada fatia
  let anguloAcumulado = 0
  const fatias = itensValidos.map((item, index) => {
    const porcentagem = (item.valor / total) * 100
    const angulo = (item.valor / total) * 360
    const resultado = {
      ...item,
      porcentagem,
      anguloInicio: anguloAcumulado,
      anguloFim: anguloAcumulado + angulo,
      cor: cores[index % cores.length]
    }
    anguloAcumulado += angulo
    return resultado
  })

  // Função para criar path SVG para fatia de pizza
  const criarFatia = (fatia, raio = 80, centroX = 100, centroY = 100) => {
    const anguloInicioRad = (fatia.anguloInicio * Math.PI) / 180
    const anguloFimRad = (fatia.anguloFim * Math.PI) / 180
    
    const x1 = centroX + raio * Math.cos(anguloInicioRad)
    const y1 = centroY + raio * Math.sin(anguloInicioRad)
    const x2 = centroX + raio * Math.cos(anguloFimRad)
    const y2 = centroY + raio * Math.sin(anguloFimRad)
    
    const largeArcFlag = fatia.anguloFim - fatia.anguloInicio > 180 ? 1 : 0
    
    return `M ${centroX} ${centroY} L ${x1} ${y1} A ${raio} ${raio} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="min-h-[220px] py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        {/* Gráfico de Pizza SVG */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-sm">
            {fatias.map((fatia, index) => (
              <path
                key={fatia.id}
                d={criarFatia(fatia)}
                fill={fatia.cor}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${fatia.nome}: ${formatarMoeda(fatia.valor)} (${fatia.porcentagem.toFixed(1)}%)`}
              />
            ))}
          </svg>
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {fatias.map((fatia) => (
            <div key={fatia.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: fatia.cor }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-700" title={fatia.nome}>
                  {fatia.nome}
                </p>
                <p className="text-slate-500">
                  {formatarMoeda(fatia.valor)} ({fatia.porcentagem.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GraficoParetoPlaceholder({ itens }) {
  const max = Math.max(...itens.map((i) => i.valor), 1)
  return (
    <div className="min-h-[220px] space-y-2 py-4" role="img" aria-label="Gráfico de Pareto">
      {itens.slice(0, 8).map((row) => (
        <div key={row.id} className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="w-28 shrink-0 truncate text-slate-600 sm:w-40" title={row.nome}>
            {row.nome}
          </span>
          <div className="h-2 min-w-0 flex-1 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-400"
              style={{ width: `${Math.max(4, (row.valor / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CustosProjetoPage() {
  const { hash } = useLocation()
  const { dados } = useEmpreendimento()
  const nomeProjeto = dados.nomeProjeto?.trim() || dados.nome?.trim() || 'Empreendimento'
  const { items, updatedAt } = useCustosProjetoStorage()

  useEffect(() => {
    if (hash !== '#cub-por-etapa' && hash !== '#lista-etapas') return
    const id = hash === '#lista-etapas' ? 'lista-etapas' : 'cub-por-etapa'
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hash])

  const [filtro, setFiltro] = useState('todos')
  const [grafico, setGrafico] = useState('pizza')

  const filtrados = useMemo(() => {
    if (filtro === 'orcado') return items.filter((i) => i.tipo === 'orcado')
    if (filtro === 'despesas') return items.filter((i) => i.tipo === 'despesas')
    return items
  }, [items, filtro])

  const areaRefCubM2 = AREA_CONSTRUIDA_REF_M2

  const cubMeta = useMemo(() => lerCubAplicadoViabilidade(), [updatedAt])
  const tipoCub = cubMeta?.tipoCodigo ? TIPOS_CONSTRUCAO[cubMeta.tipoCodigo] : null
  const valorM2Oficial = tipoCub?.valor ?? null

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-3 py-4 text-[#1e293b] sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to={apresentacaoInvestidor}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          ← Voltar
        </Link>

        <header className="mt-6">
          <p className="text-sm font-medium text-slate-500">Custos / CUB</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">
            Custos por etapa
          </h1>
          <p className="mt-1 text-sm text-slate-600">{nomeProjeto}</p>

          <CubPorEtapaSecao />

          <div className="mt-8 rounded-xl border border-slate-200/90 bg-white px-4 py-5 text-center shadow-sm sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Área construída (referência CUB)
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
              {areaRefCubM2.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-xl font-semibold text-slate-600 sm:text-2xl">m²</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Memorial / planta — mesma base da referência CUB acima. ΣSe por ambiente (NBR 12721) na Planta baixa.
            </p>
          </div>

          <ResumoEquivalenciaPlantaCustos cubPorM2={valorM2Oficial} />

          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" strokeLinecap="round" />
            </svg>
            Última atualização {tempoRelativoSalvo(updatedAt)}
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <h2 className="text-base font-bold text-[#1e293b]">Resumo dos custos</h2>
            <Link
              to={custosNovo}
              className="inline-flex items-center justify-center rounded-full bg-[#1A202C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
            >
              Novo Centro de Custo
            </Link>
          </div>

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Segmentado
              opcoes={[
                { id: 'todos', label: 'Todos' },
                { id: 'orcado', label: 'Somente orçado' },
                { id: 'despesas', label: 'Somente despesas' },
              ]}
              valor={filtro}
              onChange={setFiltro}
            />
            <Segmentado
              opcoes={[
                { id: 'pizza', label: 'Pizza' },
                { id: 'pareto', label: 'Pareto' },
              ]}
              valor={grafico}
              onChange={setGrafico}
            />
          </div>

          <div className="px-5 pb-6 pt-2 sm:px-8">
            {grafico === 'pizza' ? <GraficoPizzaFuncional itens={filtrados} /> : <GraficoParetoPlaceholder itens={filtrados} />}
          </div>
        </section>

        <section
          id="lista-etapas"
          className="scroll-mt-24 mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="w-10 px-3 py-3 sm:px-4" scope="col">
                    <span className="sr-only">Ordenar</span>
                    <IconeOrdenar />
                  </th>
                  <th className="px-3 py-3 font-semibold text-[#1e293b] sm:px-4" scope="col">
                    Centro de Custo
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-[#1e293b] sm:px-4" scope="col">
                    Percentual
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#1e293b] sm:px-4" scope="col">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                  >
                    <td className="px-3 py-3 align-middle sm:px-4">
                      <IconeArrastar />
                    </td>
                    <td className="px-3 py-3 align-middle sm:px-4">
                      <button
                        type="button"
                        className="text-left font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-700"
                      >
                        {row.nome}
                      </button>
                      <p className="mt-0.5 text-xs text-slate-500">{LABEL_TIPO[row.tipo]}</p>
                    </td>
                    <td className="px-3 py-3 text-center align-middle text-slate-600 sm:px-4">
                      {row.percentual ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {row.percentual}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-[#1e293b] sm:px-4">
                      {formatarMoeda(row.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
