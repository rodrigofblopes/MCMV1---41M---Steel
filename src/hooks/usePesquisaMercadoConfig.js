import { useCallback, useEffect, useMemo, useState } from 'react'
import { AREA_CONSTRUIDA_REF_TEXTO } from '../constants/areaProjeto.js'

const STORAGE_KEY = 'mcmv1-43m2-pesquisa-mercado-config-v4'

function padrao() {
  return {
    /** Percentual aplicado sobre o valor da unidade (ex.: 1,00 → +1%). */
    fatorCorrecaoPercent: '1,00',
    /** Área da unidade em m² (texto BR), usada com a média R$/m² das amostras — igual à planta. */
    areaUnidadeM2: AREA_CONSTRUIDA_REF_TEXTO,
  }
}

function carregar() {
  const base = padrao()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const p = JSON.parse(raw)
    if (!p || typeof p !== 'object') return base
    const areaLegada =
      p.areaUnidadeM2 != null && String(p.areaUnidadeM2).trim() !== ''
        ? String(p.areaUnidadeM2)
        : p.areaConstrucao != null && String(p.areaConstrucao).trim() !== ''
          ? String(p.areaConstrucao)
          : base.areaUnidadeM2
    return {
      ...base,
      fatorCorrecaoPercent: String(p.fatorCorrecaoPercent ?? base.fatorCorrecaoPercent),
      areaUnidadeM2: areaLegada,
    }
  } catch {
    return base
  }
}

export function usePesquisaMercadoConfig() {
  const [config, setConfigState] = useState(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* quota */
    }
  }, [config])

  const setConfig = useCallback((patch) => {
    setConfigState((prev) => ({ ...prev, ...patch }))
  }, [])

  return useMemo(() => ({ config, setConfig }), [config, setConfig])
}
