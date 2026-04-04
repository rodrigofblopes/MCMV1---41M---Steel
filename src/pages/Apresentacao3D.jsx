import { useCallback, useEffect, useMemo, useRef } from 'react'
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

/** GLB na raiz de public/ → URL /41M.glb (respeita BASE_URL do Vite). */
const MODELO_GLB = '41M.glb'

function urlModelo3D() {
  return joinBaseUrl(MODELO_GLB)
}

export default function Apresentacao3D() {
  const containerRef = useRef(null)
  const { dados } = useEmpreendimento()
  const nomeProjeto = dados.nomeProjeto?.trim() || dados.nome?.trim() || 'Empreendimento'
  const modelUrl = useMemo(() => urlModelo3D(), [])

  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [modelUrl])

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
          <Cena3DEmpreendimento modelUrls={[modelUrl]} />
        </div>

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
