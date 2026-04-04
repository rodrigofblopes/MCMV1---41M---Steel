export const formatarMoeda = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarArea = (v) => `${v.toFixed(1)} m²`

/** Valor numérico → texto para o campo de preço (ex.: 190000 → "190.000,00"). */
export function precoParaCampoTexto(v) {
  if (v == null || Number.isNaN(Number(v))) return ''
  return Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Área numérica → texto com vírgula decimal (ex.: 57 → "57"). */
export function areaParaCampoTexto(v) {
  if (v == null || Number.isNaN(Number(v))) return ''
  const n = Number(v)
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}
