import { extrairCoordenadas } from '../../utils/coordenadas.js'

export default function CoordenadaInput({
  mapsLink,
  onMapsLinkChange,
  lat,
  lng,
  onLatChange,
  onLngChange,
}) {
  function aplicarUrl(texto) {
    const coords = extrairCoordenadas(texto)
    if (!coords || Number.isNaN(coords.lat) || Number.isNaN(coords.lng)) return
    onLatChange(String(coords.lat))
    onLngChange(String(coords.lng))
  }

  function handleMapsPaste(e) {
    const texto = e.clipboardData.getData('text')
    aplicarUrl(texto)
  }

  function handleMapsBlur() {
    aplicarUrl(mapsLink)
  }

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6">
      <h2 className="text-sm font-semibold text-[#1e293b]">Localização</h2>
      <p className="text-sm leading-relaxed text-slate-600">
        Para obter lat/lng, abra o ponto no{' '}
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#22c55e] underline-offset-2 hover:underline"
        >
          Google Maps
        </a>
        , use <span className="font-medium">Compartilhar</span> ou copie o link da barra de endereços. Ao colar o
        link abaixo, as coordenadas são preenchidas automaticamente quando possível.
      </p>

      <div>
        <label htmlFor="maps-link" className="mb-1.5 block text-sm font-medium text-slate-700">
          Link do Google Maps
        </label>
        <input
          id="maps-link"
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://www.google.com/maps/@-8.78,-63.90,17z"
          value={mapsLink}
          onChange={(e) => onMapsLinkChange(e.target.value)}
          onPaste={handleMapsPaste}
          onBlur={handleMapsBlur}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1e293b] shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/25"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lat" className="mb-1.5 block text-sm font-medium text-slate-700">
            Latitude
          </label>
          <input
            id="lat"
            type="number"
            step="any"
            inputMode="decimal"
            value={lat}
            onChange={(e) => onLatChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1e293b] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/25"
          />
        </div>
        <div>
          <label htmlFor="lng" className="mb-1.5 block text-sm font-medium text-slate-700">
            Longitude
          </label>
          <input
            id="lng"
            type="number"
            step="any"
            inputMode="decimal"
            value={lng}
            onChange={(e) => onLngChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1e293b] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/25"
          />
        </div>
      </div>
    </div>
  )
}
