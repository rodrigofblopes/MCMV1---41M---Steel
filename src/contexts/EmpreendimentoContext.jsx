import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { imovelSujeitoExemplo } from '../data/imovelSujeitoExemplo.js'

const STORAGE_KEY = 'mcmv1-43m2-empreendimento-v2'

const Ctx = createContext(null)

function padraoArmazenamento() {
  const { id: _id, ...rest } = imovelSujeitoExemplo
  return {
    ...rest,
    mapsLink: '',
    /** Quantidade de unidades do empreendimento (sincroniza com a Viabilidade ao salvar). */
    unidades: '',
  }
}

function carregarInicial() {
  // Limpar todos os dados antigos do projeto
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.includes('avalia-imoveis') || key.includes('Casa 53') || key.includes('Steel')) {
        localStorage.removeItem(key)
      }
    })
  } catch {
    /* ignora */
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && typeof p === 'object') {
        const lat = Number(p.lat)
        const lng = Number(p.lng)
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          const base = padraoArmazenamento()
          return {
            nome: String(p.nome ?? base.nome),
            nomeProjeto: String(p.nomeProjeto ?? base.nomeProjeto),
            areaTerreno: Number(p.areaTerreno) || base.areaTerreno,
            endereco: String(p.endereco ?? base.endereco),
            lat,
            lng,
            mapsLink: String(p.mapsLink ?? ''),
            unidades: p.unidades != null ? String(p.unidades) : base.unidades,
          }
        }
      }
    }
  } catch {
    /* ignora */
  }
  return padraoArmazenamento()
}

export function EmpreendimentoProvider({ children }) {
  const [dados, setDados] = useState(() => carregarInicial())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
    } catch {
      /* quota */
    }
  }, [dados])

  const salvarEmpreendimento = useCallback((patch) => {
    setDados((prev) => ({ ...prev, ...patch }))
  }, [])

  const sujeito = useMemo(
    () => ({
      id: 'sujeito',
      nome: dados.nome,
      nomeProjeto: dados.nomeProjeto,
      areaTerreno: dados.areaTerreno,
      endereco: dados.endereco,
      lat: dados.lat,
      lng: dados.lng,
      mapsLink: dados.mapsLink || undefined,
    }),
    [dados],
  )

  const value = useMemo(
    () => ({
      dados,
      sujeito,
      salvarEmpreendimento,
    }),
    [dados, sujeito, salvarEmpreendimento],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEmpreendimento() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useEmpreendimento deve ser usado dentro de EmpreendimentoProvider')
  return v
}
