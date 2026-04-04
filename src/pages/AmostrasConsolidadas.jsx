import AmostrasTable from '../components/table/AmostrasTable.jsx'
import { useAmostras } from '../contexts/AmostrasContext.jsx'
import { useEmpreendimento } from '../contexts/EmpreendimentoContext.jsx'
import { useNovaAmostraModal } from '../contexts/NovaAmostraModalContext.jsx'

export default function AmostrasConsolidadas() {
  const { amostras, removeAmostra } = useAmostras()
  const { sujeito } = useEmpreendimento()
  const { abrirNovaAmostra } = useNovaAmostraModal()

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-[#1e293b] sm:text-2xl">
          Portfólio de amostras da proposta
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Comparáveis de mercado que sustentam a apresentação do empreendimento ao investidor — os mesmos dados do
          mapa e do painel. Você pode <strong className="font-semibold text-slate-700">incluir</strong> ou{' '}
          <strong className="font-semibold text-slate-700">excluir</strong> amostras conforme quiser participar do
          processo.
        </p>
      </div>

      <AmostrasTable
        amostras={amostras}
        sujeito={sujeito}
        ocultarTituloNoCard
        onAdicionar={abrirNovaAmostra}
        onRemover={removeAmostra}
      />
    </main>
  )
}
