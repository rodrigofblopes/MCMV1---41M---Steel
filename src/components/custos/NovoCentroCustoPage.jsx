import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEmpreendimento } from '../../contexts/EmpreendimentoContext.jsx'
import { useCustosProjetoStorage } from '../../hooks/useCustosProjetoStorage.js'
import { custosCub } from '../../routes/paths.js'

const MESES = [
  { value: '', label: 'Selecione…' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

function inputClass() {
  return 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#1e293b] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-slate-400 focus:ring-2 focus:ring-slate-200'
}

function selectClass() {
  return `${inputClass()} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`
}

export default function NovoCentroCustoPage() {
  const navigate = useNavigate()
  const { dados } = useEmpreendimento()
  const nomeProjeto = dados.nomeProjeto?.trim() || dados.nome?.trim() || 'Empreendimento'
  const { adicionarCentro } = useCustosProjetoStorage()

  const [nome, setNome] = useState('')
  const [tipoForm, setTipoForm] = useState('orcado')
  const [mesesPagar, setMesesPagar] = useState('1')
  const [mesInicio, setMesInicio] = useState('')
  const [redistribuir, setRedistribuir] = useState(false)

  function handleCriar(e) {
    e.preventDefault()
    const n = nome.trim()
    if (!n) return
    adicionarCentro({
      nome: n,
      tipo: tipoForm,
      valor: 0,
    })
    navigate(custosCub)
  }

  return (
    <div className="min-h-0 flex-1 bg-[#f0f4f8] px-4 py-6 text-[#1e293b] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to={custosCub}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          ← Voltar (Custos · CUB)
        </Link>

        <header className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">Novo Centro de Custo</h1>
          <nav className="mt-3 text-xs text-slate-500 sm:text-sm" aria-label="Navegação estrutural">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <li>
                <Link to="/apresentacao-investidor" className="text-[#00B37E] hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to="/empreendimento" className="text-[#00B37E] hover:underline">
                  {nomeProjeto}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to={custosCub} className="text-[#00B37E] hover:underline">
                  Custos · CUB
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-[#1e293b]">Novo Centro de Custo</li>
            </ol>
          </nav>
        </header>

        <form
          onSubmit={handleCriar}
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
            <h2 className="text-base font-bold text-[#1e293b]">Novo Centro de Custo</h2>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-8">
            <div>
              <label htmlFor="cc-nome" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Nome do Centro de Custo <span className="text-red-500">*</span>
              </label>
              <input
                id="cc-nome"
                type="text"
                required
                className={inputClass()}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do centro de custo"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-slate-500">Ex: Acabamento Externo, Ar Condicionado, etc.</p>
            </div>

            <div>
              <label htmlFor="cc-tipo" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Tipo
              </label>
              <div className="relative">
                <select
                  id="cc-tipo"
                  className={selectClass()}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                  value={tipoForm}
                  onChange={(e) => setTipoForm(e.target.value)}
                >
                  <option value="orcado">Custo Orçado</option>
                  <option value="despesas">Despesas</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-slate-500">Tipo de custo (Ex: Despesas, Custo Orçado)</p>
            </div>

            <div>
              <label htmlFor="cc-meses" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Meses para Pagar
              </label>
              <input
                id="cc-meses"
                type="text"
                inputMode="numeric"
                className={inputClass()}
                value={mesesPagar}
                onChange={(e) => setMesesPagar(e.target.value.replace(/\D/g, '') || '1')}
              />
              <p className="mt-1 text-xs text-slate-500">Número de meses para pagar este custo</p>
            </div>

            <div>
              <label htmlFor="cc-mes-inicio" className="mb-1.5 block text-sm font-semibold text-[#1e293b]">
                Mês de Início
              </label>
              <div className="relative">
                <select
                  id="cc-mes-inicio"
                  className={selectClass()}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                  value={mesInicio}
                  onChange={(e) => setMesInicio(e.target.value)}
                >
                  {MESES.map((m) => (
                    <option key={m.value || 'empty'} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-slate-500">Mês em que o custo começa a ser pago</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-4">
              <div className="flex items-start gap-3">
                <input
                  id="cc-redistribuir"
                  type="checkbox"
                  className="peer sr-only"
                  checked={redistribuir}
                  onChange={(e) => setRedistribuir(e.target.checked)}
                />
                <label
                  htmlFor="cc-redistribuir"
                  className="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-300 transition-colors peer-checked:bg-[#00B37E]"
                >
                  <span
                    className={[
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      redistribuir ? 'translate-x-5' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </label>
                <label htmlFor="cc-redistribuir" className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-semibold text-[#1e293b]">
                    Redistribuir pagamentos automaticamente
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Se marcado, os pagamentos serão recalculados com base nas novas configurações.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-8">
            <Link
              to={custosCub}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e293b] shadow-sm hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Criar Centro de Custo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
