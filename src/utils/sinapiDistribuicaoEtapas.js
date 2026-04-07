import { parseMoedaBR } from './parseValoresBR.js'

/**
 * Valores exportados da planilha SINAPI misturam formatos:
 * - BR: 25.641,66 ou seções 9.726,01
 * - US com milhar em vírgula: 3,912.16 ; 91,784.75
 * - US só com ponto decimal (muito comum em totalMO/totalMAT): 571.44 ; 145.95
 *
 * parseMoedaBR sem vírgula trata todo ponto como milhar e apaga — "571.44" virava 57144.
 */
export function parseSinapiMoeda(str) {
  if (str == null || String(str).trim() === '') return 0
  const t = String(str).trim().replace(/\s/g, '')
  const hasComma = t.includes(',')
  const hasDot = t.includes('.')
  if (hasComma && hasDot) {
    const lastComma = t.lastIndexOf(',')
    const lastDot = t.lastIndexOf('.')
    if (lastDot > lastComma) {
      const n = Number(t.replace(/,/g, ''))
      if (Number.isFinite(n)) return n
    }
    return parseMoedaBR(t)
  }
  if (hasComma && !hasDot) {
    return parseMoedaBR(t)
  }
  if (hasDot) {
    const usMilharEdecimal = t.match(/^(\d{1,3}(?:\.\d{3})*)(?:\.(\d{1,2}))?$/)
    if (usMilharEdecimal) {
      const intPart = usMilharEdecimal[1].replace(/\./g, '')
      const frac = usMilharEdecimal[2]
      const n =
        frac != null && frac !== '' ? Number(`${intPart}.${frac}`) : Number(intPart)
      if (Number.isFinite(n)) return n
    }
    const umPontoDecimal = t.match(/^(\d+)\.(\d{1,2})$/)
    if (umPontoDecimal) {
      const n = Number(`${umPontoDecimal[1]}.${umPontoDecimal[2]}`)
      if (Number.isFinite(n)) return n
    }
  }
  return parseMoedaBR(t)
}
