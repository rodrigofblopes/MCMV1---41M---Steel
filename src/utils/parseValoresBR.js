/** Converte texto de moeda BR (ex.: "1.234,56") em número. */
export function parseMoedaBR(valor) {
  if (valor == null || String(valor).trim() === '') return 0
  const s = String(valor).trim().replace(/\s/g, '')
  const normalizado = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, '')
  let n = Number(normalizado)
  if (Number.isFinite(n)) return n
  // Legado: após .replace('.', ',') em string pt-BR virava "1,234.567,89" (inválido)
  const lastComma = s.lastIndexOf(',')
  if (lastComma >= 0) {
    const frac = s.slice(lastComma + 1).replace(/\D/g, '')
    if (frac.length > 0 && frac.length <= 2) {
      const intDigits = s.slice(0, lastComma).replace(/\D/g, '')
      n = Number(`${intDigits}.${frac}`)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

/** Converte percentual em texto "12,5" → 12.5 */
export function parsePercentBR(valor) {
  if (valor == null || String(valor).trim() === '') return 0
  return parseMoedaBR(valor)
}
