import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import Cena3DEmpreendimento from '../components/apresentacao/Cena3DEmpreendimento.jsx'
import { useEmpreendimento } from '../contexts/EmpreendimentoContext.jsx'

function joinBaseUrl(path) {
  const p = path.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/' || base === '') return `/${p}`
  const root = base.endsWith('/') ? base.slice(0, -1) : base
  return `${root}/${p}`
}

/** GLB em public/models/ → URL /models/41M.glb (respeita BASE_URL do Vite). */
const MODELO_GLB = 'models/41M.glb'

export default function Apresentacao3D() {
  const containerRef = useRef(null)
  const { dados } = useEmpreendimento()
  const nomeProjeto = dados.nomeProjeto?.trim() || dados.nome?.trim() || 'Empreendimento'
  /** Em produção, ?v=timestamp muda a cada build (vite.config) para não ficar o GLB antigo em cache. */
  const modelUrl = useMemo(() => {
    const baseUrl = joinBaseUrl(MODELO_GLB)
    const bust = import.meta.env.VITE_MODEL_ASSET_BUST
    return bust ? `${baseUrl}?v=${bust}` : baseUrl
  }, [])

  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [modelUrl])

  const [camadas, setCamadas] = useState([])
  const [visCamada, setVisCamada] = useState({})

  const handleCamadasReady = useCallback((lista) => {
    setCamadas(lista)
    setVisCamada((prev) => {
      const next = { ...prev }
      for (const c of lista) {
        if (next[c.id] === undefined) next[c.id] = true
      }
      return next
    })
  }, [])

  const toggleCamada = useCallback((id) => {
    setVisCamada((v) => ({ ...v, [id]: v[id] === false }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d4d4d8]">
      <div
        ref={containerRef}
        className="relative flex min-h-[calc(100dvh-12.5rem-env(safe-area-inset-bottom,0px)-env(safe-area-inset-top,0px))] flex-1 flex-col md:min-h-[calc(100dvh-8rem)]"
      >
        <div className="absolute inset-0">
          <Cena3DEmpreendimento
            modelUrls={[modelUrl]}
            layerVisibility={visCamada}
            onLayersReady={handleCamadasReady}
          />
        </div>

        {camadas.length > 0 ? (
          <div
            className="pointer-events-auto absolute left-2 top-[4.25rem] z-[8] max-h-[min(50vh,340px)] w-[min(86vw,188px)] overflow-y-auto rounded-lg border border-white/[0.08] bg-black/20 p-2 text-left shadow-none backdrop-blur-md transition-[background-color,border-color,opacity] duration-300 hover:border-white/[0.12] hover:bg-black/35 sm:left-3 sm:top-[4.5rem] sm:w-[min(88vw,200px)]"
            aria-label="Etapas do modelo"
          >
            <p className="mb-1.5 text-[9px] font-medium tracking-wide text-white/45">Etapas</p>
            <ul className="flex flex-col gap-1.5">
              {camadas.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-xs text-white/65 transition-colors hover:text-white/85">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/25 bg-white/5 text-[#00B37E]/80 accent-[#00B37E] focus:ring-1 focus:ring-white/20"
                      checked={visCamada[c.id] !== false}
                      onChange={() => toggleCamada(c.id)}
                    />
                    <span className="leading-snug">{c.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-1 bg-gradient-to-b from-black/25 to-transparent px-4 pb-10 pt-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">Apresentação</p>
          <h1 className="pointer-events-auto max-w-3xl text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl">
            {nomeProjeto}
          </h1>
        </div>

        <div className="pointer-events-auto absolute bottom-[max(1rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] right-3 z-10 flex flex-col gap-2 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[44px] rounded-full border border-white/30 bg-[#0f172a]/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Tela cheia
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-[max(4.5rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] left-3 z-10 max-w-[min(200px,45vw)] text-[10px] leading-snug text-slate-700/95 drop-shadow-sm sm:bottom-4 sm:left-4 sm:max-w-[200px] sm:text-slate-600/90">
          Arraste · zoom · rotação automática
        </p>
      </div>
    </div>
  )
}
