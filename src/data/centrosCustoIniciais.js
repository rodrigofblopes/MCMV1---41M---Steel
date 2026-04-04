/** Centros de custo padrão (Custos do Projeto) — edite valores conforme o orçamento; área de referência da planta em constants/areaProjeto.js */
export const CENTROS_CUSTO_INICIAIS = [
  // Etapas da obra com valores reais do orçamento
  { id: 'mob-desp-gerais', nome: 'Mob. e Desp. Gerais', tipo: 'despesas', valor: 5514.85, percentual: '1,5%' },
  { id: 'servicos-preliminares', nome: 'Serv. Preliminares', tipo: 'orcado', valor: 3676.57, percentual: '1,0%' },
  { id: 'fundacoes', nome: 'Fundações', tipo: 'orcado', valor: 22059.41, percentual: '6,0%' },
  { id: 'estrutura', nome: 'Estrutura', tipo: 'orcado', valor: 58825.09, percentual: '16,0%' },
  { id: 'vedacoes', nome: 'Vedações', tipo: 'orcado', valor: 22059.41, percentual: '6,0%' },
  { id: 'rev-cimento', nome: 'Rev. Cimento', tipo: 'orcado', valor: 14706.27, percentual: '4,0%' },
  { id: 'inst-eletricas', nome: 'Inst. Elétricas', tipo: 'orcado', valor: 9191.42, percentual: '2,5%' },
  { id: 'inst-hidro', nome: 'Inst. Hidro', tipo: 'orcado', valor: 5514.85, percentual: '1,5%' },
  { id: 'inst-especiais', nome: 'Inst. Especiais', tipo: 'orcado', valor: 0, percentual: '0,0%' },
  { id: 'impermeabilizacoes', nome: 'Impermeabilizações', tipo: 'orcado', valor: 14706.27, percentual: '4,0%' },
  { id: 'revest-pisos', nome: 'Revest. e Pisos', tipo: 'orcado', valor: 66178.22, percentual: '18,0%' },
  { id: 'cobertura', nome: 'Cobertura', tipo: 'orcado', valor: 7353.14, percentual: '2,0%' },
  { id: 'esquadrias', nome: 'Esquadrias', tipo: 'orcado', valor: 55148.52, percentual: '15,0%' },
  { id: 'luminotecnica', nome: 'Luminotécnica', tipo: 'orcado', valor: 18382.84, percentual: '5,0%' },
  { id: 'marmoraria-loucas', nome: 'Marmoraria e Louças', tipo: 'orcado', valor: 22059.41, percentual: '6,0%' },
  { id: 'forro-gesso', nome: 'Forro de Gesso', tipo: 'orcado', valor: 14706.27, percentual: '4,0%' },
  { id: 'pintura', nome: 'Pintura', tipo: 'orcado', valor: 11029.70, percentual: '3,0%' },
  { id: 'pav-externa', nome: 'Pav. Externa', tipo: 'orcado', valor: 7353.14, percentual: '2,0%' },
  { id: 'limpeza-bf', nome: 'Limpeza e BF', tipo: 'orcado', valor: 3676.57, percentual: '1,0%' },
  { id: 'locacao-equip', nome: 'Locação de Equip.', tipo: 'orcado', valor: 5514.85, percentual: '1,5%' },
  { id: 'itens-especiais', nome: 'Itens Especiais', tipo: 'orcado', valor: 0, percentual: '0,0%' },
]

export const LABEL_TIPO = {
  orcado: 'Custo Orçado',
  despesas: 'Despesas',
}
