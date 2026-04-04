/**
 * Referência: ABNT NBR 12721:2005 — seção 5.7 (área equivalente) e 5.7.3 (coeficientes médios),
 * para quando não há demonstração por custo orçado (5.7.2.1.3).
 * O coeficiente exato por dependência = (custo unitário da dependência) / (CUB ou custo unitário básico de referência).
 */

/** Itens 5.7.3 — letras (a) a (n), com faixas indicadas na norma. */
export const COEFICIENTES_MEDIOS_NBR12721 = [
  { id: 'a', dependencia: 'Garagem (subsolo)', coeficienteTexto: '0,50 a 0,75' },
  { id: 'b', dependencia: 'Área privativa (unidade autônoma padrão)', coeficienteTexto: '1,00' },
  { id: 'c', dependencia: 'Área privativa — salas com acabamento', coeficienteTexto: '1,00' },
  { id: 'd', dependencia: 'Área privativa — salas sem acabamento', coeficienteTexto: '0,75 a 0,90' },
  { id: 'e', dependencia: 'Área de loja sem acabamento', coeficienteTexto: '0,40 a 0,60' },
  { id: 'f', dependencia: 'Varandas', coeficienteTexto: '0,75 a 1,00' },
  { id: 'g', dependencia: 'Terraços ou áreas descobertas sobre lajes', coeficienteTexto: '0,30 a 0,60' },
  { id: 'h', dependencia: 'Estacionamento sobre terreno', coeficienteTexto: '0,05 a 0,10' },
  { id: 'i', dependencia: 'Área de projeção do terreno sem benfeitoria', coeficienteTexto: '0,00' },
  {
    id: 'j',
    dependencia: 'Área de serviço — residência unifamiliar padrão baixo (aberta)',
    coeficienteTexto: '0,50',
  },
  { id: 'k', dependencia: 'Barrilete', coeficienteTexto: '0,50 a 0,75' },
  { id: 'l', dependencia: "Caixa d'água", coeficienteTexto: '0,50 a 0,75' },
  { id: 'm', dependencia: 'Casa de máquinas', coeficienteTexto: '0,50 a 0,75' },
  { id: 'n', dependencia: 'Piscinas, quintais, etc.', coeficienteTexto: '0,50 a 0,75' },
]

/**
 * Ambientes da planta baixa MCMV (áreas úteis indicadas no desenho — soma ≈ 36,28 m²).
 * Classificação para equivalência: dependências internas cobertas padrão → item (b); varanda → item (f).
 */
export const AMBIENTES_PLANTA_MCMV = [
  { nome: 'Sala de estar', areaRealM2: 9.57, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  { nome: 'Quarto', areaRealM2: 8.02, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  { nome: 'Quarto 2', areaRealM2: 8.01, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  { nome: 'Circulação', areaRealM2: 1.08, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  { nome: 'W.C.', areaRealM2: 2.14, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  { nome: 'Cozinha', areaRealM2: 4.61, itemNorma: 'b', descricaoNorma: 'Área privativa (unidade padrão)', coefMin: 1, coefMax: 1, coefAdotado: 1 },
  {
    nome: 'Varanda',
    areaRealM2: 2.85,
    itemNorma: 'f',
    descricaoNorma: 'Varandas (faixa na norma)',
    coefMin: 0.75,
    coefMax: 1.0,
    /** Valor médio ilustrativo; ajustar conforme acabamento e orçamento (5.7.2). */
    coefAdotado: 0.875,
  },
]

export function somarAreasReais(lista = AMBIENTES_PLANTA_MCMV) {
  return lista.reduce((s, a) => s + a.areaRealM2, 0)
}

export function somarAreasEquivalentes(lista = AMBIENTES_PLANTA_MCMV) {
  return lista.reduce((s, a) => s + a.areaRealM2 * a.coefAdotado, 0)
}
