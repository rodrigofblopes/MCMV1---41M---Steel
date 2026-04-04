/**
 * Extrai latitude e longitude de URLs do Google Maps.
 * Cobre: /@lat,lng, ?q=lat,lng e trechos !3d!4d comuns em links compartilhados.
 */
export function extrairCoordenadas(url) {
  if (!url || typeof url !== 'string') return null
  const s = url.trim()
  if (!s) return null

  const at = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (at) {
    return { lat: Number(at[1]), lng: Number(at[2]) }
  }

  const q = s.match(/[?&]q=(-?\d+(?:\.\d+)?),?\s*(-?\d+(?:\.\d+)?)/)
  if (q) {
    return { lat: Number(q[1]), lng: Number(q[2]) }
  }

  const d = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (d) {
    return { lat: Number(d[1]), lng: Number(d[2]) }
  }

  return null
}
