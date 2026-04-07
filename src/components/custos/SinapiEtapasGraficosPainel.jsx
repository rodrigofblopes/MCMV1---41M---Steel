import { useMemo } from 'react'
import { formatarMoeda } from '../../utils/formatadores.js'
import { pathsPizzaEtapas, serieParetoEtapas } from '../../utils/sinapiEtapasGrafico.js'

function pillNavClass(active) {
  return [
    'rounded-full px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
    active
      ? 'bg-slate-900 text-white shadow-sm'
      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ].join(' ')
}

function PizzaEtapas({ items }) {
  const cx = 50
  const cy = 50
  const r = 42
  const paths = useMemo(() => pathsPizzaEtapas(items, cx, cy, r), [items])

  if (paths.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500">Sem dados para o gráfico.</div>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto h-56 w-56 max-w-full drop-shadow-sm sm:h-64 sm:w-64"
      role="img"
      aria-label="Distribuição do orçamento por etapa da planilha sintética SINAPI"
    >
      {paths.map((p) => (
        <path key={p.id} d={p.d} fill={p.cor} stroke="#fff" strokeWidth="0.35" />
      ))}
    </svg>
  )
}

function ParetoEtapas({ serie }) {
  const { bars, linePoints, maxVal } = useMemo(() => {
    if (!serie.length) return { bars: [], linePoints: '', maxVal: 1 }
    const maxVal = Math.max(...serie.map((s) => s.valor), 1)
    const n = serie.length
    const gap = 1.2
    const barW = (100 - gap * (n + 1)) / n
    const bars = serie.map((s, i) => {
      const x = gap + i * (barW + gap)
      const h = (s.valor / maxVal) * 58
      return { x, w: barW, h, cor: s.cor, id: s.id }
    })
    const linePoints = serie
      .map((s, i) => {
        const x = gap + i * (barW + gap) + barW / 2
        const y = 70 - (s.pctAcumulado / 100) * 55
        return `${x},${y}`
      })
      .join(' ')
    return { bars, linePoints, maxVal }
  }, [serie])

  if (!serie.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500">Sem dados para o gráfico.</div>
    )
  }

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 100 72"
        className="h-52 w-full max-h-64"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Pareto: etapas por valor e curva acumulada"
      >
        {bars.map((b) => (
          <rect
            key={b.id}
            x={b.x}
            y={70 - b.h}
            width={b.w}
            height={b.h}
            rx="0.4"
            fill={b.cor}
          />
        ))}
        <polyline
          fill="none"
          stroke="#0f172a"
          strokeWidth="0.45"
          strokeLinejoin="round"
          points={linePoints}
        />
        <text x="98" y="16" fontSize="3" fill="#64748b" textAnchor="end">
          % acum.
        </text>
        <line x1="2" y1="70" x2="98" y2="70" stroke="#e2e8f0" strokeWidth="0.3" />
      </svg>
      <p className="mt-1 text-center text-[10px] text-slate-500">
        Barras = valor por etapa (ordenado). Linha escura = percentual acumulado no total geral.
      </p>
    </div>
  )
}

/**
 * @param {{
 *   tipoVisual: 'pizza' | 'pareto',
 *   onTipoVisual: (v: 'pizza' | 'pareto') => void,
 *   dados: { rows: Array, totalValor: number },
 * }} props
 */
export default function SinapiEtapasGraficosPainel({ tipoVisual, onTipoVisual, dados }) {
  const seriePareto = useMemo(() => serieParetoEtapas(dados.rows), [dados.rows])

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-end">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de gráfico">
          <button
            type="button"
            role="tab"
            aria-selected={tipoVisual === 'pizza'}
            className={pillNavClass(tipoVisual === 'pizza')}
            onClick={() => onTipoVisual('pizza')}
          >
            Pizza
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tipoVisual === 'pareto'}
            className={pillNavClass(tipoVisual === 'pareto')}
            onClick={() => onTipoVisual('pareto')}
          >
            Pareto
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <div className="shrink-0">
          {tipoVisual === 'pizza' ? (
            <PizzaEtapas items={dados.rows} />
          ) : (
            <ParetoEtapas serie={seriePareto} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Legenda</p>
          {dados.rows.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma etapa para exibir.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {dados.rows.map((r) => (
                <li key={r.id} className="flex min-w-0 items-start gap-2 text-sm">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: r.cor }}
                    aria-hidden
                  />
                  <span className="min-w-0 leading-snug text-slate-800">
                    <span className="font-medium">{r.rotuloCurto}</span>
                    <span className="mt-0.5 block text-xs tabular-nums text-slate-600">
                      {formatarMoeda(r.valor)}{' '}
                      <span className="text-slate-400">
                        ({r.pctVisual.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%)
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {dados.totalValor > 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Total geral (etapas): <strong className="text-slate-800">{formatarMoeda(dados.totalValor)}</strong>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
