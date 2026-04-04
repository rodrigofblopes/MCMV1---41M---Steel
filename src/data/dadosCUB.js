/** Dados do CUB (Custo Unitário Básico) - Fevereiro 2026 - Rondônia */

export const TIPOS_CONSTRUCAO = {
  // RESIDENCIAIS - PADRÃO NORMAL
  'R1N': {
    codigo: 'R1N',
    nome: 'Residência Unifamiliar Padrão Normal',
    descricao: '1 pavimento, 3 dormitórios (1 suíte), banheiro social, sala, cozinha, área de serviço e varanda',
    valor: 2626.12,
    categoria: 'residencial',
    padrao: 'normal'
  },
  'R8N': {
    codigo: 'R8N', 
    nome: 'Residência Multifamiliar Padrão Normal (8 pav.)',
    descricao: 'Garagem, pilotis e 8 pavimentos-tipo. Apartamentos com 3 dormitórios (1 suíte)',
    valor: 2334.56,
    categoria: 'residencial',
    padrao: 'normal'
  },
  'R16N': {
    codigo: 'R16N',
    nome: 'Residência Multifamiliar Padrão Normal (16 pav.)',
    descricao: 'Garagem, pilotis e 16 pavimentos-tipo. Apartamentos com 3 dormitórios (1 suíte)',
    valor: 2309.88,
    categoria: 'residencial',
    padrao: 'normal'
  },
  
  // RESIDENCIAIS - PADRÃO BAIXO
  'R1B': {
    codigo: 'R1B',
    nome: 'Residência Unifamiliar Padrão Baixo',
    descricao: '1 pavimento, 2 dormitórios, sala, banheiro, cozinha e área para tanque',
    valor: 2382.78,
    categoria: 'residencial',
    padrao: 'baixo'
  },
  'R8B': {
    codigo: 'R8B',
    nome: 'Residência Multifamiliar Padrão Baixo (8 pav.)',
    descricao: 'Térreo e 7 pavimentos-tipo. Apartamentos com 2 dormitórios',
    valor: 2289.95,
    categoria: 'residencial',
    padrao: 'baixo'
  },
  
  // RESIDENCIAIS - PADRÃO ALTO
  'R1A': {
    codigo: 'R1A',
    nome: 'Residência Unifamiliar Padrão Alto',
    descricao: '1 pavimento, 4 dormitórios (1 suíte com closet), salas, cozinha e área completa',
    valor: 3512.64,
    categoria: 'residencial',
    padrao: 'alto'
  },
  'R8A': {
    codigo: 'R8A',
    nome: 'Residência Multifamiliar Padrão Alto (8 pav.)',
    descricao: 'Garagem, pilotis e 8 pavimentos-tipo. Apartamentos com 4 dormitórios (1 suíte com closet)',
    valor: 2896.04,
    categoria: 'residencial',
    padrao: 'alto'
  },
  'R16A': {
    codigo: 'R16A',
    nome: 'Residência Multifamiliar Padrão Alto (16 pav.)',
    descricao: 'Garagem, pilotis e 16 pavimentos-tipo. Apartamentos com 4 dormitórios (1 suíte com closet)',
    valor: 3072.39,
    categoria: 'residencial',
    padrao: 'alto'
  },

  // COMERCIAIS
  'CSL8N': {
    codigo: 'CSL8N',
    nome: 'Comercial Salas e Lojas Padrão Normal (8 pav.)',
    descricao: 'Garagem, térreo com lojas e 8 pavimentos com salas',
    valor: 2376.01,
    categoria: 'comercial',
    padrao: 'normal'
  },
  'CSL8A': {
    codigo: 'CSL8A',
    nome: 'Comercial Salas e Lojas Padrão Alto (8 pav.)',
    descricao: 'Garagem, térreo com lojas e 8 pavimentos com salas - acabamento superior',
    valor: 2612.45,
    categoria: 'comercial',
    padrao: 'alto'
  },
  'CAL8N': {
    codigo: 'CAL8N',
    nome: 'Comercial Andares Livres Padrão Normal (8 pav.)',
    descricao: 'Garagem, térreo com lojas e 8 andares corridos',
    valor: 3004.30,
    categoria: 'comercial',
    padrao: 'normal'
  },

  // OUTROS
  'RP1Q': {
    codigo: 'RP1Q',
    nome: 'Residência Popular',
    descricao: '1 pavimento, 1 dormitório, sala, banheiro e cozinha',
    valor: 2207.09,
    categoria: 'popular',
    padrao: 'básico'
  },
  'GI': {
    codigo: 'GI',
    nome: 'Galpão Industrial',
    descricao: 'Galpão com área administrativa, banheiros, vestiário e depósito',
    valor: 1295.48,
    categoria: 'industrial',
    padrao: 'básico'
  }
}

