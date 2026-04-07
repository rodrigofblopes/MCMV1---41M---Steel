import { Link } from 'react-router-dom'
import { classificarAmostraPorDistancia } from '../../utils/calculos.js'
import { formatarArea, formatarMoeda } from '../../utils/formatadores.js'

function IconeMais() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BadgeDistancia({ classe }) {
  if (classe === 'dentro_500') {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
        &lt; 500m
      </span>
    )
  }
  if (classe === 'dentro_1000') {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
        &lt; 1km
      </span>
    )
  }
  if (classe === 'fora') {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
        &gt; 1km
      </span>
    )
  }
  return <span className="text-xs text-slate-400">—</span>
}

export default function AmostrasTable({
  amostras = [],
  /** Com lat/lng válidos, ativa coluna e estilos por distância ao terreno sujeito. */
  sujeito = null,
  /** Abre o modal de nova amostra (ex.: já dentro do Mercado). Sem isso, o link vai ao mapa com o modal. */
  onAdicionar,
  /** Remove a amostra do portfólio (após confirmação). */
  onRemover,
  /** Na página dedicada, o título fica fora do card. */
  ocultarTituloNoCard = false,
  /** Sem incluir/remover/editar (apresentação ao investidor). */
  somenteLeitura = false,
}) {
  const lista = Array.isArray(amostras) ? amostras : []

  const botaoAdicionar =
    somenteLeitura ? null : onAdicionar ? (
      <button
        type="button"
        onClick={onAdicionar}
        className="inline-flex items-center gap-2 rounded-lg bg-[#00B37E] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B37E]"
      >
        <IconeMais />
        Incluir amostra
      </button>
    ) : (
      <Link
        to="/apresentacao-investidor"
        state={{ openNovaAmostra: true }}
        className="inline-flex items-center gap-2 rounded-lg bg-[#00B37E] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B37E]"
      >
        <IconeMais />
        Incluir amostra
      </Link>
    )

  const mostrarDistancia =
    sujeito &&
    Number.isFinite(Number(sujeito.lat)) &&
    Number.isFinite(Number(sujeito.lng))

  const colCount = (mostrarDistancia ? 7 : 6) + (somenteLeitura ? 0 : 1)

  const mostrarBarraTopo = !ocultarTituloNoCard || botaoAdicionar

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {mostrarBarraTopo ? (
        <div
          className={[
            'flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3',
            ocultarTituloNoCard ? 'justify-end' : 'justify-between',
          ].join(' ')}
        >
          {!ocultarTituloNoCard ? (
            <h2 className="text-sm font-semibold text-[#1e293b]">Portfólio de amostras (proposta)</h2>
          ) : null}
          {botaoAdicionar}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-b-2xl">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-300 bg-[#e2e8f0] text-xs font-bold uppercase tracking-wide text-[#1e3a5f]">
            <tr>
              <th className="px-4 py-3 font-semibold">Amostra</th>
              <th className="px-4 py-3 text-right font-semibold">Área</th>
              <th className="px-4 py-3 text-center font-semibold">Banheiros</th>
              <th className="px-4 py-3 text-center font-semibold">Quartos</th>
              <th className="px-4 py-3 text-center font-semibold">Vagas</th>
              <th className="px-4 py-3 text-right font-semibold">Preço</th>
              {mostrarDistancia ? (
                <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Distância</th>
              ) : null}
              {somenteLeitura ? null : (
                <th className="min-w-[8.5rem] px-4 py-3 text-center font-semibold">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-10 text-center text-sm text-slate-500">
                  {somenteLeitura
                    ? 'Nenhuma amostra cadastrada nesta apresentação.'
                    : 'Nenhuma amostra no portfólio. Use Incluir amostra ou o + ao lado de "Mapa" para acrescentar comparáveis à proposta.'}
                </td>
              </tr>
            ) : (
              lista.map((a, index) => {
                const distClasse = mostrarDistancia ? classificarAmostraPorDistancia(sujeito, a) : null
                const opacaFora = distClasse === 'fora'
                const isServico = a.tipo === 'servico'

                return (
                  <tr
                    key={a.id}
                    className={[
                      'border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80',
                      index % 2 === 1 ? 'bg-slate-50/60' : 'bg-white',
                      opacaFora ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    <td className="max-w-md px-4 py-3 font-medium leading-snug text-[#1e293b] whitespace-normal">
                      {a.nome}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {isServico ? '—' : formatarArea(a.area)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">{isServico ? '—' : a.banheiros}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{isServico ? '—' : a.quartos}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{isServico ? '—' : a.vagas}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                      {isServico ? '—' : formatarMoeda(a.preco)}
                    </td>
                    {mostrarDistancia ? (
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <BadgeDistancia classe={distClasse} />
                      </td>
                    ) : null}
                    {somenteLeitura ? null : (
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                          <button
                            onClick={() => alert('Funcionalidade de edição será implementada em breve')}
                            className="text-sm font-medium text-slate-400 cursor-not-allowed"
                          >
                            Editar
                          </button>
                          {onRemover ? (
                            <>
                              <span className="text-slate-300" aria-hidden>
                                ·
                              </span>
                              <button
                                type="button"
                                className="text-sm font-medium text-red-600 hover:underline"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      'Remover esta amostra do portfólio da proposta? Não é possível desfazer.',
                                    )
                                  ) {
                                    onRemover(a.id)
                                  }
                                }}
                              >
                                Excluir
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
