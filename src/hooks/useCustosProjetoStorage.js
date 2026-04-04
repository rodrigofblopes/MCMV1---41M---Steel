import { useCallback, useEffect, useMemo, useState } from 'react'
import { CENTROS_CUSTO_INICIAIS } from '../data/centrosCustoIniciais.js'

const STORAGE_KEY = 'mcmv1-43m2-custos-v3'

function cloneIniciais() {
  return CENTROS_CUSTO_INICIAIS.map((c) => ({ ...c }))
}

function carregar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { items: cloneIniciais(), updatedAt: null }
    }
    const p = JSON.parse(raw)
    if (!p || typeof p !== 'object' || !Array.isArray(p.items)) {
      return { items: cloneIniciais(), updatedAt: null }
    }
    const items = p.items
      .filter((x) => x && typeof x === 'object' && x.nome && (x.tipo === 'orcado' || x.tipo === 'despesas'))
      .map((x) => ({
        id: String(x.id),
        nome: String(x.nome),
        tipo: x.tipo,
        valor: Number(x.valor) || 0,
        percentual: x.percentual || null,
      }))
    return {
      items: items.length ? items : cloneIniciais(),
      updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : null,
    }
  } catch {
    return { items: cloneIniciais(), updatedAt: null }
  }
}

export function useCustosProjetoStorage() {
  const [state, setState] = useState(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota */
    }
  }, [state])

  const adicionarCentro = useCallback((centro) => {
    const id = centro.id || `cc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setState((prev) => ({
      items: [
        ...prev.items,
        {
          id,
          nome: centro.nome,
          tipo: centro.tipo,
          valor: Number(centro.valor) || 0,
          percentual: centro.percentual || null,
        },
      ],
      updatedAt: Date.now(),
    }))
  }, [])

  const salvarAgora = useCallback(() => {
    setState((prev) => ({ ...prev, updatedAt: Date.now() }))
  }, [])

  const substituirTodos = useCallback((novosCentros) => {
    const next = {
      items: novosCentros.map((centro) => ({
        id: centro.id || `cc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        nome: centro.nome,
        tipo: centro.tipo,
        valor: Number(centro.valor) || 0,
        percentual: centro.percentual || null,
      })),
      updatedAt: Date.now(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* quota */
    }
    setState(next)
  }, [])

  return useMemo(
    () => ({
      items: state.items,
      updatedAt: state.updatedAt,
      adicionarCentro,
      salvarAgora,
      substituirTodos,
    }),
    [state.items, state.updatedAt, adicionarCentro, salvarAgora, substituirTodos],
  )
}