/** Percentuais de custo por etapa baseados na documentação técnica */
export const PERCENTUAIS_ETAPAS = {
  'canteiro-despesas': { nome: 'Canteiro e Despesas Gerais', percentual: 1.5 },
  'servicos-preliminares': { nome: 'Serviços Preliminares', percentual: 1.0 },
  'fundacao': { nome: 'Fundação', percentual: 6.0 },
  'estrutura': { nome: 'Estrutura', percentual: 16.0 },
  'alvenaria': { nome: 'Alvenaria', percentual: 3.0 },
  'revestimentos': { nome: 'Revestimentos de Cimento', percentual: 3.0 },
  'inst-eletricas': { nome: 'Instalações Elétricas', percentual: 2.5 },
  'inst-hidraulicas': { nome: 'Instalações Hidráulicas', percentual: 1.5 },
  'inst-especiais': { nome: 'Instalações Especiais', percentual: 1.0 },
  'impermeabilizacao': { nome: 'Impermeabilização', percentual: 4.0 },
  'esquadrias': { nome: 'Esquadrias', percentual: 15.0 },
  'cobertura': { nome: 'Cobertura', percentual: 2.0 },
  'revestimentos-pisos': { nome: 'Revestimentos e Pisos', percentual: 18.0 },
  'pintura': { nome: 'Pintura', percentual: 3.0 },
  'luminotecnica': { nome: 'Luminotécnica', percentual: 5.0 },
  'marmoraria-loucas': { nome: 'Marmoraria e Louças', percentual: 6.0 },
  'forro-gesso': { nome: 'Forro de Gesso', percentual: 4.0 },
  'pavimentacao-externa': { nome: 'Pavimentação Externa', percentual: 2.0 },
  'limpeza-bf': { nome: 'Limpeza e BF', percentual: 1.0 },
  'locacao-equipamentos': { nome: 'Locação de Equipamentos', percentual: 1.5 },
  /** Ajuste para totalizar 100% (antes 99,5% gerava divergência com o total CUB). */
  'diversos': { nome: 'Diversos', percentual: 3.0 }
}

/** Categorias para organização na interface */
export const CATEGORIAS_CUB = {
  'residencial': { 
    nome: 'Residencial', 
    cor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '🏠'
  },
  'comercial': { 
    nome: 'Comercial', 
    cor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '🏢'
  },
  'popular': { 
    nome: 'Popular', 
    cor: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: '🏘️'
  },
  'industrial': { 
    nome: 'Industrial', 
    cor: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: '🏭'
  }
}

export const PADROES = {
  baixo: { nome: 'Padrão Baixo', cor: 'text-amber-600' },
  normal: { nome: 'Padrão Normal', cor: 'text-blue-600' },
  alto: { nome: 'Padrão Alto', cor: 'text-emerald-600' },
  básico: { nome: 'Padrão Básico (popular)', cor: 'text-gray-600' },
}

/**
 * Unifamiliar — um código CUB por padrão de acabamento (projeto MCMV1 na calculadora simplificada).
 */
export const CUB_UNIFAMILIAR_POR_PADRAO = {
  baixo: 'R1B',
  normal: 'R1N',
  alto: 'R1A',
  básico: 'RP1Q',
}

/** Data de referência do CUB */
export const REFERENCIA_CUB = {
  mes: 'Fevereiro',
  ano: 2026,
  estado: 'Rondônia',
  fonte: 'SINDUSCON-RO'
}