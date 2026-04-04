import { useState } from 'react'
import { Link } from 'react-router-dom'
import { modoInvestidor } from '../../config/modoInvestidor.js'
import { ROTULO_LINHA_PRODUTO } from '../../constants/areaProjeto.js'
import {
  CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO,
  FATOR_OBRA_SUPORTE,
  VALOR_MERCADO_TERRENO_PADRAO,
  VALOR_REMUNERACAO_INCORPORADOR_PADRAO,
  VGV_REFERENCIA_POR_UNIDADE,
} from '../../constants/viabilidadeProjeto.js'
import { useEmpreendimento } from '../../contexts/EmpreendimentoContext.jsx'
import { useViabilidadeCalcStorage } from '../../hooks/useViabilidadeCalcStorage.js'
import { useIntegracaoCustosViabilidade } from '../../hooks/useIntegracaoCustosViabilidade.js'
import { lerCubAplicadoViabilidade } from '../../hooks/cubAplicadoViabilidade.js'
import { formatarMoeda, precoParaCampoTexto } from '../../utils/formatadores.js'
import { parseMoedaBR, parsePercentBR } from '../../utils/parseValoresBR.js'

function tempoRelativoSalvo(ts) {
  if (!ts) return 'Nunca salvo'
  const d = Date.now() - ts
  const dia = 86400000
  if (d < 60000) return 'Agora há pouco'
  if (d < dia) return 'Hoje'
  if (d < 2 * dia) return '1 dia atrás'
  return `${Math.floor(d / dia)} dias atrás`
}

function inputBase(disabled) {
  return [
    'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow]',
    disabled
      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-700'
      : 'border-slate-200 bg-white text-[#1e293b] focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
  ].join(' ')
}

function Label({ children, obrigatorio }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
      {children}
      {obrigatorio ? <span className="text-red-500"> *</span> : null}
    </label>
  )
}

function Ajuda({ children }) {
  return <p className="mt-1 text-xs text-slate-500">{children}</p>
}

function IconeProjeto() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}
function IconePessoas() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconeGrafico() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 12l4-4 4 4 6-6" />
    </svg>
  )
}
function IconeEficiencia() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}
function IconeTerreno() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 21h18M6 21V8l6-4 6 4v13" />
      <path d="M9 21v-4h6v4" />
    </svg>
  )
}
function IconeRemuneracao() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

const ABAS = [
  { id: 'projeto', label: 'Projeto', shortLabel: 'Projeto', Icon: IconeProjeto },
  { id: 'investidores', label: 'Investidores', shortLabel: 'Invest.', Icon: IconePessoas },
  { id: 'rentabilidade', label: 'Rentabilidade', shortLabel: 'Rentab.', Icon: IconeGrafico },
  { id: 'eficiencia', label: 'Eficiência', shortLabel: 'Efic.', Icon: IconeEficiencia },
  { id: 'terreno', label: 'Terreno', shortLabel: 'Terreno', Icon: IconeTerreno },
  { id: 'remuneracao', label: 'Remuneração', shortLabel: 'Remun.', Icon: IconeRemuneracao },
]

