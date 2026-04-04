import { useCallback, useMemo, useState } from 'react'
import { useAmostras } from '../../contexts/AmostrasContext.jsx'
import { useEmpreendimento } from '../../contexts/EmpreendimentoContext.jsx'
import { AREA_CONSTRUIDA_REF_TEXTO, ROTULO_PROJETO_COM_AREA } from '../../constants/areaProjeto.js'
import { modoInvestidor } from '../../config/modoInvestidor.js'
import { usePesquisaMercadoConfig } from '../../hooks/usePesquisaMercadoConfig.js'
import { calcularEstatisticas } from '../../utils/calculos.js'
import { formatarArea, formatarMoeda } from '../../utils/formatadores.js'
import { parseMoedaBR, parsePercentBR } from '../../utils/parseValoresBR.js'
import EditarPesquisaMercadoForm from './EditarPesquisaMercadoForm.jsx'
import MapSidebar from '../map/MapSidebar.jsx'
import MapView from '../map/MapView.jsx'
import StatsCard from '../ui/StatsCard.jsx'

const NOME_PROJETO_DEMO = ROTULO_PROJETO_COM_AREA

const CENTRO_FALLBACK_SEVILHA = [-8.8044348, -63.8092988]
const ZOOM_MAPA = 14

function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

function IconePredio() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 21h18M6 21V10l6-4 6 4v11M9 21v-4h6v4M10 13h1M13 13h1M10 16h1M13 16h1" />
    </svg>
  )
}

