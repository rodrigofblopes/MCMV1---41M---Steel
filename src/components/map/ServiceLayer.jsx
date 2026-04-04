import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

const MOCK_POIS = [
  { id: 'mock-1', nome: 'Escola Municipal (exemplo)', tipo: 'Escola', lat: -8.7542, lng: -63.8948 },
  { id: 'mock-2', nome: 'UPA / Pronto-socorro (exemplo)', tipo: 'Hospital', lat: -8.7588, lng: -63.8992 },
  { id: 'mock-3', nome: 'Supermercado (exemplo)', tipo: 'Supermercado', lat: -8.7525, lng: -63.8975 },
  { id: 'mock-4', nome: 'Ponto de ônibus (exemplo)', tipo: 'Transporte', lat: -8.7571, lng: -63.901 },
]

function montarQueryOverpass(lat, lng, raioM = 1000) {
  return `[out:json][timeout:25];
(
  node["amenity"="school"](around:${raioM},${lat},${lng});
  node["amenity"="hospital"](around:${raioM},${lat},${lng});
  node["amenity"="clinic"](around:${raioM},${lat},${lng});
  node["shop"="supermarket"](around:${raioM},${lat},${lng});
  node["amenity"="bus_station"](around:${raioM},${lat},${lng});
);
out body;`
}

function normalizarPois(elements) {
  return (elements || [])
    .filter((el) => el.type === 'node' && el.lat != null && el.lon != null)
    .slice(0, 100)
    .map((el) => {
      const tags = el.tags || {}
      const nome = tags.name || tags['name:pt'] || tags['name:en'] || 'Sem nome'
      const tipo =
        tags.amenity === 'school'
          ? 'Escola'
          : tags.amenity === 'hospital' || tags.amenity === 'clinic'
            ? 'Saúde'
            : tags.shop === 'supermarket'
              ? 'Supermercado'
              : tags.amenity === 'bus_station'
                ? 'Transporte'
                : tags.amenity || tags.shop || 'Serviço'
      return {
        id: `osm-${el.id}`,
        nome,
        tipo,
        lat: el.lat,
        lng: el.lon,
      }
    })
}

export default function ServiceLayer({ ativo, latCentro, lngCentro }) {
  const [pois, setPois] = useState([])

  const icone = useMemo(
    () =>
      L.divIcon({
        className: 'avalia-marcador-servico',
        html: '<div style="width:11px;height:11px;border-radius:50%;background:#7c3aed;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>',
        iconSize: [15, 15],
        iconAnchor: [7, 7],
      }),
    [],
  )

  useEffect(() => {
    if (!ativo || latCentro == null || lngCentro == null) {
      setPois([])
      return
    }

    const lat = latCentro
    const lng = lngCentro
    let cancelado = false
    const query = montarQueryOverpass(lat, lng)
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('overpass'))))
      .then((data) => {
        if (cancelado) return
        const lista = normalizarPois(data.elements)
        setPois(lista.length > 0 ? lista : MOCK_POIS)
      })
      .catch(() => {
        if (cancelado) return
        setPois(MOCK_POIS)
      })

    return () => {
      cancelado = true
    }
  }, [ativo, latCentro, lngCentro])

  if (!ativo) return null

  return pois.map((p) => (
    <Marker key={p.id} position={[p.lat, p.lng]} icon={icone}>
      <Popup>
        <div className="min-w-[140px] text-sm text-slate-800">
          <p className="font-semibold">{p.nome}</p>
          <p className="text-xs capitalize text-slate-500">{p.tipo}</p>
        </div>
      </Popup>
    </Marker>
  ))
}