export default function CalculadoraViabilidade() {
  const somenteLeitura = modoInvestidor
  const { dados } = useEmpreendimento()
  const nomeProjeto = dados.nomeProjeto?.trim() || dados.nome?.trim() || 'Empreendimento'
  const { state, setSecao, salvarAgora } = useViabilidadeCalcStorage()
  const [aba, setAba] = useState('projeto')

  // Integração com Custos do Projeto
  const {
    integracaoAtiva,
    precoSugerido,
    obraOrigemCub,
    margemAplicada,
    custoTotalProjetos,
    precoMercadoSincronizaComPesquisa,
  } = useIntegracaoCustosViabilidade()

  const p = state.projeto
  const inv = state.investidores
  const rent = state.rentabilidade
  const terr = state.terreno
  const rem = state.remuneracao

  const valorMercadoTerrenoNum = Math.max(0, parseMoedaBR(terr.valorMercadoTerreno))
  /** Mesmo critério da permuta (aba Terreno): mercado ou padrão R$ 100 mil — somado ao Obra + Suporte. */
  const valorTerrenoIncorporadoNum =
    valorMercadoTerrenoNum > 0 ? valorMercadoTerrenoNum : VALOR_MERCADO_TERRENO_PADRAO

  const nUnidades = Math.max(0, parseInt(String(p.unidades).replace(/\D/g, '') || '0', 10) || 0)
  const cubLeitura = lerCubAplicadoViabilidade()
  const cubStr = (cubLeitura?.custoTotalConstrucao || '').trim()
  const cubNumLeitura = parseMoedaBR(cubStr)
  /** Total estimado (CUB × m² memorial) da aba Custos tem prioridade sobre a soma das etapas. */
  const textoCustoTotal =
    cubNumLeitura > 0
      ? cubStr
      : custoTotalProjetos > 0
        ? precoParaCampoTexto(custoTotalProjetos)
        : (p.custoTotalConstrucao || '').trim()
  const custoTotalNum =
    cubNumLeitura > 0
      ? cubNumLeitura
      : custoTotalProjetos > 0
        ? custoTotalProjetos
        : parseMoedaBR(textoCustoTotal)

  /** Parte construção: apenas o custo total informado (× fator, hoje 1); não multiplica por unidades. */
  const valorObraSuporteConstrucaoNum =
    custoTotalNum > 0 ? custoTotalNum * FATOR_OBRA_SUPORTE : 0
  /** Obra + Suporte = custo total de construção + valor do terreno (aba Terreno). */
  const valorObraSuporteNum = valorObraSuporteConstrucaoNum + valorTerrenoIncorporadoNum
  const textoObraSuporte =
    valorObraSuporteNum > 0 ? precoParaCampoTexto(valorObraSuporteNum) : ''
  const ajudaObraCub = Boolean(cubLeitura?.custoTotalConstrucao)
  const totalBloqueadoEdicao = ajudaObraCub || integracaoAtiva || somenteLeitura
  const precoUnidade = parseMoedaBR(p.precoMercadoUnidade)
  /** VGV de referência MCMV (tributos, %, campo VGV); não usa o preço da pesquisa. */
  const vgv = nUnidades > 0 ? VGV_REFERENCIA_POR_UNIDADE * nUnidades : 0
  const vgvPotencialMercadoNum =
    nUnidades > 0 && precoUnidade > 0 ? precoUnidade * nUnidades : 0

  const taxaImp = parsePercentBR(rent.taxaImposto)
  const taxaCorr = parsePercentBR(rent.taxaCorretagem)
  const duracaoMesesNum = Math.max(0, parseInt(String(p.duracaoMeses).replace(/\D/g, '') || '0', 10) || 0)
  /** Repartição linear do custo Obra + Suporte (aba Projeto) pelos meses — não é fluxo de caixa de vendas. */
  const fluxoCaixaMensalCalculadoNum =
    duracaoMesesNum > 0 && valorObraSuporteNum > 0 ? valorObraSuporteNum / duracaoMesesNum : 0
  const textoFluxoCaixaMensalCalculado =
    fluxoCaixaMensalCalculadoNum > 0 ? precoParaCampoTexto(fluxoCaixaMensalCalculadoNum) : ''
  const cargaTributaria = vgv * (taxaImp / 100)
  const comissaoVenda = vgv * (taxaCorr / 100)
  const despesasVenda = cargaTributaria + comissaoVenda

  /** Eficiência: valor final = VGV (preço × unidades; sem preço, VGV de referência MCMV). */
  const vgvEficiencia = vgvPotencialMercadoNum > 0 ? vgvPotencialMercadoNum : vgv
  const capitalInvestidoEficiencia = valorObraSuporteNum
  const cargaTributariaEficiencia = vgvEficiencia * (taxaImp / 100)
  const comissaoVendaEficiencia = vgvEficiencia * (taxaCorr / 100)
  const lucroLiquidoEficiencia =
    vgvEficiencia - valorObraSuporteNum - cargaTributariaEficiencia - comissaoVendaEficiencia
  const retornoLiquidoEficiencia = vgvEficiencia - capitalInvestidoEficiencia
  const roiEficienciaPct =
    capitalInvestidoEficiencia > 0 ? (lucroLiquidoEficiencia / capitalInvestidoEficiencia) * 100 : 0
  const textoRoiEficiencia = `${roiEficienciaPct.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`

  const unidPagTerrenoNum = Math.max(0, parseMoedaBR(terr.unidadesPagamentoTerreno))
  const saldoUnidades = Math.max(0, nUnidades - unidPagTerrenoNum)
  const valorTerrenoPermuta = valorTerrenoIncorporadoNum
  const pctPermuta = vgv > 0 ? (valorTerrenoPermuta / vgv) * 100 : 0

  /** Remuneração em R$ (padrão R$ 5 mil); % = valor ÷ VGV de referência. */
  const valorRemuneracaoIncorpNum = Math.max(0, parseMoedaBR(rem.valorIncorporador))
  const pctRemuneracaoIncorp = vgv > 0 ? (valorRemuneracaoIncorpNum / vgv) * 100 : 0
  const unidadeEquivRemuneracaoIncorpNum =
    VGV_REFERENCIA_POR_UNIDADE > 0 ? valorRemuneracaoIncorpNum / VGV_REFERENCIA_POR_UNIDADE : 0
  const textoUnidadeEquivRemuneracaoIncorp =
    valorRemuneracaoIncorpNum > 0
      ? unidadeEquivRemuneracaoIncorpNum.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })
      : ''

  function salvarEImprimir() {
    salvarAgora()
    requestAnimationFrame(() => window.print())
  }

  function renderPainel() {
    switch (aba) {
      case 'projeto':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label obrigatorio>Unidades</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputBase(false)}
                  value={p.unidades}
                  onChange={(e) => setSecao('projeto', { unidades: e.target.value })}
                  placeholder="1"
                />
                <Ajuda>Quantidade total de unidades do empreendimento</Ajuda>
              </div>
              <div>
                <Label obrigatorio>Custo Total de Construção</Label>
                <div
                  className={`flex rounded-xl border border-slate-200 shadow-sm ${totalBloqueadoEdicao ? 'bg-slate-100' : 'bg-white focus-within:ring-2 focus-within:ring-slate-200'}`}
                >
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    readOnly={totalBloqueadoEdicao}
                    className={`min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none ${totalBloqueadoEdicao ? 'cursor-not-allowed text-slate-700' : ''}`}
                    value={textoCustoTotal}
                    onChange={
                      totalBloqueadoEdicao
                        ? undefined
                        : (e) => setSecao('projeto', { custoTotalConstrucao: e.target.value })
                    }
                    placeholder={precoParaCampoTexto(CUSTO_TOTAL_CONSTRUCAO_REFERENCIA_PADRAO)}
                  />
                </div>
                {custoTotalProjetos > 0 ? (
                  <Ajuda>
                    Mesmo valor da <strong>soma das etapas</strong> na aba Custos / CUB (atualiza ao alterar os
                    centros de custo).
                  </Ajuda>
                ) : ajudaObraCub || obraOrigemCub ? (
                  <Ajuda>
                    Total de construção estimado pelo CUB aplicado em Custos (sem linhas de etapa ou soma zero).
                  </Ajuda>
                ) : (
                  <Ajuda>
                    <strong>Custo total de construção</strong> do empreendimento (não multiplica pelo número de unidades).{' '}
                    <strong>Obra + Suporte</strong> = este valor + custo do terreno (aba Terreno).
                  </Ajuda>
                )}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                  Custo da Obra + Suporte
                </label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    readOnly
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none cursor-not-allowed text-slate-700"
                    value={textoObraSuporte}
                    placeholder={custoTotalNum <= 0 ? '—' : '0,00'}
                  />
                </div>
                <Ajuda>
                  <strong>Custo total de construção</strong> + valor do terreno (padrão R${' '}
                  {precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO)} — aba Terreno).
                </Ajuda>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-sm font-semibold text-[#1e293b]">
                    Preço de Mercado por Unidade
                    <span className="text-red-500"> *</span>
                  </label>
                  {precoSugerido !== '0,00' && !precoMercadoSincronizaComPesquisa && !somenteLeitura && (
                    <button
                      type="button"
                      onClick={() => setSecao('projeto', { precoMercadoUnidade: precoSugerido })}
                      className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 hover:bg-blue-200 transition-colors cursor-pointer"
                      title={`Clique para aplicar o valor sugerido: R$ ${precoSugerido}`}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-medium text-blue-700">
                        Sugerido +{margemAplicada}%
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={p.precoMercadoUnidade}
                    onChange={(e) => setSecao('projeto', { precoMercadoUnidade: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                {precoMercadoSincronizaComPesquisa ? (
                  <Ajuda>
                    Valor alinhado ao painel <strong>Valor da unidade com correção</strong> na aba Pesquisa (média
                    R$/m² × área da unidade × fator de correção). Atualiza quando a pesquisa muda; pode editar à mão
                    para cenários alternativos.
                  </Ajuda>
                ) : precoSugerido !== '0,00' ? (
                  <Ajuda>
                    Campo editável. Sugestão: (custo total de construção) + {margemAplicada}%. Clique no badge para
                    aplicar R$ {precoSugerido}
                  </Ajuda>
                ) : (
                  <Ajuda>Preço de mercado esperado por unidade</Ajuda>
                )}
              </div>
              <div>
                <Label obrigatorio>Duração do Projeto (meses)</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputBase(false)}
                  value={p.duracaoMeses}
                  onChange={(e) => setSecao('projeto', { duracaoMeses: e.target.value })}
                  placeholder="3"
                />
                <Ajuda>Duração prevista do projeto em meses</Ajuda>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Total (obra + terreno)</Label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none cursor-not-allowed text-slate-700"
                    value={textoObraSuporte}
                    placeholder={custoTotalNum <= 0 ? '—' : '0,00'}
                  />
                </div>
                <Ajuda>
                  Mesmo valor de <strong>Custo da Obra + Suporte</strong>: custo total de construção + terreno.
                </Ajuda>
              </div>
              <div>
                <Label>VGV (Valor Geral de Vendas)</Label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none cursor-not-allowed text-slate-700"
                    value={vgv > 0 ? precoParaCampoTexto(vgv) : ''}
                    placeholder="—"
                  />
                </div>
                <Ajuda>
                  Referência do empreendimento: <strong>R$ {precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)}</strong> por
                  unidade × número de unidades (impostos e % sobre VGV usam este total). O preço por unidade acima vem da{' '}
                  <strong>pesquisa de mercado</strong>
                  {vgvPotencialMercadoNum > 0
                    ? ` (hoje: preço × unidades ≈ R$ ${precoParaCampoTexto(vgvPotencialMercadoNum)}).`
                    : '.'}
                </Ajuda>
              </div>
            </div>
          </div>
        )
      case 'investidores':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label obrigatorio>Taxa de Desconto do Investidor</Label>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={inv.taxaDesconto}
                    onChange={(e) => setSecao('investidores', { taxaDesconto: e.target.value })}
                    placeholder="3"
                  />
                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">%</span>
                </div>
                <Ajuda>Padrão do empreendimento: <strong>3%</strong> (referência de cenário com investidor).</Ajuda>
              </div>
              <div>
                <Label>Número de investidores</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputBase(false)}
                  value={inv.numInvestidores}
                  onChange={(e) => setSecao('investidores', { numInvestidores: e.target.value })}
                  placeholder="1"
                />
                <Ajuda>
                  Padrão do empreendimento: <strong>1</strong> investidor.
                </Ajuda>
              </div>
              <div>
                <Label>Valor da capitalização</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={formatarMoeda(valorObraSuporteNum)}
                />
                <Ajuda>
                  <strong>Não é digitável.</strong> Igual ao total <strong>Custo da Obra + Suporte</strong> /{' '}
                  <strong>Total (obra + terreno)</strong> na aba Projeto (custo total de construção + terreno).
                </Ajuda>
              </div>
              <div>
                <Label>Valor por unidade (investidor)</Label>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none cursor-not-allowed text-slate-700"
                    value={precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)}
                  />
                </div>
                <Ajuda>
                  Valor fixo do empreendimento: <strong>R$ {precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)}</strong> por
                  unidade (referência MCMV).
                </Ajuda>
              </div>
            </div>
          </div>
        )
      case 'rentabilidade':
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Label>Fluxo de Caixa Mensal</Label>
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3 text-sm text-slate-600">R$</span>
                <input
                  type="text"
                  readOnly
                  tabIndex={-1}
                  className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none"
                  value={textoFluxoCaixaMensalCalculado}
                  placeholder="—"
                />
              </div>
              <Ajuda>
                Resultado: (Obra + Suporte na aba Projeto) ÷ duração em meses. Obra + Suporte = custo total de construção +
                terreno. Repartição linear — não substitui um fluxo detalhado.
              </Ajuda>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label obrigatorio>Taxa de Imposto</Label>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={rent.taxaImposto}
                    onChange={(e) => setSecao('rentabilidade', { taxaImposto: e.target.value })}
                    placeholder="4"
                  />
                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">%</span>
                </div>
                <Ajuda>Padrão do empreendimento: 4% sobre o VGV (ajuste conforme o regime tributário).</Ajuda>
              </div>
              <div>
                <Label>Carga tributária</Label>
                <input type="text" readOnly className={inputBase(true)} value={formatarMoeda(cargaTributaria)} />
              </div>
              <div>
                <Label obrigatorio>Taxa de corretagem</Label>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={rent.taxaCorretagem}
                    onChange={(e) => setSecao('rentabilidade', { taxaCorretagem: e.target.value })}
                    placeholder="5"
                  />
                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">%</span>
                </div>
                <Ajuda>Padrão do empreendimento: 5% sobre o VGV (comissão de vendas).</Ajuda>
              </div>
              <div>
                <Label>Comissão de venda</Label>
                <input type="text" readOnly className={inputBase(true)} value={formatarMoeda(comissaoVenda)} />
              </div>
            </div>
            <div>
              <Label>Despesas de Venda</Label>
              <input type="text" readOnly className={inputBase(true)} value={formatarMoeda(despesasVenda)} />
            </div>
          </div>
        )
      case 'eficiencia':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Retorno Líquido</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={vgvEficiencia > 0 || capitalInvestidoEficiencia > 0 ? formatarMoeda(retornoLiquidoEficiencia) : ''}
                  placeholder="—"
                />
                <Ajuda>
                  <strong>Valor final − capital investido.</strong> O valor final é o VGV (preço × unidades na aba Projeto;
                  sem preço de mercado, usa o VGV de referência). O capital investido é a{' '}
                  <strong>capitalização</strong> da aba Investidores (total Obra + Suporte).
                </Ajuda>
              </div>
              <div>
                <Label>Lucro Líquido</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={
                    vgvEficiencia > 0 || valorObraSuporteNum > 0 ? formatarMoeda(lucroLiquidoEficiencia) : ''
                  }
                  placeholder="—"
                />
                <Ajuda>
                  <strong>VGV − (Obra + Suporte) − carga tributária − comissão de venda.</strong> Imposto e corretagem são
                  as taxas da aba Rentabilidade, aplicadas sobre o mesmo VGV usado acima.
                </Ajuda>
              </div>
              <div>
                <Label>ROI</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={capitalInvestidoEficiencia > 0 ? textoRoiEficiencia : '0,00%'}
                  placeholder="—"
                />
                <Ajuda>
                  <strong>(Lucro líquido ÷ capital investido) × 100.</strong> O lucro líquido já desconta obra, impostos e
                  corretagem. Se a capitalização for zero, o ROI aparece como <strong>0%</strong>.
                </Ajuda>
              </div>
              <div>
                <Label>Rentabilidade líquida mensal (TIR)</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value="1,5% a.m."
                  placeholder="—"
                />
                <Ajuda>
                  Meta de referência do empreendimento: <strong>1,5% ao mês</strong> (ajustada ao fluxo e ao prazo na análise
                  completa).
                </Ajuda>
              </div>
            </div>
          </div>
        )
      case 'terreno':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <Label>Saldo de unidades</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={saldoUnidades.toLocaleString('pt-BR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 4,
                  })}
                />
              </div>
              <div>
                <Label obrigatorio>Unidades para Pagamento de Terreno</Label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputBase(false)}
                  value={terr.unidadesPagamentoTerreno}
                  onChange={(e) => setSecao('terreno', { unidadesPagamentoTerreno: e.target.value })}
                  placeholder="0,455"
                />
                <Ajuda>
                  Unidades inteiras ou fração (ex.: <strong>0,455</strong> de unidade) usadas na permuta do terreno.
                </Ajuda>
              </div>
              <div>
                <Label obrigatorio>Valor de Mercado do Terreno</Label>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={terr.valorMercadoTerreno}
                    onChange={(e) => setSecao('terreno', { valorMercadoTerreno: e.target.value })}
                    placeholder={precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO)}
                  />
                </div>
                <Ajuda>
                  Padrão do empreendimento: <strong>R$ {precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO)}</strong>.
                </Ajuda>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Valor do terreno na permuta</Label>
                <input type="text" readOnly className={inputBase(true)} value={formatarMoeda(valorTerrenoPermuta)} />
                <Ajuda>
                  Igual ao <strong>valor de mercado do terreno</strong> acima (padrão{' '}
                  <strong>R$ {precoParaCampoTexto(VALOR_MERCADO_TERRENO_PADRAO)}</strong>). O percentual ao lado usa o VGV
                  de referência da aba Projeto.
                </Ajuda>
              </div>
              <div>
                <Label>% de permuta</Label>
                <input
                  type="text"
                  readOnly
                  className={inputBase(true)}
                  value={`${pctPermuta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
                />
                <Ajuda>
                  Percentual do valor da permuta sobre o <strong>VGV de referência</strong> da aba Projeto (R${' '}
                  {precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)} × número de unidades).
                </Ajuda>
              </div>
            </div>
          </div>
        )
      case 'remuneracao':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label obrigatorio>Valor do Incorporador</Label>
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    value={rem.valorIncorporador}
                    onChange={(e) => setSecao('remuneracao', { valorIncorporador: e.target.value })}
                    placeholder={precoParaCampoTexto(VALOR_REMUNERACAO_INCORPORADOR_PADRAO)}
                  />
                </div>
                <Ajuda>
                  Padrão do empreendimento: <strong>R$ {precoParaCampoTexto(VALOR_REMUNERACAO_INCORPORADOR_PADRAO)}</strong>.
                  A porcentagem abaixo usa o VGV de referência da aba Projeto (R${' '}
                  {precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)} × unidades).
                </Ajuda>
              </div>
              <div>
                <Label>Unidade equivalente (referência R$ 220 mil)</Label>
                <input
                  type="text"
                  readOnly
                  tabIndex={-1}
                  className={inputBase(true)}
                  value={textoUnidadeEquivRemuneracaoIncorp}
                  placeholder="—"
                />
                <Ajuda>
                  Valor do incorporador ÷ <strong>R$ {precoParaCampoTexto(VGV_REFERENCIA_POR_UNIDADE)}</strong> (fração de
                  unidade de referência).
                </Ajuda>
              </div>
            </div>
            <div>
              <Label>% sobre o VGV de referência</Label>
              <input
                type="text"
                readOnly
                className={inputBase(true)}
                value={`${pctRemuneracaoIncorp.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
              />
              <Ajuda>
                <strong>(Valor do incorporador ÷ VGV de referência) × 100.</strong> Com 1 unidade e R${' '}
                {precoParaCampoTexto(VALOR_REMUNERACAO_INCORPORADOR_PADRAO)}, resulta em aproximadamente{' '}
                <strong>2,27%</strong> (5 mil ÷ 220 mil).
              </Ajuda>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-3 py-4 text-[#1e293b] sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/apresentacao-investidor"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:bg-slate-100"
        >
          ← Voltar para {nomeProjeto}
        </Link>

        <header className="mt-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Calculadora de Viabilidade Preliminar</p>
            {somenteLeitura ? (
              <p className="mt-2 max-w-xl text-xs text-slate-600">
                Modo apresentação: cenário fixo para consulta do investidor (sem edição).
              </p>
            ) : null}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">{nomeProjeto}</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">{ROTULO_LINHA_PRODUTO}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" strokeLinecap="round" />
              </svg>
              Última atualização {tempoRelativoSalvo(state.updatedAt)}
            </p>
          </div>
        </header>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm sm:mt-8">
          <div className="flex gap-1 overflow-x-auto overscroll-x-contain border-b border-slate-200 bg-slate-100/90 p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {ABAS.map(({ id, label, shortLabel, Icon }) => {
              const ativo = aba === id
              return (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => setAba(id)}
                  className={[
                    'flex min-h-[48px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors sm:min-h-0 sm:min-w-0 sm:flex-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm',
                    ativo
                      ? 'border border-slate-200 border-b-white bg-white text-[#1e293b] shadow-sm sm:-mb-px sm:border-b-white sm:shadow-none'
                      : 'border border-transparent text-slate-600 active:bg-white/80 hover:bg-white/60 hover:text-[#1e293b]',
                  ].join(' ')}
                >
                  <Icon />
                  <span className="max-w-[4.5rem] truncate sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-4 sm:p-8">
            <fieldset disabled={somenteLeitura} className="m-0 min-w-0 border-0 p-0">
              {renderPainel()}
            </fieldset>
          </div>

          {somenteLeitura ? null : (
            <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:px-8">
              <span className="hidden sm:block sm:flex-1" />
              {aba === 'remuneracao' ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={salvarEImprimir}
                    className="min-h-[44px] rounded-full bg-[#00B37E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                  >
                    Salvar e imprimir
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
