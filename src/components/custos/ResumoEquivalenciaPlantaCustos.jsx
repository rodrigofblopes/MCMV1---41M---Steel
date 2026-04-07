import { Link } from 'react-router-dom'
import { projetoPlanta } from '../../routes/paths.js'
import { AREA_CONSTRUIDA_REF_M2 } from '../../constants/areaProjeto.js'
import { formatarMoeda } from '../../utils/formatadores.js'

/**
 * Indicativo área memorial × CUB/m² (a área aparece no cartão acima).
 */
export default function ResumoEquivalenciaPlantaCustos({ cubPorM2 }) {
  const areaRefM2 = AREA_CONSTRUIDA_REF_M2
  const indicativo =
    cubPorM2 != null && Number.isFinite(cubPorM2) && cubPorM2 > 0
      ? areaRefM2 * cubPorM2
      : null

  return (
    <div className="mt-4 rounded-xl border border-violet-200/80 bg-violet-50/40 p-4 text-sm text-slate-700 shadow-sm">
      <p className="font-semibold text-[#1e293b]">Indicativo de custo (área memorial × CUB/m²)</p>
      {indicativo != null ? (
        <p className="mt-2 text-xs text-slate-600">
          Com o CUB/m² do padrão aplicado:{' '}
          <span className="font-semibold text-violet-900">{formatarMoeda(indicativo)}</span>
          <span className="text-slate-500"> — confrontar com a soma das etapas na tabela.</span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Quando o CUB/m² da referência estiver disponível, o indicativo aparece aqui automaticamente.
        </p>
      )}
      <p className="mt-2">
        <Link
          to={projetoPlanta}
          className="text-xs font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900"
        >
          Ver planta baixa →
        </Link>
      </p>
    </div>
  )
}
