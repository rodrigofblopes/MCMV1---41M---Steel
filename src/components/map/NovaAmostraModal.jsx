import { useEffect, useState } from 'react'
import CadastrarUnidade from '../forms/CadastrarUnidade.jsx'
import { useAmostras } from '../../contexts/AmostrasContext.jsx'
import { useNovaAmostraModal } from '../../contexts/NovaAmostraModalContext.jsx'

const TIPOS = [
  {
    id: 'terreno',
    titulo: 'Terreno',
    descricao: 'Lotes e áreas para estudo de raio e potencial.',
    icone: (
      <svg className="h-10 w-10 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'unidade',
    titulo: 'Unidade',
    descricao: 'Aptos, casas, salas e unidades privativas.',
    icone: (
      <svg className="h-10 w-10 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 21h18M6 21V10l6-4 6 4v11M9 21v-4h6v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'servico',
    titulo: 'Serviço',
    descricao: 'Comércio, escolas, serviços e outros pontos.',
    icone: (
      <svg className="h-10 w-10 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
]

const TITULOS_PASSO2 = {
  terreno: 'Cadastrar Terreno',
  unidade: 'Cadastrar Unidade',
  servico: 'Cadastrar Serviço',
}

function proximoIdAmostra(amostras) {
  return amostras.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1
}

export default function NovaAmostraModal() {
  const { aberto, fecharNovaAmostra } = useNovaAmostraModal()
  const { amostras, addAmostra } = useAmostras()
  const [passo, setPasso] = useState(1)
  const [tipo, setTipo] = useState(null)

  const nextId = proximoIdAmostra(amostras)

  useEffect(() => {
    if (!aberto) {
      setPasso(1)
      setTipo(null)
    }
  }, [aberto])

  function fechar() {
    fecharNovaAmostra()
  }

  function escolherTipo(t) {
    setTipo(t)
    setPasso(2)
  }

  function voltarTipo() {
    setPasso(1)
    setTipo(null)
  }

  function salvar(payload) {
    addAmostra({ ...payload, tipo: payload.tipo || tipo || 'unidade' })
    fechar()
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-amostra-titulo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fechar()
      }}
    >
      <div
        className="flex max-h-[min(92dvh,720px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="nova-amostra-titulo" className="text-lg font-semibold text-[#1e293b] sm:text-xl">
                Incluir amostra na proposta
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {passo === 1
                  ? 'Passo 1 de 2 — Tipo de imóvel comparável'
                  : 'Passo 2 de 2 — Dados para o portfólio ao investidor'}
              </p>
            </div>
            <button
              type="button"
              onClick={fechar}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#1e293b]"
              aria-label="Fechar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex h-1.5 gap-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={['h-full rounded-full transition-all duration-300', passo >= 1 ? 'flex-1 bg-[#00B37E]' : 'w-0'].join(' ')}
            />
            <div
              className={['h-full rounded-full transition-all duration-300', passo >= 2 ? 'flex-1 bg-[#00B37E]' : 'flex-1 bg-slate-200'].join(' ')}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {passo === 1 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {TIPOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => escolherTipo(item.id)}
                  className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:border-[#00B37E]/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B37E]"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50">{item.icone}</div>
                  <span className="text-sm font-bold text-[#1e293b]">{item.titulo}</span>
                  <span className="mt-2 text-xs leading-snug text-slate-600">{item.descricao}</span>
                </button>
              ))}
            </div>
          ) : (
            <CadastrarUnidade
              key={tipo}
              variant={tipo}
              layout="embed"
              tituloSecao={TITULOS_PASSO2[tipo]}
              nomePlaceholder={
                tipo === 'terreno'
                  ? `Terreno #${nextId}`
                  : tipo === 'servico'
                    ? `Serviço #${nextId}`
                    : `Amostra #${nextId}`
              }
              onVoltar={voltarTipo}
              onSalvar={salvar}
              textoBotaoSalvar="Salvar"
            />
          )}
        </div>
      </div>
    </div>
  )
}
