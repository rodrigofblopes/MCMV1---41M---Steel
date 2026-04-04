import L from 'leaflet'
import { Circle, Marker, Popup, Tooltip } from 'react-leaflet'
import { formatarArea } from '../../utils/formatadores.js'

const iconeTerrenoSujeito = L.divIcon({
  className: 'avalia-marcador-terreno-sujeito',
  html: `<div style="background:#1e3a8a;width:26px;height:26px;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;line-height:1;font-weight:700">★</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

function textoAreaTerreno(sujeito) {
  const a = Number(sujeito?.areaTerreno)
  return Number.isFinite(a) && a > 0 ? formatarArea(a) : '—'
}

/**
 * Camada do imóvel sujeito: marcador próprio + raios 500 m / 1000 m (opcional).
 * Os círculos somem com o toggle; o marcador permanece enquanto a camada Terreno estiver ativa.
 */
export default function TerrenoSujeito({
  sujeito,
  camadaAtiva,
  exibirRaios,
  mostrarNomes,
  mostrarNomesCompletos,
}) {
  if (!camadaAtiva || !sujeito) return null

  const lat = Number(sujeito.lat)
  const lng = Number(sujeito.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const nomeProjeto = sujeito.nomeProjeto?.trim() || sujeito.nome || 'Terreno sujeito'
  const endereco = sujeito.endereco?.trim() || '—'

  return (
    <>
      {exibirRaios ? (
        <>
          <Circle
            center={[lat, lng]}
            radius={1000}
            pathOptions={{
              color: '#b91c1c',
              fillColor: '#ef4444',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '8 4',
            }}
          >
            <Tooltip direction="top" opacity={0.9}>
              Raio de 1000m
            </Tooltip>
          </Circle>
          <Circle
            center={[lat, lng]}
            radius={500}
            pathOptions={{
              color: '#991b1b',
              fillColor: '#f87171',
              fillOpacity: 0.22,
              weight: 2,
            }}
          >
            <Tooltip direction="top" opacity={0.9}>
              Raio de 500m
            </Tooltip>
          </Circle>
        </>
      ) : null}

      <Marker position={[lat, lng]} icon={iconeTerrenoSujeito}>
        <Popup className="avalia-popup-terreno" minWidth={260} maxWidth={320}>
          <div className="avalia-terreno-popup-inner space-y-2 text-sm text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projeto</p>
            <p className="font-bold text-slate-900">{nomeProjeto}</p>
            <div className="border-t border-slate-100 pt-2">
              <p className="text-xs text-slate-500">Área do terreno</p>
              <p className="font-semibold text-slate-800">{textoAreaTerreno(sujeito)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Endereço</p>
              <p className="leading-snug text-slate-800">{endereco}</p>
            </div>
          </div>
        </Popup>
        {exibirRaios || mostrarNomes ? (
          <Tooltip direction="top" offset={[0, -10]} opacity={0.95} permanent>
            {mostrarNomesCompletos && mostrarNomes
              ? nomeProjeto
              : exibirRaios
                ? nomeProjeto.length > 34
                  ? `${nomeProjeto.slice(0, 34)}…`
                  : nomeProjeto
                : 'Terreno sujeito'}
          </Tooltip>
        ) : null}
      </Marker>
    </>
  )
}
