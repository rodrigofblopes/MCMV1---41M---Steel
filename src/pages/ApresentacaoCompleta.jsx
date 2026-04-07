import DashboardPage from '../components/dashboard/DashboardPage.jsx'
import AmostrasTable from '../components/table/AmostrasTable.jsx'
import { useAmostras } from '../contexts/AmostrasContext.jsx'
import { useEmpreendimento } from '../contexts/EmpreendimentoContext.jsx'

export default function ApresentacaoCompleta() {
  const { amostras } = useAmostras()
  const { sujeito } = useEmpreendimento()

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc]">
      <section className="border-b border-slate-200">
        <DashboardPage />
      </section>

      <section id="portfolio-amostras" className="scroll-mt-4 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Portfólio detalhado de amostras
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Comparáveis de mercado que fundamentam a análise do empreendimento nesta apresentação ao investidor.
            </p>
          </div>

          <AmostrasTable
            amostras={amostras}
            sujeito={sujeito}
            ocultarTituloNoCard
            somenteLeitura
          />
        </div>
      </section>
    </main>
  )
}
