import { AREA_CONSTRUIDA_REF_TEXTO } from '../constants/areaProjeto.js'

/** Terreno sujeito — Loteamento Sevilha (mesma base do projeto Casas Conjugada — Sevilha). */
const rotuloArea = `${AREA_CONSTRUIDA_REF_TEXTO} m²`

export const imovelSujeitoExemplo = {
  id: 'sujeito',
  nome: `MCMV1 — ${rotuloArea} — Loteamento Sevilha (terreno sujeito)`,
  nomeProjeto: `MCMV1 — ${rotuloArea}`,
  areaTerreno: 360,
  endereco: 'BR 364, Loteamento Sevilha — Porto Velho, RO',
  lat: -8.8044348,
  lng: -63.8092988,
}
