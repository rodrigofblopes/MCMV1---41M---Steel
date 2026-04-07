import { parseSinapiMoeda } from './sinapiDistribuicaoEtapas.js'

/** Primeiro segmento do código de item (ex.: "2.1.3" → "2"). */
export function raizItemSinapi(item) {
  const s = String(item ?? '').trim()
  const d = s.indexOf('.')
  return d === -1 ? s : s.slice(0, d)
}

/**
 * Agrega linhas `servico` por etapa da planilha sintética SINAPI (seções com item "1", "2", … sem ponto).
 * Não usa CUB nem orçamento unitário — só a estrutura do JSON SINAPI.
 */
export function agregarSinapiLinhasPorEtapa(linhas) {
  const lista = Array.isArray(linhas) ? linhas : []
  const secoesRaiz = lista.filter((l) => l.tipo === 'secao' && /^\d+$/.test(String(l.item).trim()))
  secoesRaiz.sort((a, b) => Number(a.item) - Number(b.item))

  const servicos = lista.filter((l) => l.tipo === 'servico')

  const rows = secoesRaiz.map((sec) => {
    const id = String(sec.item).trim()
    const subs = servicos.filter((s) => raizItemSinapi(s.item) === id)
    const valor = subs.reduce((sum, s) => sum + parseSinapiMoeda(s.total), 0)
    const mo = subs.reduce((sum, s) => sum + parseSinapiMoeda(s.totalMO), 0)
    const mat = subs.reduce((sum, s) => sum + parseSinapiMoeda(s.totalMAT), 0)
    return {
      id,
      nome: (sec.descricao || `Etapa ${id}`).trim(),
      valor,
      mo,
      mat,
    }
  })

  const totalValor = rows.reduce((s, r) => s + r.valor, 0)
  const totalMO = rows.reduce((s, r) => s + r.mo, 0)
  const totalMAT = rows.reduce((s, r) => s + r.mat, 0)

  return { rows, totalValor, totalMO, totalMAT }
}
