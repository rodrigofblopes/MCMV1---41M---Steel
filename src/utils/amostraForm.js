import { areaParaCampoTexto, precoParaCampoTexto } from './formatadores.js'

/** Converte amostra salva em valores para os campos do formulário. */
export function amostraParaCamposFormulario(a) {
  if (!a) return null
  return {
    nome: a.nome ?? '',
    preco: precoParaCampoTexto(a.preco),
    area: areaParaCampoTexto(a.area),
    quartos: a.quartos ?? 0,
    banheiros: a.banheiros ?? 0,
    vagas: a.vagas ?? 0,
    urlAnuncio: a.urlAnuncio ?? '',
    mapsLink: a.mapsLink ?? '',
    lat: a.lat != null && a.lat !== '' ? String(a.lat) : '',
    lng: a.lng != null && a.lng !== '' ? String(a.lng) : '',
  }
}
