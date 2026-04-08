import { useMemo, useState } from 'react'
import orcamento from '../data/sinapiOrcamento.json'
import SinapiEtapasGraficosPainel from '../components/custos/SinapiEtapasGraficosPainel.jsx'
import { formatarMoeda } from '../utils/formatadores.js'
import { agregarSinapiLinhasPorEtapa } from '../utils/sinapiAgregacaoEtapas.js'
import { filtrarEtapasSinapiParaGrafico } from '../utils/sinapiEtapasGrafico.js'

function nivelIndentacao(itemRef) {
  const t = String(itemRef || '').trim()
  if (!t) return 0
  return t.split('.').length
}

function formatarPeso(pesoStr) {
  const n = Number(String(pesoStr).replace(',', '.'))
  if (Number.isNaN(n)) return '—'
  return `${(n * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`sticky top-0 z-10 border-b border-slate-200 bg-slate-100 px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  )
}

function subTabSinapiClass(active) {
  return [
    'inline-flex min-h-[44px] items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:min-h-0 sm:px-4',
    active ? 'bg-sky-100 text-sky-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
  ].join(' ')
}

export default function CustosSinapi() {
  const [vista, setVista] = useState('planilha')
  const [tipoGraficoEtapas, setTipoGraficoEtapas] = useState('pizza')

  const { cabecalho, resumoTotais, linhas } = orcamento

  const linhasCorpo = useMemo(() => linhas.filter((l) => l.tipo !== 'rodape_total'), [linhas])

  const etapasSinapi = useMemo(() => agregarSinapiLinhasPorEtapa(linhas), [linhas])

  const dadosEtapas = useMemo(
    () => filtrarEtapasSinapiParaGrafico(etapasSinapi.rows, 'todos'),
    [etapasSinapi.rows],
  )

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] pb-12 text-[#1e293b]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Custos · SINAPI</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {cabecalho.planilhaTitulo || 'Orçamento sintético'}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Orçamento sintético SINAPI · ficheiro: {cabecalho.arquivoOrigem || 'planilha exportada'}
            </p>
          </div>
        </div>

        {cabecalho.notaFonteNumerica ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm">
            {cabecalho.notaFonteNumerica}
          </div>
        ) : null}

        {/* Cabeçalho da obra */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{cabecalho.obra}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
              {cabecalho.sinapiReferencia}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
              BDI {cabecalho.bdi}
            </span>
          </div>
          {cabecalho.notaEncargos ? (
            <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950">
              {cabecalho.notaEncargos}
            </p>
          ) : null}
        </div>

        {/* Resumo em cards */}
        {resumoTotais ? (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">Total geral</p>
              <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                R$ {resumoTotais.totalGeral || resumoTotais.totalComposicao || '—'}
              </p>
              <p className="mt-2 text-xs text-white/60">Inclui composição de custos da planilha</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mão de obra</p>
              <p className="mt-2 text-xl font-bold text-slate-900">R$ {resumoTotais.totalMO || '—'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Material</p>
              <p className="mt-2 text-xl font-bold text-slate-900">R$ {resumoTotais.totalMAT || '—'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total sem BDI / BDI</p>
              <p className="mt-2 text-lg font-bold text-slate-900">R$ {resumoTotais.totalSemBDI || '—'}</p>
              <p className="mt-1 text-sm text-slate-600">BDI: R$ {resumoTotais.totalBDI ?? '—'}</p>
            </div>
          </div>
        ) : null}

        <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm sm:p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Visualização</p>
          <div
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Modo de visualização do orçamento SINAPI"
          >
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'planilha'}
              onClick={() => setVista('planilha')}
              className={[subTabSinapiClass(vista === 'planilha'), 'shrink-0 snap-start'].join(' ')}
            >
              Extração (41 m²)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'etapas'}
              onClick={() => setVista('etapas')}
              className={[subTabSinapiClass(vista === 'etapas'), 'shrink-0 snap-start'].join(' ')}
            >
              Por Etapas
            </button>
          </div>
        </div>

        {vista === 'planilha' ? (
          <>
            {/* Tabela */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <div className="max-h-[min(70vh,720px)] overflow-auto">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>Item</Th>
                      <Th>Código</Th>
                      <Th>Banco</Th>
                      <Th className="min-w-[220px]">Descrição</Th>
                      <Th>Und</Th>
                      <Th>Quant.</Th>
                      <Th>V. unit.</Th>
                      <Th>Total M.O.</Th>
                      <Th>Total mat.</Th>
                      <Th>Total</Th>
                      <Th>%</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {linhasCorpo.map((l, idx) => {
                      if (l.tipo === 'secao') {
                        const n = nivelIndentacao(l.item)
                        return (
                          <tr
                            key={`s-${idx}-${l.item}`}
                            className={n <= 1 ? 'bg-sky-100/90' : n === 2 ? 'bg-sky-50/95' : 'bg-slate-50/90'}
                          >
                            <td className="whitespace-nowrap px-2 py-2.5 font-mono text-xs font-bold text-sky-950">
                              {l.item}
                            </td>
                            <td colSpan={2} className="px-2 py-2.5" />
                            <td
                              className="px-2 py-2.5 font-semibold text-slate-900"
                              style={{ paddingLeft: `${8 + (n - 1) * 12}px` }}
                            >
                              {l.descricao}
                            </td>
                            <td colSpan={3} className="px-2 py-2.5" />
                            <td className="px-2 py-2.5" />
                            <td className="px-2 py-2.5" />
                            <td className="whitespace-nowrap px-2 py-2.5 text-right font-semibold tabular-nums text-slate-800">
                              {l.total ? `R$ ${l.total}` : '—'}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2.5 text-right text-xs tabular-nums text-slate-600">
                              {formatarPeso(l.peso)}
                            </td>
                          </tr>
                        )
                      }

                      if (l.tipo === 'servico') {
                        const n = nivelIndentacao(l.item)
                        return (
                          <tr
                            key={`v-${idx}-${l.item}-${l.codigo}`}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-slate-600">{l.item}</td>
                            <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-slate-700">{l.codigo}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-xs font-medium text-slate-600">{l.banco}</td>
                            <td
                              className="max-w-md px-2 py-2 text-xs leading-snug text-slate-800"
                              style={{ paddingLeft: `${8 + (n - 1) * 10}px` }}
                            >
                              {l.descricao}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-xs text-slate-600">{l.und}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums text-slate-700">
                              {l.quant}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums text-slate-700">
                              {l.valorUnit}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums text-slate-800">
                              {l.totalMO}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums text-slate-800">
                              {l.totalMAT}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs font-semibold tabular-nums text-slate-900">
                              {l.total}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 text-right text-xs tabular-nums text-slate-500">
                              {formatarPeso(l.peso)}
                            </td>
                          </tr>
                        )
                      }

                      return null
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <SinapiEtapasGraficosPainel
              tipoVisual={tipoGraficoEtapas}
              onTipoVisual={setTipoGraficoEtapas}
              dados={dadosEtapas}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <div className="max-h-[min(70vh,720px)] overflow-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th className="min-w-[200px]">Etapa</Th>
                      <Th className="text-right">%</Th>
                      <Th className="text-right">Total</Th>
                      <Th className="text-right">Mão de obra</Th>
                      <Th className="text-right">Material</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dadosEtapas.rows.map((row, idx) => (
                      <tr key={row.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                        <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{row.nome}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-slate-700">
                          {row.pctVisual.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-slate-900">
                          {formatarMoeda(row.valor)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-slate-800">
                          {formatarMoeda(row.mo)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-slate-800">
                          {formatarMoeda(row.mat)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-100/90 font-semibold">
                      <td className="px-3 py-3 text-slate-900">Total</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-800">
                        {dadosEtapas.rows.length > 0
                          ? `${dadosEtapas.rows.reduce((s, r) => s + r.pctVisual, 0).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`
                          : '—'}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-900">
                        {formatarMoeda(dadosEtapas.totalValor)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-900">
                        {formatarMoeda(dadosEtapas.totalMO)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-900">
                        {formatarMoeda(dadosEtapas.totalMAT)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
