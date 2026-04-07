import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MapSidebar from '../components/map/MapSidebar.jsx'
import MapView from '../components/map/MapView.jsx'
import AmostrasTable from '../components/table/AmostrasTable.jsx'
import { useAmostras } from '../contexts/AmostrasContext.jsx'
import { useEmpreendimento } from '../contexts/EmpreendimentoContext.jsx'
import { useNovaAmostraModal } from '../contexts/NovaAmostraModalContext.jsx'
import { calcularEstatisticas } from '../utils/calculos.js'

/** Fallback: Loteamento Sevilha (BR-364), alinhado ao `imovelSujeitoExemplo`. */
const CENTRO_FALLBACK_SEVILHA = [-8.8044348, -63.8092988]
const ZOOM_INICIAL = 14

export default function Mapa() {
  const { amostras, removeAmostra } = useAmostras()
  const { sujeito } = useEmpreendimento()
  const { abrirNovaAmostra } = useNovaAmostraModal()
  const location = useLocation()
  const navigate = useNavigate()
  const [camadaTerreno, setCamadaTerreno] = useState(true)
  const [camadaPrecos, setCamadaPrecos] = useState(true)
  const [camadaServicos, setCamadaServicos] = useState(false)
  const [alcanceTerrenos, setAlcanceTerrenos] = useState(true)
  const [mostrarNomes, setMostrarNomes] = useState(false)
  const [visivelPorId, setVisivelPorId] = useState({})

  const statsUnidadesPreco = useMemo(() => calcularEstatisticas(amostras, 'unidade'), [amostras])

  const centroMapa = useMemo(() => {
    const lat = Number(sujeito?.lat)
    const lng = Number(sujeito?.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    return CENTRO_FALLBACK_SEVILHA
  }, [sujeito?.lat, sujeito?.lng])

  useEffect(() => {
    if (!location.state?.openNovaAmostra) return
    abrirNovaAmostra()
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.state, location.pathname, abrirNovaAmostra, navigate])

  function toggleVisivelAmostra(id) {
    setVisivelPorId((prev) => {
      const visivel = prev[id] !== false
      return { ...prev, [id]: !visivel }
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col text-[#1e293b]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Mapa da proposta</h1>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-3 md:flex-row md:gap-0 md:p-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm md:flex-row">
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
          onRemoverAmostra={removeAmostra}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden">
            <MapView
            arredondarMapa={false}
            className="rounded-none border-0 shadow-none"
            centro={centroMapa}
            zoomInicial={ZOOM_INICIAL}
            sujeito={sujeito}
            amostras={amostras}
            precoMedio={statsUnidadesPreco.precoMedio}
            camadaTerreno={camadaTerreno}
            camadaPrecos={camadaPrecos}
            camadaServicos={camadaServicos}
            visivelPorId={visivelPorId}
            alcanceTerrenos={alcanceTerrenos}
            mostrarNomes={mostrarNomes}
            />
          </div>
        </div>
      </div>

      <div className="max-h-[40vh] shrink-0 overflow-y-auto border-t border-slate-200 bg-[#f0f4f8] p-3">
        <AmostrasTable
          amostras={amostras}
          sujeito={sujeito}
          onAdicionar={abrirNovaAmostra}
          onRemover={removeAmostra}
        />
      </div>
    </div>
  )
}
