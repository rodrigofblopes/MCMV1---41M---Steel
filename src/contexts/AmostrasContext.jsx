import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { amostrasExemplo } from '../data/amostrasExemplo.js'

/** v9: 17 comparáveis com lat/lng (planilha Bairro Novo / Sevilha), como antes da remoção de coordenadas. */
const STORAGE_KEY = 'mcmv1-43m2-amostras-v9'

const Ctx = createContext(null)

function carregarInicial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((a) => a && a.id != null && a.preco != null && a.area != null)) {
        return parsed
      }
    }
  } catch {
    /* ignora JSON inválido */
  }
  return amostrasExemplo.map((a) => ({ ...a }))
}

export function AmostrasProvider({ children }) {
  const [amostras, setAmostras] = useState(carregarInicial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(amostras))
    } catch {
      /* quota / privado */
    }
  }, [amostras])

  const addAmostra = useCallback((payload) => {
    setAmostras((prev) => {
      const maxId = prev.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0)
      const id = maxId + 1
      const nome = payload.nome?.trim() || `Amostra #${id}`
      const lat = Number(payload.lat)
      const lng = Number(payload.lng)
      const tipoRaw = payload.tipo
      const tipo =
        tipoRaw === 'terreno' || tipoRaw === 'servico' || tipoRaw === 'unidade' ? tipoRaw : 'unidade'
      const novo = {
        id,
        nome,
        tipo,
        area: Number(payload.area),
        preco: Number(payload.preco),
        quartos: Number(payload.quartos) || 0,
        banheiros: Number(payload.banheiros) || 0,
        vagas: Number(payload.vagas) || 0,
        lat: Number.isFinite(lat) ? lat : -8.8044348,
        lng: Number.isFinite(lng) ? lng : -63.8092988,
      }
      if (payload.urlAnuncio) novo.urlAnuncio = payload.urlAnuncio
      if (payload.mapsLink) novo.mapsLink = payload.mapsLink
      return [...prev, novo]
    })
  }, [])

  const removeAmostra = useCallback((id) => {
    setAmostras((prev) => prev.filter((a) => String(a.id) !== String(id)))
  }, [])

  const updateAmostra = useCallback((id, payload) => {
    setAmostras((prev) =>
      prev.map((a) => {
        if (String(a.id) !== String(id)) return a
        const lat = Number(payload.lat)
        const lng = Number(payload.lng)
        const tipoRaw = payload.tipo
        const tipoNext =
          tipoRaw === 'terreno' || tipoRaw === 'servico' || tipoRaw === 'unidade'
            ? tipoRaw
            : a.tipo || 'unidade'
        const next = {
          ...a,
          nome: payload.nome?.trim() || `Amostra #${a.id}`,
          tipo: tipoNext,
          area: Number(payload.area),
          preco: Number(payload.preco),
          quartos: Number(payload.quartos) || 0,
          banheiros: Number(payload.banheiros) || 0,
          vagas: Number(payload.vagas) || 0,
          lat: Number.isFinite(lat) ? lat : a.lat,
          lng: Number.isFinite(lng) ? lng : a.lng,
        }
        if (payload.urlAnuncio?.trim()) next.urlAnuncio = payload.urlAnuncio.trim()
        else delete next.urlAnuncio
        if (payload.mapsLink?.trim()) next.mapsLink = payload.mapsLink.trim()
        else delete next.mapsLink
        return next
      }),
    )
  }, [])

  const value = useMemo(
    () => ({
      amostras,
      setAmostras,
      addAmostra,
      updateAmostra,
      removeAmostra,
    }),
    [amostras, addAmostra, updateAmostra, removeAmostra],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAmostras() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAmostras: use dentro de AmostrasProvider')
  return v
}
