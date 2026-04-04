import { formatarArea, formatarMoeda } from '../../utils/formatadores.js'

function IconeImovel({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 21V10l8-6 8 6v11h-5v-6H9v6H4zm9 0v-4h2v4h-2z" />
    </svg>
  )
}

/** Conteúdo do popup Leaflet ao clicar em uma amostra no mapa. */
export default function AmostraMapPopup({ amostra }) {
  const nome = amostra?.nome?.trim() || 'Amostra'
  const tipo = amostra?.tipo
  const preco = Number(amostra?.preco)
  const area = Number(amostra?.area)
  const q = Number(amostra?.quartos) || 0
  const b = Number(amostra?.banheiros) || 0
  const v = Number(amostra?.vagas) || 0

  if (tipo === 'servico') {
    return (
      <div className="avalia-amostra-popup-inner text-slate-800">
        <div className="flex gap-3 pr-7">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <IconeImovel className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Serviço</p>
            <h3 className="text-sm font-bold leading-snug text-slate-900">{nome}</h3>
            <p className="mt-2 text-xs text-slate-600">Ponto de referência no mapa (sem preço/área de unidade).</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="avalia-amostra-popup-inner text-slate-800">
      <div className="flex gap-3 pr-7">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          <IconeImovel className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          {tipo === 'terreno' ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/90">Terreno</p>
          ) : null}
          <h3 className="text-sm font-bold leading-snug text-slate-900">{nome}</h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-xs text-slate-500">Valor de Venda:</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {Number.isFinite(preco) && preco > 0 ? formatarMoeda(preco) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Área do Imóvel:</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {Number.isFinite(area) && area > 0 ? formatarArea(area) : '—'}
          </p>
        </div>
      </div>

      {tipo === 'terreno' ? null : (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {q} Quartos
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {b} Banheiros
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {v} Vagas
          </span>
        </div>
      )}
    </div>
  )
}
