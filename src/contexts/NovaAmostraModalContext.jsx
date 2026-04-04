import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const Ctx = createContext(null)

export function NovaAmostraModalProvider({ children }) {
  const [aberto, setAberto] = useState(false)

  const abrirNovaAmostra = useCallback(() => setAberto(true), [])
  const fecharNovaAmostra = useCallback(() => setAberto(false), [])

  const value = useMemo(
    () => ({
      aberto,
      abrirNovaAmostra,
      fecharNovaAmostra,
    }),
    [aberto, abrirNovaAmostra, fecharNovaAmostra],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNovaAmostraModal() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useNovaAmostraModal: use dentro de NovaAmostraModalProvider')
  return v
}

/** Sidebar também é usada em testes; fora do provider, retorna null. */
export function useNovaAmostraModalOptional() {
  return useContext(Ctx)
}
