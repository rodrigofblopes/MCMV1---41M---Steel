import { useCallback, useMemo, useState } from 'react'
import { useAmostras } from '../../contexts/AmostrasContext.jsx'
import { useEmpreendimento } from '../../contexts/EmpreendimentoContext.jsx'
import { AREA_CONSTRUIDA_REF_TEXTO, ROTULO_PROJETO_COM_AREA } from '../../constants/areaProjeto.js'
import { modoInvestidor } from '../../config/modoInvestidor.js'
import { usePesquisaMercadoConfig } from '../../hooks/usePesquisaMercadoConfig.js'
import {
  calcularEstatisticas,
  contagemAmostrasMercado,
  valorUnidadeComCorrecaoNumerico,
} from '../../utils/calculos.js'
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

function fmtAreaMetodo(m2) {
  if (!Number.isFinite(m2) || m2 <= 0) return '—'
  return `${m2.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m²`
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

const gearBtnHero = (onClick) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-md p-1 text-white/90 transition-colors hover:bg-white/15"
    aria-label="Definir áreas e fator de correção"
  >
    <GearIcon />
  </button>
)

export default function DashboardPage() {
  const { amostras, removeAmostra } = useAmostras()
  const { sujeito, dados } = useEmpreendimento()
  const { config, setConfig } = usePesquisaMercadoConfig()
  const [edicaoPesquisaAberta, setEdicaoPesquisaAberta] = useState(false)
  const [draftFator, setDraftFator] = useState('')
  const [draftArea, setDraftArea] = useState('')
  const [draftAreaTerreno, setDraftAreaTerreno] = useState('')
  const [camadaTerreno, setCamadaTerreno] = useState(true)
  const [camadaPrecos, setCamadaPrecos] = useState(true)
  const [camadaServicos, setCamadaServicos] = useState(false)
  const [alcanceTerrenos, setAlcanceTerrenos] = useState(true)
  const [mostrarNomes, setMostrarNomes] = useState(true)
  const [visivelPorId, setVisivelPorId] = useState({})

  const statsUnidades = useMemo(() => calcularEstatisticas(amostras, 'unidade'), [amostras])
  const contagem = useMemo(() => contagemAmostrasMercado(amostras), [amostras])

  const centroMapa = useMemo(() => {
    const lat = Number(sujeito?.lat)
    const lng = Number(sujeito?.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    return CENTRO_FALLBACK_SEVILHA
  }, [sujeito?.lat, sujeito?.lng])

  const areaUnidadeM2 = parseMoedaBR(config.areaUnidadeM2)
  const pctCorrecao = parsePercentBR(config.fatorCorrecaoPercent)
  const valorUnidadeBase = valorUnidadeComCorrecaoNumerico(amostras, areaUnidadeM2, 0)
  const valorUnidadeComCorrecao = valorUnidadeComCorrecaoNumerico(amostras, areaUnidadeM2, pctCorrecao)
  const nomePainel = dados.nomeProjeto?.trim() || NOME_PROJETO_DEMO

  const abrirEdicaoPesquisa = useCallback(() => {
    setDraftFator(config.fatorCorrecaoPercent)
    setDraftArea(config.areaUnidadeM2.trim() || AREA_CONSTRUIDA_REF_TEXTO)
    setDraftAreaTerreno(String(config.areaTerrenoM2 ?? '').trim())
    setEdicaoPesquisaAberta(true)
  }, [config.areaTerrenoM2, config.areaUnidadeM2, config.fatorCorrecaoPercent])

  const salvarEdicaoPesquisa = useCallback(() => {
    setConfig({
      fatorCorrecaoPercent: draftFator,
      areaUnidadeM2: draftArea,
      areaTerrenoM2: draftAreaTerreno,
    })
    setEdicaoPesquisaAberta(false)
  }, [draftArea, draftAreaTerreno, draftFator, setConfig])

  const cancelarEdicaoPesquisa = useCallback(() => {
    setEdicaoPesquisaAberta(false)
  }, [])

  if (!modoInvestidor && edicaoPesquisaAberta) {
    return (
      <EditarPesquisaMercadoForm
        nomeProjeto={nomePainel}
        fatorCorrecao={draftFator}
        areaUnidadeM2={draftArea}
        areaTerrenoM2={draftAreaTerreno}
        onFatorChange={setDraftFator}
        onAreaUnidadeChange={setDraftArea}
        onAreaTerrenoChange={setDraftAreaTerreno}
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
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">{nomePainel}</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {contagem.total} amostras
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-medium text-slate-600">Venda</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-medium text-[#00B37E]">Portfólio e mapa disponíveis abaixo</span>
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#00B37E] shadow-sm transition-colors hover:bg-slate-50"
            onClick={() =>
              document.getElementById('portfolio-amostras')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Pesquisa
          </button>
        </header>

        <section className="mb-5 grid gap-4 md:grid-cols-2">
          <StatsCard
            variant="hero"
            titulo="Valor da unidade"
            valor={formatarMoeda(valorUnidadeBase)}
            grande
            icone={modoInvestidor ? null : gearBtnHero(abrirEdicaoPesquisa)}
          />
          <StatsCard
            variant="hero"
            titulo="Valor da unidade com correção"
            valor={formatarMoeda(valorUnidadeComCorrecao)}
            grande
            icone={modoInvestidor ? null : gearBtnHero(abrirEdicaoPesquisa)}
          />
        </section>

        <section className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatsCard titulo="Valor máximo" valor={formatarMoeda(statsUnidades.precoMax)} />
          <StatsCard titulo="Valor médio" valor={formatarMoeda(statsUnidades.precoMedio)} destaque />
          <StatsCard titulo="Valor mínimo" valor={formatarMoeda(statsUnidades.precoMin)} />
        </section>

        <section className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatsCard titulo="Área máxima" valor={formatarArea(statsUnidades.areaMax)} iconeEsquerda={<IconePredio />} />
          <StatsCard
            titulo="Área média"
            valor={formatarArea(statsUnidades.areaMedia)}
            destaque
            iconeEsquerda={<IconePredio />}
          />
          <StatsCard titulo="Área mínima" valor={formatarArea(statsUnidades.areaMin)} iconeEsquerda={<IconePredio />} />
        </section>

        <p className="mb-8 max-w-3xl text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Unidade: média R$/m² das amostras de <span className="font-medium text-slate-600">unidade</span> ×{' '}
          {fmtAreaMetodo(areaUnidadeM2)}. &quot;Valor da unidade&quot; sem fator de correção; &quot;com correção&quot;
          aplica {config.fatorCorrecaoPercent}% (ícone da engrenagem).
        </p>

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
                precoMedio={statsUnidades.precoMedio}
                camadaTerreno={camadaTerreno}
                camadaPrecos={camadaPrecos}
                camadaServicos={camadaServicos}
                visivelPorId={visivelPorId}
                alcanceTerrenos={alcanceTerrenos}
                mostrarNomes={mostrarNomes}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
