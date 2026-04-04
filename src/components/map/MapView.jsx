import { MapContainer, ScaleControl, TileLayer, ZoomControl } from 'react-leaflet'
import BuscaEndereco from './BuscaEndereco.jsx'
import MarkerLayer from './MarkerLayer.jsx'
import ServiceLayer from './ServiceLayer.jsx'
import TerrenoSujeito from './TerrenoSujeito.jsx'

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export default function MapView({
  centro,
  zoomInicial,
  sujeito,
  amostras,
  precoMedio,
  camadaTerreno,
  camadaPrecos,
  camadaServicos,
  visivelPorId,
  alcanceTerrenos,
  mostrarNomes,
  mostrarNomesCompletos,
  layout = 'page',
  className = '',
  /** Quando false, o tile map encosta nas bordas (painel + mapa na mesma caixa). */
  arredondarMapa = true,
}) {
  const latServicos = sujeito?.lat ?? centro[0]
  const lngServicos = sujeito?.lng ?? centro[1]
  const sujeitoCoordsOk =
    sujeito &&
    Number.isFinite(Number(sujeito.lat)) &&
    Number.isFinite(Number(sujeito.lng))

  const embed = layout === 'embed'

  return (
    <div
      className={[
        'relative isolate w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-inner',
        embed
          ? 'h-full min-h-[360px]'
          : 'min-h-[420px] flex-1 shrink-0 basis-0 md:min-h-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <MapContainer
        center={centro}
        zoom={zoomInicial}
        className={[
          'z-0 h-full w-full',
          arredondarMapa ? 'rounded-xl' : 'rounded-none',
          embed ? '' : 'min-h-[420px]',
        ]
          .filter(Boolean)
          .join(' ')}
        style={embed ? { height: '100%', minHeight: 360 } : { minHeight: 420 }}
        scrollWheelZoom
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        <BuscaEndereco />
        <TerrenoSujeito
          sujeito={sujeito}
          camadaAtiva={camadaTerreno}
          exibirRaios={alcanceTerrenos}
          mostrarNomes={mostrarNomes}
          mostrarNomesCompletos={mostrarNomesCompletos}
        />
        <MarkerLayer
          amostras={amostras}
          precoMedio={precoMedio}
          camadaPrecos={camadaPrecos}
          visivelPorId={visivelPorId}
          mostrarNomes={mostrarNomes}
          mostrarNomesCompletos={mostrarNomesCompletos}
          modoAnaliseDistancia={alcanceTerrenos}
        />
        <ServiceLayer ativo={camadaServicos} latCentro={latServicos} lngCentro={lngServicos} />
      </MapContainer>
      {alcanceTerrenos && camadaTerreno && sujeitoCoordsOk ? (
        <div className="pointer-events-none absolute bottom-10 left-3 z-[1000] max-w-[200px] rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-[10px] shadow-md backdrop-blur-sm">
          <p className="mb-1.5 font-semibold text-slate-600">Análise em relação ao empreendimento</p>
          <p className="mb-1.5 text-[9px] leading-snug text-slate-500">
            Portfólio numerado no mapa; na tabela você vê distâncias (&lt;500m, &lt;1km ou fora).
          </p>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="h-2 w-2 shrink-0 rounded-full border-2 border-[#991b1b] bg-red-400/50" />
            <span>Raio de 500m</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-slate-700">
            <span
              className="h-2 w-4 shrink-0 rounded-sm border-2 border-dashed border-[#b91c1c] bg-red-400/30"
              aria-hidden
            />
            <span>Raio de 1000m</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