export default function DashboardPage() {
  const { amostras, removeAmostra } = useAmostras()
  const { sujeito, dados } = useEmpreendimento()
  const { config, setConfig } = usePesquisaMercadoConfig()
  const [edicaoPesquisaAberta, setEdicaoPesquisaAberta] = useState(false)
  const [draftFator, setDraftFator] = useState('')
  const [draftArea, setDraftArea] = useState('')
  const [modo, setModo] = useState('venda')
  const [camadaTerreno, setCamadaTerreno] = useState(true)
  const [camadaPrecos, setCamadaPrecos] = useState(true)
  const [camadaServicos, setCamadaServicos] = useState(false)
  const [alcanceTerrenos, setAlcanceTerrenos] = useState(true)
  const [mostrarNomes, setMostrarNomes] = useState(true)
  const [mostrarNomesCompletos, setMostrarNomesCompletos] = useState(false)
  const [visivelPorId, setVisivelPorId] = useState({})

  const stats = useMemo(() => calcularEstatisticas(amostras), [amostras])

  const centroMapa = useMemo(() => {
    const lat = Number(sujeito?.lat)
    const lng = Number(sujeito?.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    return CENTRO_FALLBACK_SEVILHA
  }, [sujeito?.lat, sujeito?.lng])

  const areaUnidadeM2 = parseMoedaBR(config.areaUnidadeM2)
  const valorUnidadeBruto =
    areaUnidadeM2 > 0 && stats.precoMedioM2 > 0 ? stats.precoMedioM2 * areaUnidadeM2 : 0
  const valorUnidadeDemo = Math.round(valorUnidadeBruto * 100) / 100
  const pctCorrecao = parsePercentBR(config.fatorCorrecaoPercent)
  const valorComCorrecaoDemo =
    Math.round(valorUnidadeDemo * (1 + pctCorrecao / 100) * 100) / 100

  const nomePainel = dados.nomeProjeto?.trim() || NOME_PROJETO_DEMO

  const abrirEdicaoPesquisa = useCallback(() => {
    setDraftFator(config.fatorCorrecaoPercent)
    setDraftArea(config.areaUnidadeM2.trim() || AREA_CONSTRUIDA_REF_TEXTO)
    setEdicaoPesquisaAberta(true)
  }, [config.areaUnidadeM2, config.fatorCorrecaoPercent])

  const salvarEdicaoPesquisa = useCallback(() => {
    setConfig({ fatorCorrecaoPercent: draftFator, areaUnidadeM2: draftArea })
    setEdicaoPesquisaAberta(false)
  }, [draftArea, draftFator, setConfig])

  const cancelarEdicaoPesquisa = useCallback(() => {
    setEdicaoPesquisaAberta(false)
  }, [])

  if (!modoInvestidor && edicaoPesquisaAberta) {
    return (
      <EditarPesquisaMercadoForm
        nomeProjeto={nomePainel}
        fatorCorrecao={draftFator}
        areaUnidadeM2={draftArea}
        onFatorChange={setDraftFator}
        onAreaUnidadeChange={setDraftArea}
        onVoltar={cancelarEdicaoPesquisa}
        onCancelar={cancelarEdicaoPesquisa}
        onSalvar={salvarEdicaoPesquisa}
      />
    )
  }

  function toggleVisivelAmostra(id) {
    setVisivelPorId((prev) => {
      const visivel = prev[id] !== false
      return { ...prev, [id]: !visivel }
    })
  }

  return (
    <div className="min-h-0 flex-1 px-3 py-5 text-[#1e293b] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#1e293b] sm:text-xl">{nomePainel}</h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {amostras.length} amostras ·{' '}
              <span className="font-medium text-slate-700">{modo === 'venda' ? 'Venda' : 'Locação'}</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-medium text-[#00B37E]">Portfólio e mapa disponíveis abaixo</span>
            </p>
          </div>
          <div
            className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
            role="group"
            aria-label="Tipo de negócio"
          >
            <button
              type="button"
              onClick={() => setModo('venda')}
              className={[
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                modo === 'venda' ? 'bg-[#00B37E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              Venda
            </button>
            <button
              type="button"
              onClick={() => setModo('locacao')}
              className={[
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                modo === 'locacao' ? 'bg-[#00B37E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              Locação
            </button>
          </div>
        </header>

        <section className="mb-5 grid gap-4 md:grid-cols-2">
          <StatsCard
            variant="hero"
            titulo="Valor da unidade"
            valor={formatarMoeda(valorUnidadeDemo)}
            grande
            icone={
              modoInvestidor ? null : (
                <button
                  type="button"
                  onClick={abrirEdicaoPesquisa}
                  className="rounded-md p-1 text-white/90 transition-colors hover:bg-white/15"
                  aria-label="Definir área da unidade e fator de correção"
                >
                  <GearIcon />
                </button>
              )
            }
          />
          <StatsCard
            variant="hero"
            titulo="Valor da unidade com correção"
            valor={formatarMoeda(valorComCorrecaoDemo)}
            grande
            icone={
              modoInvestidor ? null : (
                <button
                  type="button"
                  onClick={abrirEdicaoPesquisa}
                  className="rounded-md p-1 text-white/90 transition-colors hover:bg-white/15"
                  aria-label="Definir área da unidade e fator de correção"
                >
                  <GearIcon />
                </button>
              )
            }
          />
        </section>

        <section className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatsCard titulo="Valor máximo" valor={formatarMoeda(stats.precoMax)} />
          <StatsCard titulo="Valor médio" valor={formatarMoeda(stats.precoMedio)} destaque />
          <StatsCard titulo="Valor mínimo" valor={formatarMoeda(stats.precoMin)} />
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatsCard
            titulo="Área máxima"
            valor={formatarArea(stats.areaMax)}
            iconeEsquerda={<IconePredio />}
          />
          <StatsCard
            titulo="Área média"
            valor={formatarArea(stats.areaMedia)}
            destaque
            iconeEsquerda={<IconePredio />}
          />
          <StatsCard
            titulo="Área mínima"
            valor={formatarArea(stats.areaMin)}
            iconeEsquerda={<IconePredio />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex min-h-[min(52vh,560px)] flex-col md:flex-row md:min-h-[520px]">
            <MapSidebar
              camadaTerreno={camadaTerreno}
              onCamadaTerreno={setCamadaTerreno}
              camadaPrecos={camadaPrecos}
              onCamadaPrecos={setCamadaPrecos}
              camadaServicos={camadaServicos}
              onCamadaServicos={setCamadaServicos}
              amostras={amostras}
              visivelPorId={visivelPorId}
              onToggleVisivelAmostra={toggleVisivelAmostra}
              alcanceTerrenos={alcanceTerrenos}
              onAlcanceTerrenos={setAlcanceTerrenos}
              mostrarNomes={mostrarNomes}
              onMostrarNomes={setMostrarNomes}
              mostrarNomesCompletos={mostrarNomesCompletos}
              onMostrarNomesCompletos={setMostrarNomesCompletos}
              onRemoverAmostra={modoInvestidor ? undefined : removeAmostra}
              somenteLeitura={modoInvestidor}
            />
            <div className="min-h-[400px] min-w-0 flex-1 bg-slate-100 md:min-h-0">
              <MapView
                layout="embed"
                arredondarMapa={false}
                className="h-full min-h-[400px] rounded-none border-0 shadow-none md:min-h-full"
                centro={centroMapa}
                zoomInicial={ZOOM_MAPA}
                sujeito={sujeito}
                amostras={amostras}
                precoMedio={stats.precoMedio}
                camadaTerreno={camadaTerreno}
                camadaPrecos={camadaPrecos}
                camadaServicos={camadaServicos}
                visivelPorId={visivelPorId}
                alcanceTerrenos={alcanceTerrenos}
                mostrarNomes={mostrarNomes}
                mostrarNomesCompletos={mostrarNomesCompletos}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
