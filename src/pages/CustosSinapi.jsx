import { Link } from 'react-router-dom'
import { custosCub } from '../routes/paths.js'

export default function CustosSinapi() {
  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-4 py-10 text-[#1e293b] sm:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Custos · SINAPI</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Em breve</h1>
        <p className="mt-3 text-sm text-slate-600">
          Secção para orçamentação e etapas com composições SINAPI, em paralelo ao trilho{' '}
          <strong>CUB</strong>.
        </p>
        <Link
          to={custosCub}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
        >
          Voltar para CUB
        </Link>
      </div>
    </div>
  )
}
