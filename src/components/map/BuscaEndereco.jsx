import { useState } from 'react'
import { useMap } from 'react-leaflet'

function IconeLupa() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function BuscaEndereco() {
  const map = useMap()
  const [consulta, setConsulta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const q = consulta.trim()
    if (!q) return

    setCarregando(true)
    setErro('')
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', q)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '1')

      const res = await fetch(url.toString(), {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'MCMV14116m2/1.0 (pesquisa mercado imobiliario)',
        },
      })

      if (!res.ok) throw new Error('http')
      const data = await res.json()
      const hit = data[0]
      if (!hit) {
        setErro('Nenhum resultado.')
        return
      }
      const lat = parseFloat(hit.lat)
      const lon = parseFloat(hit.lon)
      map.flyTo([lat, lon], 16, { duration: 1.2 })
    } catch {
      setErro('Falha na busca. Tente de novo.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] w-[min(100%-2rem,32rem)] -translate-x-1/2 px-2">
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto flex items-center gap-2 overflow-hidden rounded-full border border-slate-200/90 bg-white pl-4 pr-1.5 shadow-md"
      >
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar endereço no mapa..."
          className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-[#1e293b] outline-none placeholder:text-slate-400"
          disabled={carregando}
        />
        <button
          type="submit"
          disabled={carregando}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00B37E] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Buscar no mapa"
        >
          {carregando ? <span className="text-lg leading-none">…</span> : <IconeLupa />}
        </button>
      </form>
      {erro ? <p className="pointer-events-auto mt-1 text-center text-xs text-red-600">{erro}</p> : null}
    </div>
  )
}
