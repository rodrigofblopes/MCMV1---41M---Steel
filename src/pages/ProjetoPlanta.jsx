import TabelasEquivalenciaNBR12721 from '../components/projeto/TabelasEquivalenciaNBR12721.jsx'
import { AREA_CONSTRUIDA_REF_TEXTO } from '../constants/areaProjeto.js'

function publicAsset(path) {
  const rel = path.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/' || base === '') return `/${rel}`
  const root = base.endsWith('/') ? base.slice(0, -1) : base
  return `${root}/${rel}`
}

export default function ProjetoPlanta() {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Planta baixa</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tipologia da unidade (área construída de referência {AREA_CONSTRUIDA_REF_TEXTO} m², conforme planta e
            memorial): distribuição dos ambientes e áreas indicadas no desenho, para leitura conjunta com a vista 3D,
            os custos por etapa CUB e a pesquisa de mercado.
          </p>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <img
            src={publicAsset('images/planta-baixa.png')}
            alt="Planta baixa: sala de estar, dois quartos, circulação, W.C., cozinha e varanda, com áreas em m²."
            className="mx-auto block w-full max-h-[min(85vh,920px)] object-contain object-center"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-500">
            Planta técnica — dimensões e cotas conforme projeto arquitetônico.
          </figcaption>
        </figure>

        <TabelasEquivalenciaNBR12721 />
      </div>
    </main>
  )
}
